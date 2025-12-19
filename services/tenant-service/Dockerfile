FROM node:20-alpine AS development

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

EXPOSE 3002

CMD ["pnpm", "run", "dev"]

FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod

COPY --from=development /app/dist ./dist

EXPOSE 3002

CMD ["node", "dist/main.js"]
