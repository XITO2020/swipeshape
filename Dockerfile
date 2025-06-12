# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Étape de production
FROM node:18-alpine
WORKDIR /app

# Add OpenSSL 1.1 compatibility for Prisma
RUN apk add --no-cache openssl1.1-compat libgcc libstdc++

COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000

# Use the standalone server.js instead of npm start
CMD ["node", ".next/standalone/server.js"]