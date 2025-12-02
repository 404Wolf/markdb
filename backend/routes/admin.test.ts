import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { fastify } from 'fastify';
import { initServer } from '@ts-rest/fastify';
import { adminRouter } from './admin';
import { User, Schema, Document, Tag, db } from '../db';
import { Extracted } from '../db/schemas/Extracted';
import mongoose from 'mongoose';
import { env } from '../env';

const app = fastify();
const s = initServer();

app.register(s.plugin(adminRouter));

beforeAll(async () => {
  await db;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Schema.deleteMany({}),
    Document.deleteMany({}),
    Tag.deleteMany({}),
    Extracted.deleteMany({}),
  ]);
});

describe('Admin API', () => {
  describe('POST /api/admin/wipe', () => {
    it('should wipe all data with correct password', async () => {
      // Create some test data
      await Promise.all([
        User.create({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
        Schema.create({ name: 'Test Schema', content: 'test content' }),
        Document.create({ 
          name: 'Test Doc', 
          content: 'test content', 
          author: new mongoose.Types.ObjectId(),
          schemaId: new mongoose.Types.ObjectId(),
          tags: [] 
        }),
        Tag.create({ name: 'Test Tag' }),
      ]);

      // Verify data exists
      expect(await User.countDocuments()).toBeGreaterThan(0);
      expect(await Schema.countDocuments()).toBeGreaterThan(0);
      expect(await Document.countDocuments()).toBeGreaterThan(0);
      expect(await Tag.countDocuments()).toBeGreaterThan(0);

      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/wipe',
        payload: {
          password: env.ADMIN_PASSWORD,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Database wiped successfully');
      expect(body.deletedCounts).toBeDefined();
      expect(body.deletedCounts.users).toBeGreaterThan(0);
      expect(body.deletedCounts.schemas).toBeGreaterThan(0);
      expect(body.deletedCounts.documents).toBeGreaterThan(0);
      expect(body.deletedCounts.tags).toBeGreaterThan(0);

      // Verify all data is deleted
      expect(await User.countDocuments()).toBe(0);
      expect(await Schema.countDocuments()).toBe(0);
      expect(await Document.countDocuments()).toBe(0);
      expect(await Tag.countDocuments()).toBe(0);
    });

    it('should return 401 for incorrect password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/wipe',
        payload: {
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid admin password');
    });

    it('should return deleted counts of 0 when database is already empty', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/admin/wipe',
        payload: {
          password: env.ADMIN_PASSWORD,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.deletedCounts.users).toBe(0);
      expect(body.deletedCounts.schemas).toBe(0);
      expect(body.deletedCounts.documents).toBe(0);
      expect(body.deletedCounts.tags).toBe(0);
      expect(body.deletedCounts.extracted).toBe(0);
    });
  });
});
