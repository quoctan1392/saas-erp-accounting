FROM node:20-alpine

WORKDIR /workspace

# Install pnpm globally
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy all packages (for workspace dependencies)
COPY packages ./packages
COPY services ./services

# Install all workspace dependencies
RUN pnpm install

# Set working directory to core-service
WORKDIR /workspace/services/core-service

# Expose port
EXPOSE 3003

# Start in development mode
CMD ["pnpm", "run", "start:dev"]
