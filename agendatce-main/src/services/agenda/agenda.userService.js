// Servicio para manejo de usuarios (simulado por ahora)
// TODO: Integrar con BD empresa cuando esté disponible

const mongoose = require('mongoose');

// Obtener información de rol por ID
const getUserRole = (perfilUsuario) => {
  const roles = {
    0: {
      name: 'Admin',
      permissions: ['create_task', 'edit_task', 'delete_task', 'manage_users', 'view_reports', 'manage_departments']
    },
    1: {
      name: 'Supervisor',
      permissions: ['create_task', 'edit_task', 'view_reports', 'manage_users']
    },
    3: {
      name: 'Empleado',
      permissions: ['view_tasks', 'complete_tasks']
    },
    2: {
      name: 'Empleado',
      permissions: ['view_tasks', 'complete_tasks']
    },
    8: {
      name: 'Empleado',
      permissions: ['view_tasks', 'complete_tasks']
    }
  };
  
  return roles[perfilUsuario] || roles[3]; // Por defecto empleado
};

// Obtener usuario por ID
const getUserById = async (userId) => {
  try {
    console.log('🔍 getUserById - ID:', userId);
    
    const User = require('../../models/agenda.User');
    const realUser = await User.findById(userId);
    
    if (!realUser) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }
    
    console.log('✅ Usuario encontrado:', realUser.nombre);
    
    // Mapear los campos reales a la estructura esperada
    const mappedUser = {
      _id: realUser._id,
      name: realUser.nombre || 'Usuario Sin Nombre',
      nombre: realUser.nombre || 'Usuario Sin Nombre',
      correo: realUser.email || 'sin-email@tce.com',
      perfil_usuario: realUser.perfil_usuario !== undefined ? realUser.perfil_usuario : 3,
      cargo: realUser.cargo || 'Sin cargo',
      departamento: realUser.departamento || 'Sin departamento',
      departamento_name: realUser.departamento_name || 'Sin departamento',
      activo: realUser.activo !== undefined ? realUser.activo : true,
      user_id: realUser.user_id,
      color: realUser.color,
      notificaciones: realUser.notificaciones
    };
    
    // Agregar información de rol
    const roleInfo = getUserRole(mappedUser.perfil_usuario);
    mappedUser.role_name = roleInfo.name;
    mappedUser.role_permissions = roleInfo.permissions;
    
    console.log('👤 Usuario mapeado:', mappedUser.name, '- Rol:', mappedUser.role_name);
    
    return {
      success: true,
      data: mappedUser
    };
  } catch (error) {
    console.error('❌ Error getting user by ID:', error);
    return {
      success: false,
      message: 'Error al obtener usuario'
    };
  }
};

// Verificar si usuario es admin
const isAdmin = async (userId) => {
  try {
    const userResult = await getUserById(userId);
    
    if (!userResult.success) {
      return false;
    }

    // perfil_usuario: 0 = Admin, 1 = Supervisor, 2+ = Empleado
    return userResult.data.perfil_usuario === 0;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Verificar si usuario es supervisor o admin
const isSupervisorOrAdmin = async (userId) => {
  try {
    const userResult = await getUserById(userId);
    
    if (!userResult.success) {
      return false;
    }

    // perfil_usuario: 0 = Admin, 1 = Supervisor, 2+ = Empleado
    return userResult.data.perfil_usuario <= 1;
  } catch (error) {
    console.error('Error checking supervisor status:', error);
    return false;
  }
};

// Obtener todos los usuarios (para asignaciones)
const getAllUsers = async () => {
  try {
    console.log('🔍 getAllUsers - Obteniendo usuarios de BD...');
    
    const User = require('../../models/agenda.User');
    const realUsers = await User.find({ activo: true });
    
    console.log('✅ Usuarios encontrados:', realUsers.length);
    
    // Mapear los campos reales a la estructura esperada
    const mappedUsers = realUsers.map(user => ({
      _id: user._id,
      name: user.nombre || 'Usuario Sin Nombre',
      nombre: user.nombre || 'Usuario Sin Nombre',
      correo: user.email || 'sin-email@tce.com',
      perfil_usuario: user.perfil_usuario !== undefined ? user.perfil_usuario : 3,
      cargo: user.cargo || 'Sin cargo',
      departamento: user.departamento || 'Sin departamento',
      departamento_name: user.departamento_name || 'Sin departamento',
      activo: user.activo !== undefined ? user.activo : true,
      user_id: user.user_id,
      color: user.color,
      notificaciones: user.notificaciones
    }));
    
    return {
      success: true,
      data: mappedUsers
    };
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error.message);
    return {
      success: false,
      message: 'Error al obtener usuarios'
    };
  }
};

// Obtener usuarios por rol
const getUsersByRole = async (role) => {
  try {
    const User = require('../../models/agenda.User');
    const users = await User.find({ activo: true, perfil_usuario: role });
    
    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error('Error getting users by role:', error);
    return {
      success: false,
      message: 'Error al obtener usuarios por rol'
    };
  }
};

// Obtener todos los departamentos
const getDepartments = async () => {
  try {
    const Department = require('../../models/agenda.Department');
    const departments = await Department.find({ active: true });
    return departments;
  } catch (error) {
    console.error('Error getting departments:', error);
    return [];
  }
};

// Obtener departamento por ID
const getDepartmentById = async (departmentId) => {
  try {
    const Department = require('../../models/agenda.Department');
    const department = await Department.findById(departmentId);
    return department;
  } catch (error) {
    console.error('Error getting department by ID:', error);
    return null;
  }
};

// Obtener nombre del departamento por ID
const getDepartmentName = async (departmentId) => {
  try {
    const department = await getDepartmentById(departmentId);
    return department ? department.name : 'Sin departamento';
  } catch (error) {
    console.error('Error getting department name:', error);
    return 'Sin departamento';
  }
};

// Obtener usuarios por departamento
const getUsersByDepartment = async (departmentId) => {
  try {
    const User = require('../../models/agenda.User');
    const users = await User.find({ activo: true, departamento: departmentId });
    return users;
  } catch (error) {
    console.error('Error getting users by department:', error);
    return [];
  }
};

// Obtener estadísticas por departamento
const getDepartmentStats = async (departmentId) => {
  try {
    const users = await getUsersByDepartment(departmentId);
    const department = await getDepartmentById(departmentId);
    
    return {
      department: department,
      total_users: users.length,
      admins: users.filter(u => u.perfil_usuario === 0).length,
      supervisors: users.filter(u => u.perfil_usuario === 1).length,
      employees: users.filter(u => u.perfil_usuario > 1).length
    };
  } catch (error) {
    console.error('Error getting department stats:', error);
    return {
      department: null,
      total_users: 0,
      admins: 0,
      supervisors: 0,
      employees: 0
    };
  }
};

// Crear nuevo usuario
const createUser = async (userData) => {
  try {
    console.log('➕ createUser - Datos recibidos:', JSON.stringify(userData, null, 2));
    
    // Validar datos requeridos
    if (!userData.name || !userData.correo || !userData.perfil_usuario || !userData.departamento) {
      throw new Error('Faltan datos requeridos para crear usuario');
    }
    
    // Obtener nombre del departamento
    const departmentName = await getDepartmentName(userData.departamento);
    console.log('🏢 Departamento encontrado:', departmentName);
    
    const User = require('../../models/agenda.User');
    
    const newUserData = {
      nombre: userData.name,
      email: userData.correo,
      perfil_usuario: userData.perfil_usuario,
      cargo: userData.cargo || '',
      departamento: userData.departamento,
      departamento_name: departmentName,
      activo: userData.activo !== undefined ? userData.activo : true,
      color: '#007bff',
      notificaciones: {
        email: true,
        whatsapp: false,
        recordatorios_sla: true
      }
    };
    
    const savedUser = await User.create(newUserData);
    console.log('✅ Usuario creado en BD:', savedUser._id);
    
    // Mapear el usuario de BD a la estructura esperada
    const mappedUser = {
      _id: savedUser._id,
      name: savedUser.nombre,
      nombre: savedUser.nombre,
      correo: savedUser.email,
      perfil_usuario: savedUser.perfil_usuario,
      cargo: savedUser.cargo,
      departamento: savedUser.departamento,
      departamento_name: savedUser.departamento_name,
      activo: savedUser.activo,
      created_at: savedUser.createdAt
    };
    
    return mappedUser;
  } catch (error) {
    console.error('❌ Error en createUser:', error);
    throw error;
  }
};

// Obtener todos los departamentos
const getAllDepartments = async () => {
  try {
    console.log('🏢 getAllDepartments - Obteniendo todos los departamentos');
    
    const Department = require('../../models/agenda.Department');
    const departments = await Department.find({ active: true });
    
    console.log('✅ Departamentos encontrados:', departments.length);
    return departments;
  } catch (error) {
    console.error('Error en getAllDepartments:', error);
    return [];
  }
};

// Crear nuevo departamento
const createDepartment = async (departmentData) => {
  try {
    console.log('➕ createDepartment - Datos:', departmentData);
    
    const Department = require('../../models/agenda.Department');
    
    const realDepartment = new Department({
      name: departmentData.name,
      code: departmentData.code,
      description: departmentData.description,
      country: departmentData.country || 'No especificado',
      active: departmentData.active !== undefined ? departmentData.active : true,
      created_by: departmentData.created_by
    });
    
    const savedDepartment = await realDepartment.save();
    console.log('✅ Departamento creado en BD:', savedDepartment);
    return savedDepartment;
  } catch (error) {
    console.error('Error en createDepartment:', error);
    throw error;
  }
};

// Actualizar empleado
const updateUser = async (userId, userData) => {
  try {
    console.log('✏️ updateUser - ID:', userId, 'Datos:', JSON.stringify(userData, null, 2));
    
    const User = require('../../models/agenda.User');
    
    // Obtener nombre del departamento
    const departmentName = await getDepartmentName(userData.departamento);
    
    const updateData = {
      nombre: userData.name,
      email: userData.correo,
      perfil_usuario: userData.perfil_usuario,
      cargo: userData.cargo || '',
      departamento: userData.departamento,
      departamento_name: departmentName,
      activo: userData.activo !== undefined ? userData.activo : true
    };
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!updatedUser) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    console.log('✅ Usuario actualizado en BD:', updatedUser._id);
    
    // Mapear el usuario de BD a la estructura esperada
    const mappedUser = {
      _id: updatedUser._id,
      name: updatedUser.nombre,
      nombre: updatedUser.nombre,
      correo: updatedUser.email,
      perfil_usuario: updatedUser.perfil_usuario,
      cargo: updatedUser.cargo,
      departamento: updatedUser.departamento,
      departamento_name: updatedUser.departamento_name,
      activo: updatedUser.activo,
      updated_at: updatedUser.updatedAt
    };
    
    return mappedUser;
  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    throw error;
  }
};

// Eliminar empleado (soft delete)
const deleteUser = async (userId) => {
  try {
    console.log('🗑️ deleteUser - ID:', userId);
    
    const User = require('../../models/agenda.User');
    
    // Soft delete - marcar como inactivo
    const deletedUser = await User.findByIdAndUpdate(userId, { 
      activo: false,
      deleted_at: new Date()
    }, { new: true });
    
    if (!deletedUser) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    console.log('✅ Usuario eliminado en BD (soft delete):', deletedUser.nombre);
    return { success: true, message: 'Usuario eliminado correctamente' };
  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    throw error;
  }
};

// Obtener empleado por ID para edición
const getUserByIdForEdit = async (userId) => {
  try {
    console.log('👤 getUserByIdForEdit - ID:', userId);
    
    const User = require('../../models/agenda.User');
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    console.log('✅ Usuario encontrado en BD para edición:', user.nombre);
    
    // Mapear el usuario de BD a la estructura esperada
    const mappedUser = {
      _id: user._id,
      name: user.nombre,
      nombre: user.nombre,
      correo: user.email,
      perfil_usuario: user.perfil_usuario,
      cargo: user.cargo,
      departamento: user.departamento,
      departamento_name: user.departamento_name,
      activo: user.activo,
      user_id: user.user_id, // Agregar el user_id para el enlace con el sistema principal
      color: user.color,
      notificaciones: user.notificaciones
    };
    
    return mappedUser;
  } catch (error) {
    console.error('❌ Error en getUserByIdForEdit:', error);
    throw error;
  }
};

// Obtener usuario de agenda por ID del sistema principal
const getUserBySystemUserId = async (systemUserId) => {
  try {
    console.log('🔍 getUserBySystemUserId aaaaaaaaa - systemUserId:', systemUserId);
    
    // Primero buscar el usuario en el sistema principal
    const SystemUser = require('../../../../models/Users');
    const systemUser = await SystemUser.findById(systemUserId);
    
    if (!systemUser) {
      console.log('❌ Usuario del sistema principal no encontrado:', systemUserId);
      return {
        success: false,
        message: 'Usuario del sistema principal no encontrado'
      };
    }
    
   
    
    // Buscar si ya existe un usuario de agenda vinculado
    const AgendaUser = require('../../models/agenda.User');
    let agendaUser = await AgendaUser.findOne({ user_id: systemUserId });
    

    if (!agendaUser) {
      console.log('⚠️ Usuario de agenda no encontrado, creando automáticamente...');
      

      // Crear usuario de agenda automáticamente
      const newAgendaUserData = {
        nombre: systemUser.name || 'Usuario Sin Nombre',
        email: systemUser.correo || systemUser.email || 'sin-email@tce.com',
        user_id: new mongoose.Types.ObjectId(systemUserId),
        perfil_usuario: systemUser.perfil_usuario, // Usar perfil del sistema principal
        cargo: systemUser.cargo || 'Sin cargo',
        departamento: systemUser.agencia || 'Sin departamento', // Usar agencia como departamento
        departamento_name: systemUser.agencia || 'Sin departamento',
        activo: systemUser.status !== false, // Usar status del sistema principal
        color: '#007bff',
        notificaciones: {
          email: true,
          whatsapp: false,
          recordatorios_sla: true
        }
      };
      
      agendaUser = await AgendaUser.create(newAgendaUserData);
      console.log('✅ Usuario de agenda creado automáticamente:', agendaUser.nombre);
      
      // Actualizar el usuario del sistema principal con el enlace
      await SystemUser.findByIdAndUpdate(systemUserId, {
        agenda_user: agendaUser._id
      });
      console.log('✅ Enlace bidireccional establecido');
    } else {
      console.log('✅ Usuario de agenda existente encontrado:', agendaUser.nombre);
    }
    
    // Mapear a la estructura esperada
    const mappedUser = {
      _id: agendaUser._id,
      name: agendaUser.nombre || 'Usuario Sin Nombre',
      nombre: agendaUser.nombre || 'Usuario Sin Nombre',
      correo: agendaUser.email || 'sin-email@tce.com',
      perfil_usuario: agendaUser.perfil_usuario !== undefined ? agendaUser.perfil_usuario : 3,
      cargo: agendaUser.cargo || 'Sin cargo',
      departamento: agendaUser.departamento || 'Sin departamento',
      departamento_name: agendaUser.departamento_name || 'Sin departamento',
      activo: agendaUser.activo !== undefined ? agendaUser.activo : true,
      user_id: agendaUser.user_id,
      color: agendaUser.color,
      notificaciones: agendaUser.notificaciones
    };
    
    // Agregar información de rol
    const roleInfo = getUserRole(mappedUser.perfil_usuario);
    mappedUser.role_name = roleInfo.name;
    mappedUser.role_permissions = roleInfo.permissions;
    
    return {
      success: true,
      data: mappedUser
    };
  } catch (error) {
    console.error('❌ Error getting agenda user by system user ID:', error);
    return {
      success: false,
      message: 'Error al obtener usuario de agenda'
    };
  }
};

// Obtener usuarios del sistema principal
const getSystemUsers = async () => {
  try {
    console.log('🔍 getSystemUsers - Obteniendo usuarios del sistema principal...');
    
    const User = require('../../../../models/Users'); // Modelo del sistema principal
    const systemUsers = await User.find().sort({ name: 1 }); 
    
    console.log('✅ Usuarios del sistema encontrados:', systemUsers.length);
    
    return {
      success: true,
      data: systemUsers
    };
  } catch (error) {
    console.error('❌ Error getting system users:', error);
    return {
      success: false,
      message: 'Error al obtener usuarios del sistema principal'
    };
  }
};

// Crear usuario de agenda con enlace al sistema principal
const createAgendaUserWithLink = async (agendaUserData, systemUserId) => {
  try {
    console.log('🔗 createAgendaUserWithLink - Datos:', agendaUserData, 'systemUserId:', systemUserId);
    
    const User = require('../../models/agenda.User');
    
    const newAgendaUserData = {
      nombre: agendaUserData.nombre,
      email: agendaUserData.email,
      user_id: systemUserId, // Enlace al usuario del sistema principal
      perfil_usuario: agendaUserData.perfil_usuario,
      cargo: agendaUserData.cargo || '',
      departamento: agendaUserData.departamento,
      departamento_name: agendaUserData.departamento_name,
      activo: agendaUserData.activo !== undefined ? agendaUserData.activo : true,
      color: agendaUserData.color || '#007bff',
      notificaciones: agendaUserData.notificaciones || {
        email: true,
        whatsapp: false,
        recordatorios_sla: true
      }
    };
    
    const savedAgendaUser = await User.create(newAgendaUserData);
    console.log('✅ Usuario de agenda creado con enlace:', savedAgendaUser._id);
    
    // Actualizar el usuario del sistema principal con el enlace
    const SystemUser = require('../../../models/Users');
    await SystemUser.findByIdAndUpdate(systemUserId, {
      agenda_user: savedAgendaUser._id
    });
    
    console.log('✅ Enlace bidireccional establecido');
    
    // Mapear a la estructura esperada
    const mappedUser = {
      _id: savedAgendaUser._id,
      name: savedAgendaUser.nombre,
      nombre: savedAgendaUser.nombre,
      correo: savedAgendaUser.email,
      perfil_usuario: savedAgendaUser.perfil_usuario,
      cargo: savedAgendaUser.cargo,
      departamento: savedAgendaUser.departamento,
      departamento_name: savedAgendaUser.departamento_name,
      activo: savedAgendaUser.activo,
      user_id: savedAgendaUser.user_id,
      color: savedAgendaUser.color,
      notificaciones: savedAgendaUser.notificaciones
    };
    
    return {
      success: true,
      data: mappedUser
    };
  } catch (error) {
    console.error('❌ Error creating agenda user with link:', error);
    return {
      success: false,
      message: 'Error al crear usuario de agenda con enlace'
    };
  }
};

module.exports = {
  getUserById,
  getUserRole,
  isAdmin,
  isSupervisorOrAdmin,
  getAllUsers,
  getUsersByRole,
  getDepartments,
  getDepartmentById,
  getUsersByDepartment,
  getDepartmentStats,
  createUser,
  updateUser,
  deleteUser,
  getUserByIdForEdit,
  getAllDepartments,
  createDepartment,
  getUserBySystemUserId,
  getSystemUsers,
  createAgendaUserWithLink
};
