import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { fastify } from 'fastify';
import { initServer } from '@ts-rest/fastify';
import { usersRouter } from './users';
import { User, type IUser, db } from '../db';
import mongoose, { type HydratedDocument } from 'mongoose';

const app = fastify();
const s = initServer();

app.register(s.plugin(usersRouter));

beforeAll(async () => {
  await db;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Users API', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 400 for duplicate email', async () => {
      await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          name: 'Jane Doe',
          email: 'john@example.com',
          password: 'password456',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should hash the password', async () => {
      const password = 'mySecretPassword';
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: {
          name: 'John Doe',
          email: 'john@example.com',
          password,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      const user = await User.findById(body._id).select('+password');
      expect(user?.password).toBeDefined();
      expect(user?.password).not.toBe(password); // Password should be hashed
      expect(user?.password.length).toBeGreaterThan(password.length); // Hashed password is longer
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${user._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: user._id.toString(),
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(body.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      // Verify user exists in DB
      const foundUser = await User.findById(user._id);
      expect(foundUser).toBeDefined();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${user._id}`,
        payload: {
          name: 'John Updated',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        _id: user._id.toString(),
        name: 'John Updated',
        email: 'john@example.com',
      });
      expect(body.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${fakeId}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const user = await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      // Verify user exists in DB
      const foundUser = await User.findById(user._id);
      expect(foundUser).toBeDefined();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${user._id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User deleted successfully');

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('User not found');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          email: 'john@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(body._id).toBeDefined();
      expect(body.createdAt).toBeDefined();
      expect(body.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 401 for invalid email', async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          email: 'wrong@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: {
          email: 'john@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid email or password');
    });
  });

  it('should list users', async () => {
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123'
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(body[1]).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
  });
});
