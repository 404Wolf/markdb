import { initServer } from '@ts-rest/fastify';
import { fastify } from "fastify";
import { validateRouter } from './routes/validate';
import { usersRouter } from './routes/users';
import { documentsRouter } from './routes/documents';
import { schemasRouter } from './routes/schemas';
import { tagsRouter } from './routes/tags';

const app = fastify();
const s = initServer();

// Health check endpoint for fly.io
app.get("/health", async (_, __) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Register ts-rest routes
app.register(s.plugin(validateRouter));
app.register(s.plugin(usersRouter));
app.register(s.plugin(documentsRouter));
app.register(s.plugin(schemasRouter));
app.register(s.plugin(tagsRouter));

await app.listen({ port: 5000, host: "0.0.0.0" });
