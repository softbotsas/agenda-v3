// ============================================
// SCRIPT PARA CORREGIR TAREAS TEMPORALES
// ============================================
// Este script limpia tareas duplicadas y crea las asignaciones correctas

const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const TaskDefinition = require('./src/models/agenda.TaskDefinition');
const TaskAssignment = require('./src/models/agenda.TaskAssignment');
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

// Función para limpiar tareas duplicadas
const cleanDuplicateTasks = async () => {
  try {
    console.log('🧹 Limpiando tareas duplicadas...');
    
    // Encontrar tareas temporales duplicadas
    const tempTasks = await TaskDefinition.find({ task_type: 'temporary' });
    console.log(`📋 Tareas temporales encontradas: ${tempTasks.length}`);
    
    // Agrupar por título
    const groupedTasks = {};
    tempTasks.forEach(task => {
      if (!groupedTasks[task.title]) {
        groupedTasks[task.title] = [];
      }
      groupedTasks[task.title].push(task);
    });
    
    // Eliminar duplicados, mantener solo la más reciente
    for (const title in groupedTasks) {
      const tasks = groupedTasks[title];
      if (tasks.length > 1) {
        console.log(`🔄 Encontradas ${tasks.length} tareas duplicadas: "${title}"`);
        
        // Ordenar por fecha de creación (más reciente primero)
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Mantener solo la primera (más reciente) y eliminar las demás
        const keepTask = tasks[0];
        const deleteTasks = tasks.slice(1);
        
        for (const taskToDelete of deleteTasks) {
          await TaskDefinition.findByIdAndDelete(taskToDelete._id);
          console.log(`🗑️ Eliminada tarea duplicada: ${taskToDelete._id}`);
        }
        
        console.log(`✅ Mantenida tarea: ${keepTask._id}`);
      }
    }
    
    console.log('✅ Limpieza de duplicados completada');
    
  } catch (error) {
    console.error('❌ Error limpiando duplicados:', error);
  }
};

// Función para crear asignaciones para tareas temporales
const createTaskAssignments = async () => {
  try {
    console.log('🔗 Creando asignaciones para tareas temporales...');
    
    // Obtener todas las tareas temporales activas
    const tempTasks = await TaskDefinition.find({ 
      task_type: 'temporary', 
      active: true 
    });
    
    console.log(`📋 Tareas temporales activas: ${tempTasks.length}`);
    
    for (const task of tempTasks) {
      console.log(`\n🔍 Procesando tarea: ${task.title}`);
      
      // Verificar si ya tiene asignaciones
      const existingAssignments = await TaskAssignment.find({
        task_definition: task._id
      });
      
      if (existingAssignments.length > 0) {
        console.log(`   ✅ Ya tiene ${existingAssignments.length} asignaciones`);
        continue;
      }
      
      // Crear asignaciones para cada usuario asignado
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
    }
    
    console.log('✅ Asignaciones creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando asignaciones:', error);
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('\n🔧 CORRIGIENDO TAREAS TEMPORALES');
    console.log('================================');
    
    // 1. Limpiar duplicados
    await cleanDuplicateTasks();
    
    // 2. Crear asignaciones
    await createTaskAssignments();
    
    console.log('\n✅ Corrección completada');
    console.log('\n📋 Instrucciones:');
    console.log('1. Inicia el servidor: node app.js');
    console.log('2. Ve a http://localhost:3005');
    console.log('3. Inicia sesión con cualquier usuario');
    console.log('4. Ve a la sección "Hoy"');
    console.log('5. Las tareas temporales deberían aparecer con borde amarillo');
    
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

