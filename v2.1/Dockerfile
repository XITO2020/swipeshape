
# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

# Étape de production
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "preview"]
