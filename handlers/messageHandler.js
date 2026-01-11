const { MessageMedia } = require('whatsapp-web.js');
const { generateResponse } = require('../services/aiService');
const Chat = require('../models/Chat');

const handleMessage = async (client, msg, instructions) => {
    // 1. Ignorar grupos y estados
    if (msg.from.includes('@g.us') || msg.from === 'status@broadcast') return;

    try {
        const query = msg.body.toLowerCase().trim();

        // 2. Lógica de Comandos (CV) - Con verificación de archivo
        if (query.includes('cv') || query.includes('hoja de vida')) {
            try {
                const media = MessageMedia.fromFilePath('./DennisDavidAnchundiaDelgadoCV.pdf');
                return await client.sendMessage(msg.from, media, { caption: 'Aquí tienes mi CV Dennis David 🚀' });
            } catch (err) {
                console.error("Error al enviar PDF:", err);
                return await msg.reply("Lo siento, mi CV no está disponible en este momento.");
            }
        }

        // 3. Lógica de Memoria (Búsqueda en DB)
        let chatData = await Chat.findOne({ usuarioId: msg.from });
        
        if (!chatData) {
            chatData = new Chat({ usuarioId: msg.from, historial: [] });
        }

        // 4. Formateo de Historial (Simplificado para evitar errores de undefined)
        const history = (chatData.historial || []).map(h => {
            // Verificamos si existe la estructura antes de mapear
            const contentText = h.parts && h.parts[0] ? h.parts[0].text : "";
            return {
                role: h.role === 'model' ? 'assistant' : 'user',
                content: contentText
            };
        }).filter(h => h.content !== "").slice(-6); // Bajamos a 6 mensajes para ahorrar memoria en Render

        // 5. Llamada a la IA
        console.log(`🤖 Procesando respuesta para: ${msg.from}`);
        const aiResponse = await generateResponse(history, msg.body, instructions);

        if (!aiResponse) {
            throw new Error("La IA no devolvió ninguna respuesta.");
        }

        // 6. Guardar en Base de Datos
        chatData.historial.push({ role: "user", parts: [{ text: msg.body }] });
        chatData.historial.push({ role: "model", parts: [{ text: aiResponse }] });
        
        // Limitar historial en DB para no saturar MongoDB
        if (chatData.historial.length > 20) chatData.historial.shift();
        
        await chatData.save();

        // 7. RESPONDER
        await msg.reply(aiResponse);
        console.log("✅ Respuesta enviada con éxito");

    } catch (error) {
        console.error("❌ ERROR EN EL HANDLER:", error);
        // No enviamos el error técnico al usuario, solo un aviso
        await msg.reply("Estoy procesando mucha información ahora mismo. ¿Podrías repetirme eso?");
    }
};

module.exports = { handleMessage };