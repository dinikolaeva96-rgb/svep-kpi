FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Создаём директорию для БД
RUN mkdir -p /data

ENV NODE_ENV=production \
    PORT=3001 \
    DB_PATH=/data/svep.db

EXPOSE 3001

# Инициализация БД при первом запуске, затем сервер
CMD ["sh", "-c", "[ ! -f /data/svep.db ] && node db/seed.js; node src/index.js"]
