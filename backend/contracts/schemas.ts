import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const schemaSchema = z.object({
  _id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

const createSchemaSchema = z.object({
  name: z.string(),
});

const updateSchemaSchema = z.object({
  name: z.string().optional(),
});

export const schemasContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/schemas',
    responses: {
      200: z.array(schemaSchema),
    },
    summary: 'Get all schemas',
  },
  getById: {
    method: 'GET',
    path: '/api/schemas/:id',
    responses: {
      200: schemaSchema,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get schema by ID',
  },
  create: {
    method: 'POST',
    path: '/api/schemas',
    responses: {
      201: schemaSchema,
      400: z.object({ error: z.string() }),
    },
    body: createSchemaSchema,
    summary: 'Create a new schema',
  },
  update: {
    method: 'PUT',
    path: '/api/schemas/:id',
    responses: {
      200: schemaSchema,
      404: z.object({ error: z.string() }),
      400: z.object({ error: z.string() }),
    },
    body: updateSchemaSchema,
    summary: 'Update a schema',
  },
  delete: {
    method: 'DELETE',
    path: '/api/schemas/:id',
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete a schema',
  },
});
