import { initServer } from '@ts-rest/fastify';
import { fastify } from 'fastify';
import mongoose, { type HydratedDocument } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Document, User, Tag, type IUser, type ITag, db } from '../db';
import { documentsRouter } from './documents';

const app = fastify();
const s = initServer();

app.register(s.plugin(documentsRouter));

let testUser: HydratedDocument<IUser>;
let testTag1: HydratedDocument<ITag>;
let testTag2: HydratedDocument<ITag>;

beforeAll(async () => {
  await db;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Document.deleteMany({});
  await User.deleteMany({});
  await Tag.deleteMany({});
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
  });
  testTag1 = await Tag.create({ name: 'JavaScript' });
  testTag2 = await Tag.create({ name: 'TypeScript' });
});

describe('Documents API', () => {
  describe('POST /api/documents', () => {
    it('should create a new document', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        payload: {
          name: 'Test Document',
          content: 'This is test content',
          author: testUser._id.toString(),
          tags: [testTag1._id.toString()],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test Document',
        content: 'This is test content',
        author: testUser._id.toString(),
      });
      expect(body.tags).toEqual([testTag1._id.toString()]);
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('should create a document without tags', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        payload: {
          name: 'Test Document',
          content: 'This is test content',
          author: testUser._id.toString(),
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test Document',
        content: 'This is test content',
        author: testUser._id.toString(),
      });
      expect(body.tags).toEqual([]);
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
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
      });
      await Document.create({
        name: 'Doc 2',
        content: 'Content 2',
        author: testUser._id,
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
  });

  describe('GET /api/documents/:id', () => {
    it('should return a document by id', async () => {
      const document = await Document.create({
        name: 'Test Doc',
        content: 'Test Content',
        author: testUser._id,
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
        content: 'Original Content',
        author: testUser._id,
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/documents/${document._id}`,
        payload: {
          name: 'Updated Name',
          content: 'Updated Content',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: document._id.toString(),
        name: 'Updated Name',
        content: 'Updated Content',
      });
    });

    it('should update only specified fields', async () => {
      const document = await Document.create({
        name: 'Original Name',
        content: 'Original Content',
        author: testUser._id,
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
        content: 'Original Content',
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
