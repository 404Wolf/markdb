import Fastify from "fastify";

const app = Fastify();

app.get("/", async (request, reply) => {
  return { message: "Hello World!" };
});

await app.listen({ port: 5000 });
