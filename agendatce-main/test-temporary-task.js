// ============================================
// SCRIPT DE PRUEBA PARA TAREAS TEMPORALES
// ============================================
// Este script crea una tarea temporal para probar el comportamiento

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

// Función para crear una tarea temporal de prueba
const createTemporaryTask = async () => {
  try {
    console.log('🚀 Creando tarea temporal de prueba...');

    // Obtener el primer usuario disponible
    const user = await AgendaUser.findOne({ activo: true });
    if (!user) {
      console.log('❌ No hay usuarios disponibles');
      return;
    }

    console.log('👤 Usuario encontrado:', user.nombre);

    // Crear tarea temporal para hoy
    const today = new Date().toISOString().split('T')[0];
    
    const temporaryTask = new TaskDefinition({
      title: 'Tarea Temporal de Prueba',
      description: 'Esta es una tarea temporal que debe desaparecer al completarse',
      mode: 'binary',
      periodicity: 'daily',
      target_per_period: 1,
      requires_evidence: false,
      assigned_users: [user._id],
      active: true,
      task_type: 'temporary',
      priority: 'normal',
      temporary_config: {
        type: 'single',
        single_date: today
        // time_limit: NO se especifica - las tareas temporales no tienen hora límite por defecto
      },
      created_by: user._id
    });

    await temporaryTask.save();
    console.log('✅ Tarea temporal creada:', temporaryTask._id);
    console.log('📅 Fecha de la tarea:', today);
    console.log('⏰ Hora límite:', temporaryTask.temporary_config.time_limit || 'Sin hora límite');

    return temporaryTask;

  } catch (error) {
    console.error('❌ Error creando tarea temporal:', error);
  }
};

// Función para verificar si la tarea aparece hoy
const checkTaskVisibility = async () => {
  try {
    console.log('🔍 Verificando visibilidad de tareas temporales...');

    const today = new Date();
    const tasks = await TaskDefinition.find({ 
      active: true,
      task_type: 'temporary'
    });

    console.log(`📋 Tareas temporales activas encontradas: ${tasks.length}`);

    for (const task of tasks) {
      console.log(`\n📝 Tarea: ${task.title}`);
      console.log(`   - Tipo: ${task.temporary_config?.type}`);
      console.log(`   - Fecha única: ${task.temporary_config?.single_date}`);
      console.log(`   - Rango: ${task.temporary_config?.start_date} - ${task.temporary_config?.end_date}`);
      console.log(`   - Días específicos: ${task.temporary_config?.specific_days}`);
      console.log(`   - Hora límite: ${task.temporary_config?.time_limit}`);
      
      // Verificar si debe aparecer hoy
      const shouldShow = shouldShowTaskToday(task, today);
      console.log(`   - ¿Debe aparecer hoy? ${shouldShow ? '✅ SÍ' : '❌ NO'}`);
    }

  } catch (error) {
    console.error('❌ Error verificando visibilidad:', error);
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
    
    console.log('\n🧪 PRUEBA DE TAREAS TEMPORALES');
    console.log('================================');
    
    // Crear tarea temporal
    const task = await createTemporaryTask();
    
    if (task) {
      console.log('\n🔍 Verificando visibilidad...');
      await checkTaskVisibility();
      
      console.log('\n📋 Instrucciones para probar:');
      console.log('1. Inicia el servidor: node app.js');
      console.log('2. Ve a http://localhost:3005');
      console.log('3. Inicia sesión con cualquier usuario');
      console.log('4. Ve a la sección "Hoy"');
      console.log('5. Deberías ver la tarea temporal');
      console.log('6. Completa la tarea');
      console.log('7. La tarea debe desaparecer y no volver a aparecer');
    }
    
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



