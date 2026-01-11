require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js'); // Asegúrate de tener MessageMedia aquí si la usas en index
const qrcode = require('qrcode-terminal');
const connectDB = require('./config/database');
const { handleMessage } = require('./handlers/messageHandler');

const express = require("express")

// 1. Iniciar DB
connectDB();

// 2. Configurar Cliente con parámetros para Servidor
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Clave para Railway/Render
        headless: true
    }
});

const INSTRUCCIONES = ` Eres "Dennis David AI", el asistente inteligente y gemelo digital de Dennis David Anchundia Delgado.
  Tu misión es proporcionar información detallada sobre su trayectoria profesional a reclutadores y clientes.

  PERFIL PROFESIONAL:

  - Dennis es Ingeniero en Tecnologías de la Información, graduado de la Universidad Laica Eloy Alfaro de Manabí (Uleam) en noviembre de 2025.

  - Es un Desarrollador Full Stack con dominio en JavaScript, TypeScript, Node.js, Nest.js, Java (Spring Boot) y Python.

  - Experto en bases de datos SQL, MongoDB y Redis, además de automatización con n8n.

  EXPERIENCIA CLAVE QUE DEBES RESALTAR:

  - Mantenimiento de aplicaciones para el Cuerpo de Bomberos de Manta (Junio 2025).

  - Desarrollo de una aplicación web para la empresa pública EP ULEAM.

  - Creación de un sistema web de Talento Humano y una App para pruebas clínicas (Prueba Columbia).

  - Desarrollo de este mismo Chatbot conversacional para WhatsApp.

  LOGROS Y CERTIFICACIONES:

  - Certificado en "JavaScript Moderno" y "Node: De cero a experto" por Fernando Herrera (DevTalles/Udemy).

  - Título de Ingeniero refrendado con folio 028710-A-T-CXXXVII.

  DATOS DE CONTACTO (Solo si te los piden):`;

// 3. Eventos
client.on('qr', async (qr) => {
    // 1. Sigue intentando mostrarlo en consola por si acaso
    qrcode.generate(qr, { small: true });

    // 2. EL TRUCO: Generamos una URL de imagen para verla en el navegador
    try {
        const url = await QRCode.toDataURL(qr);
        console.log("---------------------------------------------------------");
        console.log("🚀 SI NO PUEDES ESCANEAR EL QR DE ARRIBA, COPIA ESTE DATA-URL:");
        console.log(url);
        console.log("---------------------------------------------------------");
    } catch (err) {
        console.error("Error generando QR alternativo", err);
    }
});

client.on('ready', () => console.log('🚀 [SISTEMA] Dennis AI Online y Conectado'));

// 4. Manejo de mensajes (Pasamos el cliente, el mensaje y el prompt)
client.on('message', async (msg) => {
    // Agregamos un log para ver en consola quién escribe
    console.log(`📩 Mensaje de: ${msg.from}`);
    await handleMessage(client, msg, INSTRUCCIONES);
});

client.initialize();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot de Dennis David está Vivo 🚀'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Servidor de monitoreo en puerto ${PORT}`);
});