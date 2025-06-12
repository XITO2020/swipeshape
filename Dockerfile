# Étape de build
FROM node:18-slim AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Étape de production
FROM node:18-slim
WORKDIR /app

# Add OpenSSL 1.1 compatibility for Prisma
RUN apk add --no-cache openssl1.1-compat libgcc libstdc++

COPY --from=builder /app ./
ENV NODE_ENV=production

# Installer la lib SSL 1.1 et C++ runtime
RUN apt-get update \
&& apt-get install -y libssl1.1 libstdc++ \
&& rm -rf /var/lib/apt/lists/*

EXPOSE 3000

# Use the standalone server.js instead of npm start
CMD ["node", ".next/standalone/server.js"]