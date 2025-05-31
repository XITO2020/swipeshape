# Utilisation de l'image Node.js officielle, version alpine pour légèreté
FROM node:20-alpine

# Définir le dossier de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json (ou yarn.lock) avant d'installer les dépendances
COPY package.json ./
COPY package-lock.json ./

# Installer les dépendances
RUN npm install --production

# Copier tout le code source dans le conteneur
COPY . .

# Construire l'application Next.js
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
