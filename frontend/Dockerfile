# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (including dev deps for build)
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

# ---- Run stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only production needed files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Install only production dependencies
RUN npm ci --omit=dev

# Expose port (Railway provides $PORT env)
EXPOSE $PORT

# Start Next.js server on the provided port
CMD ["npm", "run", "start"]
