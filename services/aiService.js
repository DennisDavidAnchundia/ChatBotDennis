// services/aiService.js
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateResponse = async (history, message, instructions) => {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: instructions },
            ...history,
            { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
    });
    return completion.choices[0].message.content;
};

module.exports = { generateResponse };