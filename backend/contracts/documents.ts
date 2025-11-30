import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const documentSchema = z.object({
  _id: z.string(),
  name: z.string(),
  content: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
});

const createDocumentSchema = z.object({
  name: z.string(),
  schemaId: z.string(),
  content: z.string(),
  author: z.string(),
  tags: z.array(z.string()).optional(),
});

const updateDocumentSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const documentsContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/documents',
    responses: {
      200: z.array(documentSchema),
    },
    summary: 'Get all documents',
  },
  getById: {
    method: 'GET',
    path: '/api/documents/:id',
    responses: {
      200: documentSchema,
      404: z.object({ error: z.string() }),
    },
    summary: 'Get document by ID',
  },
  create: {
    method: 'POST',
    path: '/api/documents',
    responses: {
      201: z.union([documentSchema, z.object({
        validationResult: z.discriminatedUnion("success", [
          z.object({ success: z.literal(true), output: z.string() }),
          z.object({ success: z.literal(false), error: z.string() })
        ])
      })]),
      404: z.object({ error: z.string() }),
      422: z.object({ reason: z.literal("validationError"), error: z.string() })
    },
    body: createDocumentSchema,
    summary: 'Create a new document',
  },
  update: {
    method: 'PUT',
    path: '/api/documents/:id',
    responses: {
      200: documentSchema,
      404: z.object({ error: z.string() }),
      400: z.object({ error: z.string() }),
    },
    body: updateDocumentSchema,
    summary: 'Update a document',
  },
  delete: {
    method: 'DELETE',
    path: '/api/documents/:id',
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ error: z.string() }),
    },
    summary: 'Delete a document',
  },
});
