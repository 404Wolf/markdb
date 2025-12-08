import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const usersContract = c.router({
  getById: {
    method: 'GET',
    path: '/api/users/:id',
    responses: {
      200: userSchema,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get user by ID',
  },
  create: {
    method: 'POST',
    path: '/api/users',
    responses: {
      201: userSchema,
      400: z.object({ error: z.string() }),
    },
    body: createUserSchema,
    summary: 'Create a new user',
  },
  update: {
    method: 'PUT',
    path: '/api/users/:id',
    responses: {
      200: userSchema,
      404: z.object({ error: z.string() }),
      400: z.object({ error: z.string() }),
    },
    body: updateUserSchema,
    summary: 'Update a user',
  },
  delete: {
    method: 'DELETE',
    path: '/api/users/:id',
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete a user',
  },
  login: {
    method: 'POST',
    path: '/api/users/login',
    responses: {
      200: userSchema,
      401: z.object({ error: z.string() }),
    },
    body: loginSchema,
    summary: 'Login with email and password',
  },
  list: {
    method: 'GET',
    path: '/api/users',
    responses: {
      200: z.array(userSchema),
      404: z.object({ error: z.string() }),
    },
    summary: 'List all users',
  },
});
