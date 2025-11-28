import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const validateContract = c.router({
  validate: {
    method: 'POST',
    path: '/api/validate',
    responses: {
      200: z.object({
        success: z.literal(true),
        output: z.record(z.any()),
      }),
      400: z.object({
        success: z.literal(false),
        error: z.string(),
      }),
    },
    body: z.object({
      input: z.string(),
      schema: z.string(),
    }),
    summary: 'mdschema validation endpoint',
  },
});
