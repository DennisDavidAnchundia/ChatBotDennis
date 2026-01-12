const mongoose = require('mongoose');

/**
 * DEFINICIÓN DEL ESQUEMA (El molde)
 */
const ChatSchema = new mongoose.Schema({

    usuarioId: {
        type: String,
        required: [true, "El ID de usuario es obligatorio"],
        unique: true, 
        index: true 
    },

    historial: [
        {
            role: { 
                type: String, 
                enum: ['user', 'model'], 
                required: true 
            },
            parts: [{ 
                text: { type: String, required: true } 
            }],
            timestamp: { type: Date, default: Date.now }
        }
    ],

    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
});

/**
 * MIDDLEWARE DE MONGOOSE:
 */
ChatSchema.pre('save', function() {
    this.ultimaActualizacion = Date.now();

});

module.exports = mongoose.model('Chat', ChatSchema);




