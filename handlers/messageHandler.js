const { MessageMedia } = require('whatsapp-web.js');
const { generateResponse } = require('../services/aiService');
const Chat = require('../models/Chat');

const handleMessage = async (client, msg, instructions) => {
    // 1. Filtro de seguridad inmediato
    if (msg.from.includes('@g.us') || msg.from === 'status@broadcast') return;

    try {
        const query = msg.body ? msg.body.toLowerCase().trim() : "";

        // 2. Comandos directos (CV) - Respuesta rápida sin pasar por IA ni DB
        if (query.includes('cv') || query.includes('hoja de vida')) {
            try {
                const media = MessageMedia.fromFilePath('./DennisDavidAnchundiaDelgadoCV.pdf');
                return await client.sendMessage(msg.from, media, { caption: 'Aquí tienes mi CV Dennis David 🚀' });
            } catch (err) {
                console.error("Error al enviar PDF:", err);
                return await msg.reply("Lo siento, no pude cargar el archivo. Inténtalo más tarde.");
            }
        }

        // 3. Gestión de Memoria (MongoDB) - Con Timeout preventivo
        let chatData = await Chat.findOne({ usuarioId: msg.from }).maxTimeMS(2000); // 2 seg max para buscar
        
        if (!chatData) {
            chatData = new Chat({ usuarioId: msg.from, historial: [] });
        }

        // 4. Limpieza de Historial - Formato compacto para Groq/IA
        // Solo enviamos los últimos 4 mensajes para ahorrar RAM en Render
        const history = (chatData.historial || [])
            .filter(h => h.parts && h.parts[0] && h.parts[0].text)
            .slice(-4) 
            .map(h => ({
                role: h.role === 'model' ? 'assistant' : 'user',
                content: h.parts[0].text
            }));

        // 5. Llamada a la IA
        console.log(`🤖 IA trabajando para: ${msg.from}`);
        const aiResponse = await generateResponse(history, msg.body, instructions);

        if (!aiResponse) throw new Error("IA Empty Response");

        // 6. Actualización de DB (En segundo plano para no retrasar el mensaje)
        chatData.historial.push({ role: "user", parts: [{ text: msg.body }] });
        chatData.historial.push({ role: "model", parts: [{ text: aiResponse }] });
        
        // Mantener DB limpia: Solo 10 mensajes máximo por usuario
        if (chatData.historial.length > 10) {
            chatData.historial = chatData.historial.slice(-10);
        }
        
        chatData.save().catch(e => console.error("Error guardando DB:", e));

        // 7. Respuesta final al usuario
        await msg.reply(aiResponse);
        console.log("✅ Ciclo completado");

    } catch (error) {
        console.error("❌ ERROR EN HANDLER:", error.message);
        // Si hay error, intentamos responder algo genérico pero amigable
        if (msg.body.length < 100) {
            await msg.reply("Disculpa, tuve un pequeño problema técnico. ¿Podrías decirme eso de nuevo?");
        }
    }
};

module.exports = { handleMessage };