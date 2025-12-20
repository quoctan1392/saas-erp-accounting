FROM node:20-alpine AS development

WORKDIR /app

# Install build dependencies for native modules like bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies
RUN pnpm install

# Copy source code
COPY . .

# Remove any existing dist folder
RUN rm -rf dist

EXPOSE 3001

# Run with pnpm run dev (nest start --watch)
CMD ["pnpm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

# Copy package files
COPY package.json ./

# Install dependencies with npm instead of pnpm
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
