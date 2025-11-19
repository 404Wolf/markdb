import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import { fastify } from "fastify";

const app = fastify().withTypeProvider<JsonSchemaToTsProvider>()

// Health check endpoint for fly.io
app.get("/health", async (_request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

app.get("/api", {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      },
      required: ['name']
    }
  }
}, async (request, _reply) => {
  const { name } = request.query;
  return { message: `Hello ${name}!` };
});

await app.listen({ port: 5000, host: "0.0.0.0" });
