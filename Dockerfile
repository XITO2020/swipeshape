# ─── 1. Build stage ─────────────────────────────────────────────────────────────

FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Installer OpenSSL 1.1 et le runtime C++
RUN apt-get update \
 && apt-get install -y openssl libstdc++6 \
 && rm -rf /var/lib/apt/lists/*

# Installer les dépendances et générer le client Prisma
COPY package.json package-lock.json ./
RUN npm install

# Copier le code et builder Next.js
COPY . .
RUN npm run build

# ─── 2. Production stage ────────────────────────────────────────────────────────

FROM node:18-bullseye-slim AS runner
WORKDIR /app

# Copier tout depuis le build
COPY --from=builder /app ./

# Variables d'env de prod
ENV NODE_ENV=production

# Réinstaller OpenSSL & C++ runtime pour que Prisma puisse charger ses engines
RUN apt-get update \
 && apt-get install -y openssl libstdc++6 \
 && rm -rf /var/lib/apt/lists/*

# Port exposé
EXPOSE 3000

# Lancer Next.js en standalone
CMD ["node", ".next/standalone/server.js"]
