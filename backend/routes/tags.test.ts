import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { fastify } from 'fastify';
import { initServer } from '@ts-rest/fastify';
import { tagsRouter } from './tags';
import { Tag, db } from '../db';
import mongoose from 'mongoose';

const app = fastify();
const s = initServer();

app.register(s.plugin(tagsRouter));

beforeAll(async () => {
  await db;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Tag.deleteMany({});
});

describe('Tags API', () => {
  describe('POST /api/tags', () => {
    it('should create a new tag', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tags',
        payload: {
          name: 'JavaScript',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'JavaScript',
      });
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('should return 400 for duplicate tag name', async () => {
      await Tag.create({ name: 'JavaScript' });

      const response = await app.inject({
        method: 'POST',
        url: '/api/tags',
        payload: {
          name: 'JavaScript',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tags',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/tags', () => {
    it('should return all tags', async () => {
      await Tag.create({ name: 'JavaScript' });
      await Tag.create({ name: 'TypeScript' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/tags',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({ name: 'JavaScript' });
      expect(body[1]).toMatchObject({ name: 'TypeScript' });
    });

    it('should return empty array when no tags exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/tags',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual([]);
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should return a tag by id', async () => {
      const tag = await Tag.create({ name: 'JavaScript' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/tags/${tag._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: tag._id.toString(),
        name: 'JavaScript',
      });
    });

    it('should return 404 for non-existent tag', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'GET',
        url: `/api/tags/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Tag not found');
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update a tag', async () => {
      const tag = await Tag.create({ name: 'JavaScript' });

      // Verify tag exists in DB
      const foundTag = await Tag.findById(tag._id);
      expect(foundTag).toBeDefined();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/tags/${tag._id}`,
        payload: {
          name: 'ECMAScript',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: tag._id.toString(),
        name: 'ECMAScript',
      });
    });

    it('should return 404 for non-existent tag', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'PUT',
        url: `/api/tags/${fakeId}`,
        payload: {
          name: 'Updated Tag',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Tag not found');
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete a tag', async () => {
      const tag = await Tag.create({ name: 'JavaScript' });

      // Verify tag exists in DB
      const foundTag = await Tag.findById(tag._id);
      expect(foundTag).toBeDefined();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/tags/${tag._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Tag deleted successfully');

      const deletedTag = await Tag.findById(tag._id);
      expect(deletedTag).toBeNull();
    });

    it('should return 404 for non-existent tag', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/tags/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Tag not found');
    });
  });
});
