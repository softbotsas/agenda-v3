// ============================================
// SCRIPT PARA VERIFICAR TAREAS TEMPORALES
// ============================================
// Este script verifica que las tareas temporales se muestren correctamente

const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const TaskDefinition = require('./src/models/agenda.TaskDefinition');
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

// Función para verificar tareas temporales
const verifyTemporaryTasks = async () => {
  try {
    console.log('🔍 Verificando tareas temporales...');

    // Obtener todas las tareas temporales
    const temporaryTasks = await TaskDefinition.find({ 
      task_type: 'temporary',
      active: true
    });

    console.log(`📋 Tareas temporales activas encontradas: ${temporaryTasks.length}`);

    for (const task of temporaryTasks) {
      console.log(`\n📝 Tarea: ${task.title}`);
      console.log(`   - ID: ${task._id}`);
      console.log(`   - Tipo: ${task.task_type}`);
      console.log(`   - Prioridad: ${task.priority}`);
      console.log(`   - Activa: ${task.active}`);
      console.log(`   - Configuración temporal:`);
      console.log(`     * Tipo: ${task.temporary_config?.type}`);
      console.log(`     * Fecha única: ${task.temporary_config?.single_date}`);
      console.log(`     * Rango: ${task.temporary_config?.start_date} - ${task.temporary_config?.end_date}`);
      console.log(`     * Días específicos: ${task.temporary_config?.specific_days}`);
      console.log(`     * Hora límite: ${task.temporary_config?.time_limit}`);
      
      // Verificar si debe aparecer hoy
      const today = new Date();
      const shouldShow = shouldShowTaskToday(task, today);
      console.log(`   - ¿Debe aparecer hoy? ${shouldShow ? '✅ SÍ' : '❌ NO'}`);
    }

    // Obtener todas las tareas (incluyendo inactivas)
    const allTasks = await TaskDefinition.find({ task_type: 'temporary' });
    console.log(`\n📊 Total de tareas temporales (activas + inactivas): ${allTasks.length}`);

    const activeTasks = allTasks.filter(task => task.active);
    const inactiveTasks = allTasks.filter(task => !task.active);
    
    console.log(`   - Activas: ${activeTasks.length}`);
    console.log(`   - Inactivas: ${inactiveTasks.length}`);

    if (inactiveTasks.length > 0) {
      console.log('\n🚫 Tareas temporales completadas (inactivas):');
      for (const task of inactiveTasks) {
        console.log(`   - ${task.title} (ID: ${task._id})`);
      }
    }

  } catch (error) {
    console.error('❌ Error verificando tareas temporales:', error);
  }
};

// Función para determinar si una tarea temporal debe aparecer hoy
const shouldShowTaskToday = (taskDef, targetDate = new Date()) => {
  if (taskDef.task_type !== 'temporary' || !taskDef.temporary_config) {
    return false;
  }

  const today = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const config = taskDef.temporary_config;
  
  switch (config.type) {
    case 'single':
      // Tarea de un solo día - solo aparece en esa fecha
      if (config.single_date) {
        const singleDate = new Date(config.single_date).toISOString().split('T')[0];
        return singleDate === today;
      }
      return false;
      
    case 'range':
      // Tarea de rango de fechas - aparece entre start_date y end_date
      if (config.start_date && config.end_date) {
        const startDate = new Date(config.start_date).toISOString().split('T')[0];
        const endDate = new Date(config.end_date).toISOString().split('T')[0];
        return today >= startDate && today <= endDate;
      }
      return false;
      
    case 'recurring':
      // Tarea recurrente en días específicos - aparece en esos días del mes
      if (config.specific_days && config.specific_days.length > 0) {
        const dayOfMonth = targetDate.getDate();
        return config.specific_days.includes(dayOfMonth);
      }
      return false;
      
    default:
      return false;
  }
};

// Función principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 VERIFICACIÓN DE TAREAS TEMPORALES');
    console.log('=====================================');
    
    await verifyTemporaryTasks();
    
    console.log('\n📋 Instrucciones para probar:');
    console.log('1. Ve a http://localhost:3005');
    console.log('2. Inicia sesión con cualquier usuario');
    console.log('3. Ve a la sección "Hoy"');
    console.log('4. Deberías ver la tarea temporal con borde amarillo');
    console.log('5. Ve a "Todas las tareas"');
    console.log('6. Deberías ver la tarea temporal con estilo especial');
    console.log('7. Completa la tarea');
    console.log('8. La tarea debe desaparecer de todas las vistas');
    
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



