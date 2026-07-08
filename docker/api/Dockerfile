FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl wget
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN npm ci --ignore-scripts

COPY packages/shared-types ./packages/shared-types
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config
COPY apps/api ./apps/api
COPY turbo.json ./

RUN npm run build --workspace=@repo/shared-types
WORKDIR /app/apps/api
ENV DATABASE_URL="file:/data/app.db"
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared-types ./packages/shared-types

COPY docker/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/apps/api
EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
