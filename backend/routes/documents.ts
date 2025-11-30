import { initServer } from '@ts-rest/fastify';
import { documentsContract } from '../contracts/documents';
import { Document } from '../db';

const s = initServer();

export const documentsRouter = s.router(documentsContract, {
  getAll: async () => {
    const documents = await Document.find();
    return {
      status: 200,
      body: documents.map(doc => ({
        _id: doc._id.toString(),
        name: doc.name,
        content: doc.content,
        author: doc.author.toString(),
        tags: doc.tags.map(tag => tag.toString()),
        createdAt: doc.createdAt.toISOString(),
      })),
    };
  },

  getById: async ({ params: { id } }) => {
    const document = await Document.findById(id);

    if (!document) {
      return {
        status: 404,
        body: { error: 'Document not found' },
      };
    }

    return {
      status: 200,
      body: {
        _id: document._id.toString(),
        name: document.name,
        content: document.content,
        author: document.author.toString(),
        tags: document.tags.map(tag => tag.toString()),
        createdAt: document.createdAt.toISOString(),
      },
    };
  },

  create: async ({ body }) => {
    try {
      const document = await Document.create(body);
      return {
        status: 201,
        body: {
          _id: document._id.toString(),
          name: document.name,
          content: document.content,
          author: document.author.toString(),
          tags: document.tags.map(tag => tag.toString()),
          createdAt: document.createdAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error instanceof Error ? error.message : 'Failed to create document' },
      };
    }
  },

  update: async ({ params: { id }, body }) => {
    try {
      const document = await Document.findByIdAndUpdate(id, body, { new: true });

      if (!document) {
        return {
          status: 404,
          body: { error: 'Document not found' },
        };
      }

      return {
        status: 200,
        body: {
          _id: document._id.toString(),
          name: document.name,
          content: document.content,
          author: document.author.toString(),
          tags: document.tags.map(tag => tag.toString()),
          createdAt: document.createdAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error instanceof Error ? error.message : 'Failed to update document' },
      };
    }
  },

  delete: async ({ params: { id } }) => {
    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      return {
        status: 404,
        body: { error: 'Document not found' },
      };
    }

    return {
      status: 200,
      body: { message: 'Document deleted successfully' },
    };
  },
});
