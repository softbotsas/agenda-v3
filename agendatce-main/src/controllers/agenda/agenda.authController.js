// Controlador de autenticación integrado con sistema principal
// Usa req.session.userId del sistema principal

const UserService = require('../../services/agenda/agenda.userService');

// Verificar sesión del sistema principal
const checkSession = async (req, res) => {
  try {
    // El sistema principal ya estableció req.session.userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'No hay sesión activa en el sistema principal'
      });
    }

    // Buscar el usuario de agenda vinculado al usuario del sistema principal
    const userResult = await UserService.getUserBySystemUserId(req.session.userId);
    
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Usuario de agenda no encontrado para este usuario del sistema',
        systemUserId: req.session.userId
      });
    }

    res.json({
      success: true,
      message: 'Sesión válida',
      user: userResult.data,
      systemUserId: req.session.userId
    });
  } catch (error) {
    console.error('Error in checkSession:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cerrar sesión
const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }
      
      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuario actual desde el sistema principal
const getCurrentUser = async (req, res) => {
  console.log('🔍 buenas ntardeeeee:');


  try {
    console.log('🔍 getCurrentUser - req.session:', req.session);
    
    // El sistema principal ya estableció req.session.userId
    if (!req.session || !req.session.userId) {
      console.log('❌ getCurrentUser - No hay sesión válida');
      return res.status(401).json({
        success: false,
        message: 'No hay sesión activa en el sistema principal'
      });
    }

    // Buscar el usuario de agenda vinculado al usuario del sistema principal
    const userResult = await UserService.getUserBySystemUserId(req.session.userId);
    
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Usuario de agenda no encontrado para este usuario del sistema',
        systemUserId: req.session.userId
      });
    }

    console.log('🔍 getCurrentUser - Usuario encontrado:', {
      systemUserId: req.session.userId,
      agendaUserId: userResult.data._id,
      nombre: userResult.data.nombre
    });
    
    res.json({
      success: true,
      data: userResult.data
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuarios del sistema principal para enlace con agenda
const getAvailableUsers = async (req, res) => {
  try {
    console.log('🔍 getAvailableUsers - Obteniendo usuarios del sistema principal...');
    
    const usersResult = await UserService.getSystemUsers();
    console.log('🔍 getAvailableUsers - usersResult:', {
      success: usersResult.success,
      dataLength: usersResult.data ? usersResult.data.length : 'undefined',
      firstUser: usersResult.data ? usersResult.data[0] : 'undefined'
    });
    
    if (!usersResult.success) {
      console.log('❌ getAvailableUsers - usersResult.success es false');
      return res.status(500).json(usersResult);
    }

    if (!usersResult.data || !Array.isArray(usersResult.data)) {
      console.log('❌ getAvailableUsers - usersResult.data no es un array válido');
      return res.status(500).json({
        success: false,
        message: 'Datos de usuarios no válidos'
      });
    }

    // Filtrar información sensible y mostrar solo usuarios sin enlace a agenda
    console.log('🔍 getAvailableUsers - Mapeando usuarios del sistema...');
    const safeUsers = usersResult.data.map((user, index) => {
      console.log(`🔍 Usuario del sistema ${index + 1}:`, {
        _id: user._id,
        name: user.name,
        correo: user.correo,
        perfil_usuario: user.perfil_usuario,
        agenda_user: user.agenda_user
      });
      
      return {
        _id: user._id,
        name: user.name || 'Usuario Sin Nombre',
        correo: user.correo || 'sin-email@tce.com',
        perfil_usuario: user.perfil_usuario || 3,
        cargo: user.cargo || 'Sin cargo',
        role_name: user.perfil_usuario === 1 ? 'Admin' : 
                   user.perfil_usuario === 2 ? 'Supervisor' : 'Empleado',
        has_agenda_link: !!user.agenda_user,
        agenda_user_id: user.agenda_user
      };
    });

    console.log('✅ getAvailableUsers - Usuarios del sistema mapeados exitosamente:', safeUsers.length);
    
    res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error('❌ Error in getAvailableUsers:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  checkSession,
  logout,
  getCurrentUser,
  getAvailableUsers
};

