FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Instalamos ffmpeg por si envías audios o videos
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# NO definas ENV PUPPETEER_EXECUTABLE_PATH aquí, 
# la imagen base ya lo tiene configurado correctamente.

CMD ["node", "index.js"]