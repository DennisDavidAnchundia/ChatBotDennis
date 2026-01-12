FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Instalamos ffmpeg para audios/videos y herramientas necesarias
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias (incluyendo las de producción)
RUN npm install

# Copiamos el resto del código
COPY . .

# AJUSTE DE PERMISOS: Importante para que Puppeteer pueda escribir la sesión
# Le damos permiso al usuario 'pptruser' que viene en la imagen base
RUN chown -R pptruser:pptruser /app

# Volvemos al usuario seguro de Puppeteer
USER pptruser

# Hugging Face usa el puerto 7860 por defecto
EXPOSE 7860

CMD ["node", "index.js"]