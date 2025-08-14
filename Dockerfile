FROM node:18-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y \
  libssl-dev \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client with correct binary targets
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apt-get update && apt-get install -y \
  libssl-dev \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create public directory and copy files if they exist
RUN mkdir -p public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema  
COPY --from=builder /app/prisma ./prisma

# Install Prisma packages alongside existing standalone dependencies
RUN yarn add @prisma/client@5.22.0 prisma@5.22.0 --production

# Generate Prisma client for production
RUN npx prisma generate

# Initialize database and run migrations
RUN npx prisma db push

# Create uploads directory and set permissions
RUN mkdir -p uploads
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]