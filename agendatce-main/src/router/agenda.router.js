const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

console.log('🚀 Cargando router de agenda TCE...');

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    },
    fileFilter: function (req, file, cb) {
        // Permitir imágenes, PDFs y documentos según el formulario
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

// Importar controladores
const authController = require('../controllers/auth.controller');
const agendaAuthController = require('../controllers/agenda/agenda.authController');
const configController = require('../controllers/agenda/agenda.configController');
const configurationController = require('../controllers/agenda/agenda.configurationController');
const dashboardController = require('../controllers/agenda/agenda.dashboardController');
const taskController = require('../controllers/agenda/agenda.taskController');
const taskControllerSimple = require('../controllers/agenda/agenda.taskControllerSimple');
const taskManagementController = require('../controllers/agenda/agenda.taskManagementController');

// Importar middlewares de roles
const { requireAdmin, requireSupervisorOrAdmin, requirePermission } = require('../middleware/roleAuth');

// Middleware de autenticación real
const authenticateToken = async (req, res, next) => {
    console.log('🔐 authenticateToken - req.session:', req.session);
    console.log('🔐 authenticateToken - req.session.userId:', req.session?.userId);
    
    // Verificar que el usuario esté logueado
    if (!req.session || !req.session.userId) {
        console.log('❌ authenticateToken - No hay sesión activa');
        // Si es una petición AJAX, devolver JSON
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autorizado. Debe iniciar sesión.' 
            });
        }
        // Si es una petición normal, redirigir al login
        return res.redirect('/agenda/login');
    }
    
    try {
        // Buscar el empleado de agenda vinculado al usuario del sistema principal
        const UserService = require('../services/agenda/agenda.userService');
        const userResult = await UserService.getUserBySystemUserId(req.session.userId);
        
        if (!userResult.success) {
            console.log('❌ authenticateToken - Empleado de agenda no encontrado para:', req.session.userId);
            return res.status(401).json({
                success: false,
                message: 'Usuario de agenda no encontrado'
            });
        }
        
        // Usar el ID del empleado de agenda
        req.user = { 
            _id: userResult.data._id,                    // ID del empleado de agenda
            id: userResult.data._id,                     // Alias para compatibilidad
            systemUserId: req.session.userId,           // Mantener referencia al usuario principal
            nombre: userResult.data.nombre,
            email: userResult.data.email,
            cargo: userResult.data.cargo,
            departamento: userResult.data.departamento,
            perfil_usuario: userResult.data.perfil_usuario
        };
        
       
       
        next();
    } catch (error) {
        console.error('❌ authenticateToken - Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};

// Rutas de autenticación (sin middleware de auth)
router.get('/login', (req, res) => {
    res.render('agenda/login', { titulo: 'Login - Sistema de Agenda TCE' });
});
router.post('/auth/check-session', agendaAuthController.checkSession);
router.post('/auth/logout', agendaAuthController.logout);
router.get('/auth/current-user', agendaAuthController.getCurrentUser);

router.get('/api/user/current', authenticateToken, agendaAuthController.getCurrentUser);
router.get('/auth/available-users', agendaAuthController.getAvailableUsers);

// Ruta de prueba para verificar que el router funciona
router.get('/test', (req, res) => {
    console.log('🧪 Ruta de prueba accedida');
    res.json({ 
        success: true, 
        message: 'Router de agenda funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta principal de agenda
router.get('/', authenticateToken, (req, res) => {
    console.log('✅ Acceso autorizado a agenda TCE para usuario:', req.session.userId);
    res.render('agenda/main', { 
        titulo: 'Sistema de Agenda TCE',
        version: Date.now() // Para evitar cache
    });
});

// Rutas para cargar secciones dinámicamente
router.get('/sections/:section', async (req, res) => {
    const section = req.params.section;
    const validSections = ['dashboard', 'today', 'all-tasks', 'history', 'configuration', 'confirmations', 'reconfirmations'];
    
    if (!validSections.includes(section)) {
        return res.status(404).send('Sección no encontrada');
    }
    
    // Verificar permisos para secciones de admin
    if (['history', 'configuration'].includes(section)) {
        // Obtener información completa del usuario
      //  const UserService = require('../services/agenda/agenda.userService');
        //const userResult = await UserService.getUserBySystemUserId(req.session.userId);
        
        //if (!userResult.success) {
        //    return res.status(403).send('Usuario no encontrado');
        //}
        
        const userProfile = req.session.datos_permi.perfil;
        
        // Configuración: Solo admin (perfil_usuario === 1)
        if (section === 'configuration' && userProfile !== 0) {
            return res.status(403).send('Acceso denegado - Solo administradores');
        }
        
        // Historial: Admin y Supervisor (perfil_usuario === 0 o 1)
        if (section === 'history' && userProfile !== 0 && userProfile !== 1) {
            return res.status(403).send('Acceso denegado - Solo administradores y supervisores');
        }
    }
    
    res.render(`agenda/sections/${section}`, {
        user: req.user
    });
});

// API Routes para tareas - Conectar con base de datos real
router.get('/api/tasks/today', authenticateToken, taskController.getTodayTasks);

router.post('/api/tasks/log', authenticateToken, taskController.logTask);

// Rutas SIMPLES para tareas (sin errores)
router.post('/agenda/api/tasks/complete', authenticateToken, upload.single('evidence_file'), taskControllerSimple.completeTask);
router.post('/api/tasks/register-action', authenticateToken, taskControllerSimple.registerAction);
router.post('/agenda/api/tasks/not-applicable', authenticateToken, taskControllerSimple.markNotApplicable);
router.post('/agenda/api/tasks/complete-all-overdue', authenticateToken, taskControllerSimple.completeAllOverdue);
router.post('/agenda/api/tasks/skip-all-overdue', authenticateToken, taskControllerSimple.skipAllOverdue);

// Rutas simples para tareas atrasadas
router.post('/agenda/api/tasks/overdue/not-applicable', authenticateToken, (req, res) => {
  const overdueService = require('../services/agenda/agenda.overdueService');
  const { taskId, reason } = req.body;
  const userId = req.session.userId;
  
  overdueService.markOverdueTaskAsNotApplicable(taskId, userId, reason)
    .then(result => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    })
    .catch(error => {
      console.error('Error en ruta not-applicable:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    });
});

router.post('/agenda/api/tasks/overdue/retroactive', authenticateToken, (req, res) => {
  const overdueService = require('../services/agenda/agenda.overdueService');
  const { taskId, retroactiveDate, comment } = req.body;
  const userId = req.session.userId;
  
  overdueService.completeOverdueTaskRetroactive(taskId, userId, retroactiveDate, comment)
    .then(result => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    })
    .catch(error => {
      console.error('Error en ruta retroactive:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    });
});

router.get('/api/dashboard', authenticateToken, dashboardController.getDashboard);

router.get('/api/dashboard/all-users', authenticateToken, dashboardController.getAllUsersDashboard);

// Rutas de configuración de usuarios (solo admin)
router.get('/api/config/users', authenticateToken, requireAdmin, configController.getAgendaUsers);
router.post('/api/config/users', authenticateToken, requireAdmin, configController.createAgendaUser);
router.put('/api/config/users/:id', authenticateToken, requireAdmin, configController.updateAgendaUser);
router.delete('/api/config/users/:id', authenticateToken, requireAdmin, configController.deleteAgendaUser);
router.get('/api/config/system-users', authenticateToken, requireAdmin, configController.getSystemUsers);

// Rutas de configuración de tareas (solo admin)
router.get('/api/config/tasks', authenticateToken, configurationController.getTasks);
router.post('/api/config/tasks', authenticateToken, requirePermission('create_task'), configurationController.createTask);
router.put('/api/config/tasks/:id', authenticateToken, requirePermission('edit_task'), configurationController.updateTask);
router.delete('/api/config/tasks/:id', authenticateToken, requirePermission('delete_task'), configurationController.deleteTask);

// Rutas de asignaciones (solo admin)
router.get('/api/config/assignments', authenticateToken, requireAdmin, configController.getTaskAssignments);
router.post('/api/config/assignments', authenticateToken, requireAdmin, configController.createTaskAssignment);
router.delete('/api/config/assignments/:id', authenticateToken, requireAdmin, configController.deleteTaskAssignment);

// Rutas de etiquetas (solo admin)
router.get('/api/config/tags', authenticateToken, configurationController.getTags);
router.post('/api/config/tags', authenticateToken, requireAdmin, configurationController.createTag);
router.put('/api/config/tags/:id', authenticateToken, requireAdmin, configController.updateTag);
router.delete('/api/config/tags/:id', authenticateToken, requireAdmin, configController.deleteTag);
router.get('/api/config/tag-categories', authenticateToken, configController.getTagCategories);

// Rutas del dashboard
router.get('/api/dashboard/stats', authenticateToken, taskController.getDashboardStats);
router.get('/api/dashboard/weekly', authenticateToken, taskController.getWeeklyProgress);
router.get('/api/tasks/priority', authenticateToken, taskController.getPriorityTasks);
router.get('/api/activity/recent', authenticateToken, taskController.getRecentActivity);
router.get('/api/tasks/all', authenticateToken, requireAdmin, taskController.getAllTasks);
router.get('/api/tasks/my-tasks', authenticateToken, taskController.getMyTasks);

// Rutas de configuración - Lectura permitida para supervisores (historial), escritura solo admin
router.get('/api/configuration/employees', authenticateToken, requireSupervisorOrAdmin, configurationController.getEmployees);
router.post('/api/configuration/employees', authenticateToken, requireAdmin, configurationController.createEmployee);
router.get('/api/configuration/employees/:id', authenticateToken, requireSupervisorOrAdmin, configurationController.getEmployeeById);
router.put('/api/configuration/employees/:id', authenticateToken, requireAdmin, configurationController.updateEmployee);
router.delete('/api/configuration/employees/:id', authenticateToken, requireAdmin, configurationController.deleteEmployee);
router.get('/api/configuration/tasks', authenticateToken, requireSupervisorOrAdmin, configurationController.getTasks);
router.get('/api/configuration/tasks/:id', authenticateToken, requireSupervisorOrAdmin, configurationController.getTaskById);
router.post('/api/configuration/tasks', authenticateToken, requireAdmin, configurationController.createTask);
router.put('/api/configuration/tasks/:id', authenticateToken, requireAdmin, configurationController.updateTask);
router.delete('/api/configuration/tasks/:id', authenticateToken, requireAdmin, configurationController.deleteTask);
router.get('/api/configuration/departments', authenticateToken, requireSupervisorOrAdmin, configurationController.getDepartments);
router.get('/api/configuration/departments/:id', authenticateToken, requireSupervisorOrAdmin, configurationController.getDepartmentById);
router.post('/api/configuration/departments', authenticateToken, requireAdmin, configurationController.createDepartment);
router.get('/api/configuration/tags', authenticateToken, requireAdmin, configurationController.getTags);
router.post('/api/configuration/tags', authenticateToken, requireAdmin, configurationController.createTag);
router.get('/api/users/all', authenticateToken, requireAdmin, taskController.getAllUsers);
router.get('/api/tags/all', authenticateToken, requireAdmin, taskController.getAllTags);

// Rutas de departamentos
router.get('/api/departments/all', authenticateToken, requireAdmin, taskController.getAllDepartments);
router.get('/api/departments/stats', authenticateToken, requireAdmin, taskController.getDepartmentStats);
router.post('/api/departments', authenticateToken, requireAdmin, taskController.createDepartment);
router.put('/api/departments/:id', authenticateToken, requireAdmin, taskController.updateDepartment);
router.delete('/api/departments/:id', authenticateToken, requireAdmin, taskController.deleteDepartment);

// Rutas de historial (admin y supervisor)
router.get('/api/history/all', authenticateToken, requireSupervisorOrAdmin, taskController.getAllHistory);



// Ruta para subir comprobantes (reutiliza la funcionalidad del main system)
router.post('/guardar-comprobante', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se recibió ningún archivo...' });
    }
    const fileUrl = `https://sistematce.com/assets/media/comprobantes/${req.file.filename}`;
    console.log('📎 Comprobante guardado:', fileUrl);
    res.json({ success: true, fileUrl });
});

module.exports = router;