FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS migrations
WORKDIR /app
COPY prisma.config.ts ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://build:build@localhost:5432/pocket_ledger
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
COPY --from=builder --chown=nodeapp:nodeapp /app/public ./public
COPY --from=builder --chown=nodeapp:nodeapp /app/.next/standalone ./
COPY --from=builder --chown=nodeapp:nodeapp /app/.next/static ./.next/static
USER nodeapp
EXPOSE 3000
CMD ["node", "server.js"]
