// handlers/messageHandler.js
const { MessageMedia } = require('whatsapp-web.js');
const { generateResponse } = require('../services/aiService');
const Chat = require('../models/Chat');

const handleMessage = async (client, msg, instructions) => {
    if (msg.from.includes('@g.us') || msg.from === 'status@broadcast') return;

    const query = msg.body.toLowerCase().trim();
    const chat = await msg.getChat();

    // Lógica de Comandos (CV)
    if (query.includes('cv') || query.includes('hoja de vida')) {
        const media = MessageMedia.fromFilePath('./DennisDavidAnchundiaDelgadoCV.pdf');
        return client.sendMessage(msg.from, media, { caption: 'CV Dennis David 🚀' });
    }

    // Lógica de Memoria e IA
    let chatData = await Chat.findOne({ usuarioId: msg.from }) || new Chat({ usuarioId: msg.from, historial: [] });
    
    const history = chatData.historial.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts[0].text
    })).slice(-10);

    const aiResponse = await generateResponse(history, msg.body, instructions);

    chatData.historial.push({ role: "user", parts: [{ text: msg.body }] });
    chatData.historial.push({ role: "model", parts: [{ text: aiResponse }] });
    await chatData.save();

    await msg.reply(aiResponse);
};

module.exports = { handleMessage };