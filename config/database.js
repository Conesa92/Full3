const mongoose = require('mongoose');
const config = require('./config');

async function connectToDatabase() {
    try {
        await mongoose.connect(config.databaseURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("Error al conectar a MongoDB Atlas:", error);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
