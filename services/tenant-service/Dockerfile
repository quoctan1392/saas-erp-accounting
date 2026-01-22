FROM node:20-alpine

WORKDIR /workspace

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

RUN npm install -g pnpm

# Copy workspace config files from root
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig.json ./

# Copy all packages (for workspace dependencies)
COPY packages ./packages
COPY services ./services

# Install all workspace dependencies
RUN pnpm install

# Set working directory to tenant-service
WORKDIR /workspace/services/tenant-service

EXPOSE 3002

# Use pnpm exec to run nest command (works with pnpm workspace)
CMD ["pnpm", "exec", "nest", "start", "--watch"]
