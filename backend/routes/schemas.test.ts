import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { fastify } from 'fastify';
import { initServer } from '@ts-rest/fastify';
import { schemasRouter } from './schemas';
import { Schema, db } from '../db';
import mongoose from 'mongoose';

const app = fastify();
const s = initServer();

app.register(s.plugin(schemasRouter));

beforeAll(async () => {
  await db;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Schema.deleteMany({});
});

describe('Schemas API', () => {
  describe('POST /api/schemas', () => {
    it('should create a new schema', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/schemas',
        payload: {
          name: 'Test Schema',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'Test Schema',
      });
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/schemas',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      // ts-rest validation errors are returned, just check we got a 400
    });
  });

  describe('GET /api/schemas', () => {
    it('should return all schemas', async () => {
      await Schema.create({ name: 'Schema 1' });
      await Schema.create({ name: 'Schema 2' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/schemas',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({ name: 'Schema 1' });
      expect(body[1]).toMatchObject({ name: 'Schema 2' });
    });

    it('should return empty array when no schemas exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/schemas',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual([]);
    });
  });

  describe('GET /api/schemas/:id', () => {
    it('should return a schema by id', async () => {
      const schema = await Schema.create({ name: 'Test Schema' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/schemas/${schema._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: schema._id.toString(),
        name: 'Test Schema',
      });
    });

    it('should return 404 for non-existent schema', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'GET',
        url: `/api/schemas/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Schema not found');
    });
  });

  describe('PUT /api/schemas/:id', () => {
    it('should update a schema', async () => {
      const schema = await Schema.create({ name: 'Original Name' });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/schemas/${schema._id}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: schema._id.toString(),
        name: 'Updated Name',
      });
    });

    it('should return 404 for non-existent schema', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'PUT',
        url: `/api/schemas/${fakeId}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Schema not found');
    });
  });

  describe('DELETE /api/schemas/:id', () => {
    it('should delete a schema', async () => {
      const schema = await Schema.create({ name: 'Test Schema' });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/schemas/${schema._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Schema deleted successfully');

      const deletedSchema = await Schema.findById(schema._id);
      expect(deletedSchema).toBeNull();
    });

    it('should return 404 for non-existent schema', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/schemas/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Schema not found');
    });
  });
});
