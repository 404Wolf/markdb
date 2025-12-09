import mongoose, { type HydratedDocument } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fastify } from 'fastify';
import { initServer } from '@ts-rest/fastify';
import { db, type ISchema, type ITag, type IUser } from '../db';
import { User } from '../db/schemas/User';
import { Tag } from '../db/schemas/Tag';
import { Schema } from '../db/schemas/Schema';
import { Document } from '../db/schemas/Document';
import { documentsRouter } from './documents';
import { schemasRouter } from './schemas';

const app = fastify();
const s = initServer();

app.register(s.plugin(documentsRouter));
app.register(s.plugin(schemasRouter));

let testUser: HydratedDocument<IUser>;
let testTag1: HydratedDocument<ITag>;
let testSchema: HydratedDocument<ISchema>;

beforeAll(async () => {
  await db;
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Document.deleteMany({});
  await User.deleteMany({});
  await Tag.deleteMany({});
  await Schema.deleteMany({});
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  testTag1 = await Tag.create({ name: 'JavaScript' });
  testSchema = await Schema.create({ name: 'Test Schema', content: '# Test' });
});

describe('Documents API', () => {
  describe('POST /api/documents', () => {
    it('should create a new document', async () => {
      const schemaResponse = await app.inject({
        method: 'POST',
        url: '/api/schemas',
        payload: {
          name: 'Test Schema',
          content: '# Test',
        },
      });
      expect(schemaResponse.statusCode).toBe(201);

      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        payload: {
          name: 'Test Document',
          content: '# Test',
          author: testUser._id.toString(),
          tags: [testTag1._id.toString()],
          schemaId: JSON.parse(schemaResponse.body)._id,
        },
      });

      if (response.statusCode !== 201) {
        console.log('Response body:', response.body);
      }

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test Document',
        content: '# Test',
        author: testUser._id.toString(),
      });
      expect(body.tags).toEqual([testTag1._id.toString()]);
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.extracted).toBeDefined();
    });

    it('should create a document without tags', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        payload: {
          name: 'Test Document',
          content: '# Test',
          author: testUser._id.toString(),
          schemaId: testSchema._id.toString(),
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test Document',
        content: '# Test',
        author: testUser._id.toString(),
      });
      expect(body.tags).toEqual([]);
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.extracted).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        payload: {
          name: 'Test Document',
        },
      });

      expect(response.statusCode).toBe(400);
      // ts-rest validation errors are returned, just check we got a 400
    });
  });

  describe('GET /api/documents', () => {
    it('should return all documents', async () => {
      await Document.create({
        name: 'Doc 1',
        content: 'Content 1',
        author: testUser._id,
        schemaId: testSchema._id,
      });
      await Document.create({
        name: 'Doc 2',
        content: 'Content 2',
        author: testUser._id,
        schemaId: testSchema._id,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/documents',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({ name: 'Doc 1', content: 'Content 1' });
      expect(body[1]).toMatchObject({ name: 'Doc 2', content: 'Content 2' });
    });

    it('should return empty array when no documents exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/documents',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual([]);
    });

    it('should filter documents by tag', async () => {
      const testTag2 = await Tag.create({ name: 'TypeScript' });

      await Document.create({
        name: 'Doc 1',
        content: 'Content 1',
        author: testUser._id,
        schemaId: testSchema._id,
        tags: [testTag1._id],
      });
      await Document.create({
        name: 'Doc 2',
        content: 'Content 2',
        author: testUser._id,
        schemaId: testSchema._id,
        tags: [testTag2._id],
      });
      await Document.create({
        name: 'Doc 3',
        content: 'Content 3',
        author: testUser._id,
        schemaId: testSchema._id,
        tags: [testTag1._id, testTag2._id],
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents?tagId=${testTag1._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({ name: 'Doc 1' });
      expect(body[1]).toMatchObject({ name: 'Doc 3' });
    });

    it('should return empty array when no documents match the tag filter', async () => {
      const testTag2 = await Tag.create({ name: 'TypeScript' });

      await Document.create({
        name: 'Doc 1',
        content: 'Content 1',
        author: testUser._id,
        schemaId: testSchema._id,
        tags: [testTag1._id],
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents?tagId=${testTag2._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual([]);
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return a document by id', async () => {
      const document = await Document.create({
        name: 'Test Doc',
        content: 'Test Content',
        author: testUser._id,
        schemaId: testSchema._id,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents/${document._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: document._id.toString(),
        name: 'Test Doc',
        content: 'Test Content',
      });
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'GET',
        url: `/api/documents/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Document not found');
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update a document', async () => {
      const document = await Document.create({
        name: 'Original Name',
        content: '# Test',
        author: testUser._id,
        schemaId: testSchema._id,
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/documents/${document._id}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: document._id.toString(),
        name: 'Updated Name',
        content: '# Test',
      });
    });

    it('should update only specified fields', async () => {
      const document = await Document.create({
        name: 'Original Name',
        content: '# Test',
        author: testUser._id,
        schemaId: testSchema._id,
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/documents/${document._id}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: document._id.toString(),
        name: 'Updated Name',
        content: '# Test',
      });
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'PUT',
        url: `/api/documents/${fakeId}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Document not found');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete a document', async () => {
      const document = await Document.create({
        name: 'Test Doc',
        content: 'Test Content',
        author: testUser._id,
        schemaId: testSchema._id,
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/documents/${document._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Document deleted successfully');

      const deletedDoc = await Document.findById(document._id);
      expect(deletedDoc).toBeNull();
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/documents/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Document not found');
    });
  });
});
