import { fastify } from "fastify";
import { s } from './tsrest';
import { validateRouter } from './routes/validate';
import { usersRouter } from './routes/users';
import { documentsRouter } from './routes/documents';
import { schemasRouter } from './routes/schemas';
import { tagsRouter } from './routes/tags';

export const app = fastify();

app.get("/health", async (_, __) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

app.register(s.plugin(validateRouter));
app.register(s.plugin(usersRouter));
app.register(s.plugin(documentsRouter));
app.register(s.plugin(schemasRouter));
app.register(s.plugin(tagsRouter));
