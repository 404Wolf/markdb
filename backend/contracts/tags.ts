import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const tagSchema = z.object({
  _id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

const createTagSchema = z.object({
  name: z.string(),
});

const updateTagSchema = z.object({
  name: z.string().optional(),
});

export const tagsContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/tags',
    responses: {
      200: z.array(tagSchema),
    },
    summary: 'Get all tags',
  },
  getById: {
    method: 'GET',
    path: '/api/tags/:id',
    responses: {
      200: tagSchema,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get tag by ID',
  },
  create: {
    method: 'POST',
    path: '/api/tags',
    responses: {
      201: tagSchema,
      400: z.object({ error: z.string() }),
    },
    body: createTagSchema,
    summary: 'Create a new tag',
  },
  update: {
    method: 'PUT',
    path: '/api/tags/:id',
    responses: {
      200: tagSchema,
      404: z.object({ error: z.string() }),
      400: z.object({ error: z.string() }),
    },
    body: updateTagSchema,
    summary: 'Update a tag',
  },
  delete: {
    method: 'DELETE',
    path: '/api/tags/:id',
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete a tag',
  },
});
