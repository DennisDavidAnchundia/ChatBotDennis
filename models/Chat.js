const mongoose = require('mongoose');

/**
 * DEFINICIÓN DEL ESQUEMA (El molde)
 * Cada campo tiene un propósito específico para el portafolio:
 */
const ChatSchema = new mongoose.Schema({
    // usuarioId: Es el número de teléfono del usuario. 
    // Lo marcamos como 'unique' para que no haya dos registros del mismo usuario.
    usuarioId: {
        type: String,
        required: [true, "El ID de usuario es obligatorio"],
        unique: true, 
        index: true // Crea un índice para búsquedas ultra rápidas.
    },

    // historial: Es un ARRAY (una lista) de objetos.
    // Google Gemini exige que el historial tenga una estructura de: role y parts.
    historial: [
        {
            // role: Solo puede ser 'user' (el humano) o 'model' (la IA).
            role: { 
                type: String, 
                enum: ['user', 'model'], 
                required: true 
            },
            // parts: Gemini espera una lista de partes, aunque normalmente solo enviamos texto.
            parts: [{ 
                text: { type: String, required: true } 
            }],
            // Guardamos el momento exacto de cada mensaje.
            timestamp: { type: Date, default: Date.now }
        }
    ],

    // ultimaActualizacion: Útil para saber cuándo fue la última vez que habló el usuario.
    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
});

/**
 * MIDDLEWARE DE MONGOOSE:
 * Versión corregida para evitar el error "next is not a function"
 */
ChatSchema.pre('save', function() {
    this.ultimaActualizacion = Date.now();
    // En versiones actuales, si la función es síncrona y no recibe parámetros, 
    // Mongoose entiende que debe continuar sin necesidad de llamar a next().
});

module.exports = mongoose.model('Chat', ChatSchema);




