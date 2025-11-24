import { initServer } from '@ts-rest/fastify';
import { fastify } from "fastify";
import { validateRouter } from './routes/validate';

const app = fastify();
const s = initServer();

// Health check endpoint for fly.io
app.get("/health", async (_, __) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Register ts-rest routes
app.register(s.plugin(validateRouter));

await app.listen({ port: 5000, host: "0.0.0.0" });
