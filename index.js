require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode'); // <--- TE FALTABA ESTA IMPORTACIÓN
const connectDB = require('./config/database');
const { handleMessage } = require('./handlers/messageHandler');
const express = require("express");

// 1. Iniciar DB
connectDB();

const client = new Client({
    authStrategy: new LocalAuth(),
    qrMaxRetries: 3,
    authTimeoutMs: 60000,
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote'
        ]
        // BORRA O COMENTA LA LÍNEA executablePath
        // executablePath: '/usr/bin/google-chrome-stable' <-- ELIMINA ESTO
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
    // Generar en consola
    qrcode.generate(qr, { small: true });

    // Generar Data-URL para Render
    try {
        const url = await QRCode.toDataURL(qr); // Ahora sí funcionará con el import
        console.log("---------------------------------------------------------");
        console.log("🚀 DATA-URL DEL QR (Cópialo y pégalo en el navegador):");
        console.log(url);
        console.log("---------------------------------------------------------");
    } catch (err) {
        console.error("Error generando QR alternativo", err);
    }
});

client.on('ready', () => console.log('🚀 [SISTEMA] Dennis AI Online y Conectado'));

// Manejo de mensajes
client.on('message', async (msg) => {
    // Esto DEBE aparecer si el bot recibe algo
    console.log('--- NUEVO EVENTO DETECTADO ---');
    console.log(`📩 De: ${msg.from} | Texto: ${msg.body}`);
    
    try {
        await handleMessage(client, msg, INSTRUCCIONES);
        console.log('✅ Respuesta procesada con éxito');
    } catch (error) {
        console.error('❌ Error en el Handler:', error);
    }
});
client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa en WhatsApp');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Fallo de autenticación:', msg);
});
// Inicializar
client.initialize();

// Servidor Express (Movido abajo para asegurar orden)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot de Dennis David está Vivo 🚀'));
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Servidor de monitoreo en puerto ${PORT}`);
});


