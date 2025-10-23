// ============================================
// SCRIPT PARA CREAR USUARIOS DE AGENDA
// ============================================
// Este script crea los usuarios de agenda que corresponden
// con los IDs del sistema de login simulado

const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo de usuario de agenda
const AgendaUser = require('./src/models/agenda.User');

// Configuración de conexión local
const MONGODB_URI = 'mongodb://localhost:27017/agenda_tce_local';

// Función para conectar a MongoDB local
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB local');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función para crear usuarios de agenda
const createAgendaUsers = async () => {
  try {
    console.log('🚀 Creando usuarios de agenda...');

    // Limpiar usuarios existentes
    await AgendaUser.deleteMany({});
    console.log('🧹 Usuarios existentes eliminados');

    // Crear usuarios de agenda que correspondan con los IDs del login simulado
    const users = [
      {
        _id: new mongoose.Types.ObjectId('682e2e8d8be24eb085a7fcc5'),
        nombre: 'Alejandro Botero',
        email: 'alejandro@softbot.com',
        perfil_usuario: 0, // Admin
        cargo: 'Administrador',
        departamento: 'Administración',
        departamento_name: 'Administración',
        color: '#dc3545',
        activo: true,
        notificaciones: {
          email: true,
          whatsapp: true,
          recordatorios_sla: true
        }
      },
      {
        _id: new mongoose.Types.ObjectId('673a97324cec319c00c284e1'),
        nombre: 'Yorman Salazar',
        email: 'yorman@empresa.com',
        perfil_usuario: 1, // Supervisor
        cargo: 'Supervisor',
        departamento: 'Operaciones',
        departamento_name: 'Operaciones',
        color: '#ffc107',
        activo: true,
        notificaciones: {
          email: true,
          whatsapp: false,
          recordatorios_sla: true
        }
      },
      {
        _id: new mongoose.Types.ObjectId('67680d4862732ee82e054a57'),
        nombre: 'Bernstein',
        email: 'bernstein@empresa.com',
        perfil_usuario: 2, // Agente
        cargo: 'Agente',
        departamento: 'Operaciones',
        departamento_name: 'Operaciones',
        color: '#28a745',
        activo: true,
        notificaciones: {
          email: true,
          whatsapp: false,
          recordatorios_sla: true
        }
      }
    ];

    // Crear usuarios en la base de datos
    for (const userData of users) {
      const user = new AgendaUser(userData);
      await user.save();
      console.log(`✅ Usuario creado: ${user.nombre} (${user.perfil_usuario === 0 ? 'Admin' : user.perfil_usuario === 1 ? 'Supervisor' : 'Agente'})`);
    }

    console.log('🎉 Usuarios de agenda creados exitosamente');
    console.log('\n📋 Usuarios disponibles:');
    console.log('🔴 Admin: Alejandro Botero (ID: 682e2e8d8be24eb085a7fcc5)');
    console.log('🟡 Supervisor: Yorman Salazar (ID: 673a97324cec319c00c284e1)');
    console.log('🟢 Agente: Bernstein (ID: 67680d4862732ee82e054a57)');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    await createAgendaUsers();
    console.log('\n✅ Script completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
main();



