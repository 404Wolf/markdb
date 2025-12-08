import { fastify } from "fastify";
import cors from "@fastify/cors";
import { s } from './tsrest';
import { validateRouter } from './routes/validate';
import { usersRouter } from './routes/users';
import { documentsRouter } from './routes/documents';
import { schemasRouter } from './routes/schemas';
import { tagsRouter } from './routes/tags';
import { adminRouter } from './routes/admin';

export const app = fastify();

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

app.get("/health", async (_, __) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

app.register(s.plugin(validateRouter));
app.register(s.plugin(usersRouter));
app.register(s.plugin(documentsRouter));
app.register(s.plugin(schemasRouter));
app.register(s.plugin(tagsRouter));
app.register(s.plugin(adminRouter));
