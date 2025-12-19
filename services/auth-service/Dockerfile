FROM node:20-alpine AS development

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3001

CMD ["pnpm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod

COPY --from=development /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
