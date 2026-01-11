// config/database.js
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🟢 DB Conectada");
    } catch (err) {
        console.error("🔴 Error DB:", err);
        process.exit(1);
    }
};
module.exports = connectDB;

