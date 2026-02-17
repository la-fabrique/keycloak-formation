FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]
