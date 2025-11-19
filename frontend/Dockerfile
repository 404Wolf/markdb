# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.13
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL service="frontend"

# Frontend app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Install node modules from root package.json
COPY package.json bun.lock package-lock.json* ./
RUN bun install

# Copy frontend source code
COPY app/ ./app/
COPY public/ ./public/
COPY app.config.ts tsconfig.json ./

# Build the frontend application
RUN bun run build

# Remove development dependencies
RUN rm -rf node_modules && \
    bun install --ci

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the frontend server
EXPOSE 3000
CMD ["bun", "run", "start"]
