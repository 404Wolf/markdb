FROM oven/bun:1.2.13-slim

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "run", "start"]
