// ============================================
// SESSION STORE PARA DESARROLLO LOCAL
// ============================================
// Este archivo usa sesiones en memoria para desarrollo local
// NO conecta a MongoDB Atlas

const session = require('express-session');

console.log('🔧 Usando sesiones en memoria para desarrollo local');

// Crear un almacén de sesiones en memoria para desarrollo
const sessionStore = new session.MemoryStore();

module.exports = sessionStore;