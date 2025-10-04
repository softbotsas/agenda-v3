// controllers/auth.controller.js
const authController = {
    // Vista de login
    viewLogin: (req, res) => {
        res.render('auth/login', { titulo: 'Iniciar Sesión' });
    },

    // Vista de registro
    viewRegister: (req, res) => {
        res.render('auth/register', { titulo: 'Registrarse' });
    },

    // Procesar login
    login: (req, res) => {
        // Simulación de login - en desarrollo
        req.session.userId = '68cede72d2425a798fd91ace';
        req.session.userName = 'Laisa Rodriguez';
        res.redirect('/agenda/');
    },

    // Procesar registro
    register: (req, res) => {
        // Simulación de registro - en desarrollo
        res.redirect('/auth/login');
    },

    // Cerrar sesión
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/agenda/login');
    },

    // Simular login (para desarrollo)
    simulateLogin: (req, res) => {
        const { userId, userName } = req.body;
        console.log('🔐 Simulando login para:', userName, 'ID:', userId);
        
        req.session.userId = userId;
        req.session.userName = userName;
        
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: userId,
                name: userName
            }
        });
    },

    // Obtener usuario actual
    getCurrentUser: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'No hay usuario logueado'
                });
            }

            console.log('🔍 getCurrentUser - ID de sesión:', req.session.userId);
            
            // Obtener información completa del usuario desde la base de datos
            const agendaUserService = require('../services/agenda/agenda.userService');
            const userResult = await agendaUserService.getUserById(req.session.userId);
            
            if (userResult.success && userResult.data) {
                const user = userResult.data;
                console.log('✅ Usuario encontrado:', user.nombre);
                
                res.json({
                    success: true,
                    data: {
                        _id: user._id,
                        id: user._id,
                        name: user.nombre,
                        nombre: user.nombre,
                        correo: user.correo,
                        email: user.correo,
                        perfil_usuario: user.perfil_usuario,
                        cargo: user.cargo,
                        departamento: user.departamento,
                        departamento_name: user.departamento_name,
                        activo: user.activo,
                        role_name: user.role_name,
                        role_permissions: user.role_permissions
                    }
                });
            } else {
                console.error('❌ Usuario no encontrado en BD, usando datos de sesión');
                res.json({
                    success: true,
                    data: {
                        id: req.session.userId,
                        name: req.session.userName || 'Usuario Logueado',
                        nombre: req.session.userName || 'Usuario Logueado',
                        perfil_usuario: 3, // Empleado por defecto
                        cargo: 'Sin cargo',
                        departamento: 'Sin departamento',
                        departamento_name: 'Sin departamento'
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error en getCurrentUser:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información del usuario',
                error: error.message
            });
        }
    },

    // Obtener usuarios disponibles para login
    getAvailableUsers: async (req, res) => {
        console.log('👥 getAvailableUsers INICIANDO...');
        
        try {
            // Usar el servicio de usuarios para obtener la lista real
            const agendaUserService = require('../services/agenda/agenda.userService');
            console.log('📦 agendaUserService cargado correctamente');
            
            const users = await agendaUserService.getAllUsers();
            console.log('👥 Usuarios obtenidos del servicio:', users.length);
            console.log('👥 Primer usuario:', users[0]);
            
            // Formatear usuarios para el login con todos los datos
            const availableUsers = users.map(user => ({
                id: user._id,
                name: user.name,  // Corregido: usar user.name en lugar de user.nombre
                email: user.correo,
                role: user.perfil_usuario,
                roleText: user.perfil_usuario === 1 ? 'Admin' : user.perfil_usuario === 2 ? 'Supervisor' : 'Empleado',
                department: user.departamento_name || 'Sin departamento',
                cargo: user.cargo || 'Sin cargo',
                activo: user.activo
            }));
            
            console.log('👥 Usuarios formateados:', availableUsers.length);
            console.log('👥 Primer usuario formateado:', availableUsers[0]);
            console.log('👥 Enviando respuesta JSON...');
            
            res.json({
                success: true,
                data: availableUsers
            });
            
        } catch (error) {
            console.error('❌ ERROR CRÍTICO en getAvailableUsers:', error);
            console.error('❌ Stack trace:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios disponibles',
                error: error.message
            });
        }
    }
};

module.exports = authController;
