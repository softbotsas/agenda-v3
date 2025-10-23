// ============================================
// SCRIPT PARA CORREGIR TAREAS TEMPORALES EXISTENTES
// ============================================
// Este script crea asignaciones para tareas temporales que no las tienen

const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const TaskDefinition = require('./src/models/agenda.TaskDefinition');
const TaskAssignment = require('./src/models/agenda.TaskAssignment');

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

// Función para corregir tareas temporales existentes
const fixExistingTemporaryTasks = async () => {
  try {
    console.log('🔧 Corrigiendo tareas temporales existentes...');
    
    // Obtener todas las tareas temporales
    const tempTasks = await TaskDefinition.find({ 
      task_type: 'temporary',
      active: true 
    });
    
    console.log(`📋 Tareas temporales encontradas: ${tempTasks.length}`);
    
    for (const task of tempTasks) {
      console.log(`\n🔍 Procesando: ${task.title}`);
      
      // Verificar si ya tiene asignaciones
      const existingAssignments = await TaskAssignment.find({
        task_definition: task._id
      });
      
      if (existingAssignments.length > 0) {
        console.log(`   ✅ Ya tiene ${existingAssignments.length} asignaciones`);
        continue;
      }
      
      // Crear asignaciones para cada usuario asignado
      if (task.assigned_users && task.assigned_users.length > 0) {
        for (const userId of task.assigned_users) {
          const assignment = new TaskAssignment({
            task_definition: task._id,
            user: userId,
            assignment_type: 'specific',
            assigned_by: task.created_by,
            status: 'active',
            created_at: new Date()
          });
          
          await assignment.save();
          console.log(`   ✅ Asignación creada para usuario: ${userId}`);
        }
      } else {
        console.log(`   ⚠️ No tiene usuarios asignados`);
      }
    }
    
    console.log('\n✅ Corrección completada');
    
  } catch (error) {
    console.error('❌ Error corrigiendo tareas:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('\n🔧 CORRIGIENDO TAREAS TEMPORALES EXISTENTES');
    console.log('==========================================');
    
    await fixExistingTemporaryTasks();
    
    console.log('\n📋 Instrucciones:');
    console.log('1. Inicia el servidor: node app.js');
    console.log('2. Ve a http://localhost:3005');
    console.log('3. Inicia sesión con cualquier usuario');
    console.log('4. Ve a la sección "Hoy"');
    console.log('5. Todas las tareas temporales deberían aparecer con borde amarillo');
    
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
main();


