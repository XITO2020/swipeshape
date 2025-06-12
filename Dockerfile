# ─── 1. Build stage ─────────────────────────────────────────────────────────────

FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Installer OpenSSL 1.1 et le runtime C++ avec tentatives multiples en cas d'échec réseau
RUN apt-get update && \
    # Retry logic for apt-get install
    for i in 1 2 3 4 5; do \
        apt-get install -y openssl libstdc++6 && break || \
        echo "Retry apt-get install attempt $i..." && sleep 2; \
    done && \
    # Clean up
    rm -rf /var/lib/apt/lists/*

# Copier d'abord les fichiers Prisma pour éviter l'erreur de génération
COPY prisma ./prisma/

# Puis les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste du code et builder Next.js
COPY . .
RUN npm run build

# ─── 2. Production stage ────────────────────────────────────────────────────────

FROM node:18-bullseye-slim AS runner
WORKDIR /app

# Copier tout depuis le build
COPY --from=builder /app ./

# Variables d'env de prod
ENV NODE_ENV=production

# Réinstaller OpenSSL & C++ runtime pour que Prisma puisse charger ses engines avec retry
RUN apt-get update && \
    # Retry logic for apt-get install
    for i in 1 2 3 4 5; do \
        apt-get install -y openssl libstdc++6 && break || \
        echo "Retry apt-get install attempt $i..." && sleep 2; \
    done && \
    # Clean up
    rm -rf /var/lib/apt/lists/*

# Port exposé
EXPOSE 3000

# Lancer Next.js en standalone
CMD ["node", ".next/standalone/server.js"]
