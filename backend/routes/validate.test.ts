import { initServer } from '@ts-rest/fastify';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { validateRouter } from './validate';

vi.mock('../lib/validate', () => ({
  validate: vi.fn(async ({ input, schema }) => {
    if (input === '# Hi' && schema === '# Hi') {
      return {
        success: true,
        output: {},
      };
    }
    return {
      success: false,
      error: 'Validation failed',
    };
  }),
}));

describe('/api/validate', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    const s = initServer();
    app.register(s.plugin(validateRouter));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should validate "# Hi" with schema "# Hi" and return success true with empty output', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/validate',
      payload: {
        input: '# Hi',
        schema: '# Hi',
      },
    });

    if (response.statusCode !== 200) {
      console.log('Response body:', response.body);
    }

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.output).toEqual({});
  });
});
