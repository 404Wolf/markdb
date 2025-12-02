import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const adminContract = c.router({
  wipeDatabase: {
    method: 'POST',
    path: '/api/admin/wipe',
    responses: {
      200: z.object({ message: z.string(), deletedCounts: z.record(z.number()) }),
      401: z.object({ error: z.string() }),
    },
    body: z.object({
      password: z.string(),
    }),
    summary: 'Wipe all data from the database',
  },
});
