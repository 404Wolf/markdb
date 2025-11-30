import { initServer } from '@ts-rest/fastify';
import { schemasContract } from '../contracts/schemas';
import { Schema } from '../db';

const s = initServer();

export const schemasRouter = s.router(schemasContract, {
  getAll: async () => {
    const schemas = await Schema.find();
    return {
      status: 200,
      body: schemas.map(schema => ({
        _id: schema._id.toString(),
        name: schema.name,
        createdAt: schema.createdAt.toISOString(),
      })),
    };
  },

  getById: async ({ params: { id } }) => {
    const schema = await Schema.findById(id);

    if (!schema) {
      return {
        status: 404,
        body: { error: 'Schema not found' },
      };
    }

    return {
      status: 200,
      body: {
        _id: schema._id.toString(),
        name: schema.name,
        createdAt: schema.createdAt.toISOString(),
      },
    };
  },

  create: async ({ body }) => {
    try {
      const schema = await Schema.create(body);
      return {
        status: 201,
        body: {
          _id: schema._id.toString(),
          name: schema.name,
          createdAt: schema.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message || 'Failed to create schema' : 'Failed to create schema';

      return {
        status: 400,
        body: { error: message },
      };
    }
  },

  update: async ({ params: { id }, body }) => {
    try {
      const schema = await Schema.findByIdAndUpdate(id, body, { new: true });

      if (!schema) {
        return {
          status: 404,
          body: { error: 'Schema not found' },
        };
      }

      return {
        status: 200,
        body: {
          _id: schema._id.toString(),
          name: schema.name,
          createdAt: schema.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message || 'Failed to update schema' : 'Failed to update schema';

      return {
        status: 400,
        body: { error: message },
      };
    }
  },

  delete: async ({ params: { id } }) => {
    const schema = await Schema.findByIdAndDelete(id);

    if (!schema) {
      return {
        status: 404,
        body: { error: 'Schema not found' },
      };
    }

    return {
      status: 200,
      body: { message: 'Schema deleted successfully' },
    };
  },
});
