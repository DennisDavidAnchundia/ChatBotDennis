# Usamos una imagen oficial que ya viene con Node.js y Chrome instalado
FROM ghcr.io/puppeteer/puppeteer:latest

# Cambiamos a usuario root para instalar dependencias adicionales
USER root

# Instalamos herramientas necesarias para el bot
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Definimos la carpeta de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las librerías
RUN npm install

# Copiamos el resto de tu código
COPY . .

# Comando para arrancar el bot
CMD ["node", "index.js"]