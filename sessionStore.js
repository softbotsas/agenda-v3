const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

// Configura tu URI de conexión a MongoDB
const password = "YBhrol5nwV2zOVcZ";
const usuario = "bernstein";
const bd = "tucajaex";
const uri = `mongodb+srv://${usuario}:${password}@cluster0.ui39vqd.mongodb.net/${bd}?retryWrites=true&w=majority&appName=Cluster0`;

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // autoIndex: process.env.NODE_ENV !== 'production', // Habilita autoIndex solo en desarrollo
};

// Conecta a MongoDB si no está conectado ya
if (mongoose.connection.readyState === 0) {
  mongoose.connect(uri, options)
    .then(() => console.log('Conexión exitosa a MongoDB para sesiones'))
    .catch(err => console.error('Error de conexión a MongoDB para sesiones:', err));
}

// Crea el almacén de sesiones
const sessionStore = MongoStore.create({
  mongoUrl: uri,
  collectionName: 'sessions', // Nombre de la colección donde se almacenarán las sesiones
  ttl: 14 * 24 * 60 * 60, // Tiempo de vida de la sesión en segundos (14 días)
  autoRemove: 'native', // Dejar que MongoDB maneje la eliminación de sesiones expiradas
});

module.exports = sessionStore;
