const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de la base de datos
const config = {
  // URI de conexión
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nominatce',
  
  // Opciones de conexión
  options: {
    // autoIndex: process.env.NODE_ENV !== 'production',
    // bufferCommands: false, // Deshabilitar buffering para mejor manejo de errores
  },
  
  // Configuración de sesiones
  session: {
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 días en segundos
    autoRemove: 'native',
  }
};

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    // Verificar si ya está conectado
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB ya está conectado');
      return;
    }

    // Conectar a MongoDB
    await mongoose.connect(config.uri, config.options);
    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función para desconectar
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error desconectando de MongoDB:', error);
  }
};

module.exports = {
  config,
  connectDB,
  disconnectDB
};



