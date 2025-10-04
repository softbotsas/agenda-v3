const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const AgendaUser = require('./src/models/agenda.User');
const Department = require('./src/models/agenda.Department');
const Tag = require('./src/models/agenda.Tag');

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agenda_tce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para limpiar datos existentes
async function clearExistingData() {
  try {
    console.log('🧹 Limpiando datos existentes...');
    
    // Limpiar usuarios, departamentos y etiquetas
    await AgendaUser.deleteMany({});
    await Department.deleteMany({});
    await Tag.deleteMany({});
    
    console.log('✅ Datos existentes eliminados');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
}

// Crear departamento por defecto
async function createDefaultDepartment() {
  try {
    console.log('🏢 Creando departamento por defecto...');
    
    const defaultDept = new Department({
      name: 'Sin departamento',
      description: 'Departamento por defecto para usuarios sin asignación específica',
      active: true
    });
    
    await defaultDept.save();
    console.log('✅ Departamento creado:', defaultDept.name);
    
    return defaultDept._id;
  } catch (error) {
    console.error('❌ Error creando departamento:', error);
    return null;
  }
}

// Crear etiquetas básicas
async function createBasicTags() {
  try {
    console.log('🏷️ Creando etiquetas básicas...');
    
    const basicTags = [
      { name: 'Urgente', color: '#dc3545', category: 'prioridad' },
      { name: 'Importante', color: '#fd7e14', category: 'prioridad' },
      { name: 'Normal', color: '#198754', category: 'prioridad' },
      { name: 'Baja', color: '#6c757d', category: 'prioridad' },
      { name: 'Operaciones', color: '#0d6efd', category: 'area' },
      { name: 'Logística', color: '#6610f2', category: 'area' },
      { name: 'Administración', color: '#d63384', category: 'area' },
      { name: 'Recursos Humanos', color: '#20c997', category: 'area' },
      { name: 'Diario', color: '#ffc107', category: 'frecuencia' },
      { name: 'Semanal', color: '#17a2b8', category: 'frecuencia' },
      { name: 'Mensual', color: '#6f42c1', category: 'frecuencia' }
    ];
    
    const createdTags = [];
    for (const tagData of basicTags) {
      const tag = new Tag({
        name: tagData.name,
        color: tagData.color,
        category: tagData.category,
        active: true
      });
      await tag.save();
      createdTags.push(tag);
    }
    
    console.log(`✅ ${createdTags.length} etiquetas creadas`);
    return createdTags;
  } catch (error) {
    console.error('❌ Error creando etiquetas:', error);
    return [];
  }
}

// Crear usuario administrador inicial
async function createAdminUser(departmentId) {
  try {
    console.log('👤 Creando usuario administrador...');
    
    const adminUser = new AgendaUser({
      nombre: 'Administrador',
      email: 'admin@tce.com',
      cargo: 'Administrador del Sistema',
      departamento: departmentId,
      perfil_usuario: 1, // Administrador
      activo: true,
      color: '#007bff',
      notificaciones: {
        email: true,
        whatsapp: true,
        recordatorios_sla: true
      }
    });
    
    await adminUser.save();
    console.log('✅ Usuario administrador creado:');
    console.log('   📧 Email: admin@tce.com');
    console.log('   👤 Nombre: Administrador');
    console.log('   🔑 Perfil: Administrador (acceso completo)');
    console.log('   🆔 ID:', adminUser._id);
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    return null;
  }
}

// Función principal
async function seed() {
  console.log('🌱 Iniciando proceso de seed...\n');
  
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Limpiar datos existentes
    await clearExistingData();
    
    // Crear departamento por defecto
    const departmentId = await createDefaultDepartment();
    
    // Crear etiquetas básicas
    await createBasicTags();
    
    // Crear usuario administrador
    const adminUser = await createAdminUser(departmentId);
    
    if (adminUser) {
      console.log('\n🎉 ¡Seed completado exitosamente!');
      console.log('\n📋 INSTRUCCIONES PARA USAR EL SISTEMA:');
      console.log('1. Ejecuta: npm start');
      console.log('2. Ve a: http://localhost:3000/agenda/login');
      console.log('3. Inicia sesión con: admin@tce.com');
      console.log('4. ¡Comienza a crear tareas y usuarios!');
      console.log('\n💡 CONSEJOS:');
      console.log('- Puedes crear más usuarios desde Configuración > Empleados');
      console.log('- Las etiquetas básicas ya están disponibles');
      console.log('- El departamento "Sin departamento" está listo para usar');
    } else {
      console.log('❌ Error: No se pudo crear el usuario administrador');
    }
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seed();
}

module.exports = { seed };
