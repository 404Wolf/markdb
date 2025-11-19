# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.13
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

# App lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Install node modules
COPY bun.lock package-lock.json package.json ./
RUN bun install

# Copy application code
COPY backend/ ./backend/
COPY app/ ./app/
COPY public/ ./public/
COPY app.config.ts tsconfig.json ./

# Build frontend application
RUN bun run build

# Remove development dependencies
RUN rm -rf node_modules && \
    bun install --ci

# Final stage for app image
FROM base

# Install process manager for multi-service deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y supervisor && \
    rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=build /app /app

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directory
RUN mkdir -p /var/log/supervisor

# Expose ports
EXPOSE 3000 3001

# Start supervisor to manage both services
CMD ["/usr/bin/supervisord"]
