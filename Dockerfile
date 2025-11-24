FROM rust:1.75-slim as rust-builder
RUN apt-get update && apt-get install -y git build-essential && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/404wolf/mdvalidate.git /tmp/mdvalidate
WORKDIR /tmp/mdvalidate
RUN cargo build --release

FROM oven/bun:1.2.13-slim

WORKDIR /app

COPY --from=rust-builder /tmp/mdvalidate/target/release/mdv /usr/local/bin/mdv

COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "run", "start"]
