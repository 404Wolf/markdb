import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import { fastify } from "fastify";

const app = fastify().withTypeProvider<JsonSchemaToTsProvider>()

app.get("/", {
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
