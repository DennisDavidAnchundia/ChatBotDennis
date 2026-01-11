FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Instalamos ffmpeg para soporte de archivos multimedia si fuera necesario
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Exponemos el puerto que usa Express
EXPOSE 3000

CMD ["node", "index.js"]