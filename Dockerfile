# Esta imagen ya viene con Chrome instalado en el lugar correcto
FROM ghcr.io/puppeteer/puppeteer:latest

USER root
# Instalamos dependencias necesarias
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# IMPORTANTE: Puppeteer en esta imagen instala Chrome en esta ruta:
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

CMD ["node", "index.js"]