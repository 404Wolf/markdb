import { adminContract } from '../contracts/admin';
import { User, Schema, Document, Tag } from '../db';
import { Extracted } from '../db/schemas/Extracted';
import { env } from '../env';
import { s } from "../tsrest"

export const adminRouter = s.router(adminContract, {
  wipeDatabase: async ({ body }) => {
    if (body.password !== env.ADMIN_PASSWORD) {
      return {
        status: 401,
        body: { error: 'Invalid admin password' },
      };
    }

    try {
      const [usersDeleted, schemasDeleted, documentsDeleted, tagsDeleted, extractedDeleted] = await Promise.all([
        User.deleteMany({}),
        Schema.deleteMany({}),
        Document.deleteMany({}),
        Tag.deleteMany({}),
        Extracted.deleteMany({}),
      ]);

      return {
        status: 200,
        body: {
          message: 'Database wiped successfully',
          deletedCounts: {
            users: usersDeleted.deletedCount,
            schemas: schemasDeleted.deletedCount,
            documents: documentsDeleted.deletedCount,
            tags: tagsDeleted.deletedCount,
            extracted: extractedDeleted.deletedCount,
          },
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message || 'Failed to wipe database' : 'Failed to wipe database';

      return {
        status: 400,
        body: { error: message },
      };
    }
  },
});
