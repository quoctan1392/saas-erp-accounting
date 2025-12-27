FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

RUN npm install -g pnpm

# Ensure root tsconfig is available for TypeScript build (tsconfig extends path)
COPY tsconfig.json /tsconfig.json

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

EXPOSE 3002

CMD ["pnpm", "run", "dev"]
