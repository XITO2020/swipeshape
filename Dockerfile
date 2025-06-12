# Étape de build
FROM node:18-bullseye-slim AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Étape de production
FROM node:18-bullseye-slim
WORKDIR /app

COPY --from=builder /app ./
ENV NODE_ENV=production

# Installer openssl (qui apporte libssl1.1 sur Bullseye)
RUN apt-get update \
 && apt-get install -y openssl libstdc++ \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

# Use the standalone server.js instead of npm start
CMD ["node", ".next/standalone/server.js"]