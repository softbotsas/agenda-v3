const agendaUserService = require('../../services/agenda/agenda.userService');
const agendaTaskService = require('../../services/agenda/agenda.taskService');

// Obtener empleados para configuración
const getEmployees = async (req, res) => {
  try {
    console.log('👥 getEmployees - Usuario:', req.user);
    
    const employeesResult = await agendaUserService.getAllUsers();
    console.log('📊 Resultado del servicio:', employeesResult);
    console.log('📊 Tipo de resultado:', typeof employeesResult);
    console.log('📊 Tiene success:', 'success' in employeesResult);
    console.log('📊 Tiene data:', 'data' in employeesResult);
    
    // El servicio devuelve { success: true, data: array }
    const employees = employeesResult.data || [];
    console.log('📊 Empleados extraídos:', employees.length);
    console.log('📊 Tipo de employees:', typeof employees);
    console.log('📊 Es array:', Array.isArray(employees));
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error en getEmployees:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleados'
    });
  }
};

// Crear nuevo empleado con enlace al sistema principal
const createEmployee = async (req, res) => {
  try {
    console.log('➕ createEmployee - Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { name, correo, perfil_usuario, departamento, cargo, activo, system_user_id } = req.body;
    
    console.log('🔍 Validando campos:');
    console.log('  - name:', name, '(tipo:', typeof name, ')');
    console.log('  - correo:', correo, '(tipo:', typeof correo, ')');
    console.log('  - perfil_usuario:', perfil_usuario, '(tipo:', typeof perfil_usuario, ')');
    console.log('  - departamento:', departamento, '(tipo:', typeof departamento, ')');
    console.log('  - cargo:', cargo, '(tipo:', typeof cargo, ')');
    console.log('  - activo:', activo, '(tipo:', typeof activo, ')');
    console.log('  - system_user_id:', system_user_id, '(tipo:', typeof system_user_id, ')');
    
    // Validar datos requeridos
    if (!name || !correo || !perfil_usuario || !departamento) {
      console.log('❌ Validación fallida - Faltan datos requeridos');
      console.log('  - name válido:', !!name);
      console.log('  - correo válido:', !!correo);
      console.log('  - perfil_usuario válido:', !!perfil_usuario);
      console.log('  - departamento válido:', !!departamento);
      
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos',
        details: {
          name: !!name,
          correo: !!correo,
          perfil_usuario: !!perfil_usuario,
          departamento: !!departamento
        }
      });
    }

    let newEmployee;

    // Si se proporciona system_user_id, crear con enlace
    if (system_user_id && system_user_id !== '') {
      console.log('🔗 Creando usuario de agenda con enlace al sistema principal...');
      
      const agendaUserData = {
        nombre: name,
        email: correo,
        perfil_usuario: parseInt(perfil_usuario),
        departamento,
        departamento_name: departamento, // Usar el mismo valor por ahora
        cargo: cargo || '',
        activo: activo !== undefined ? activo : true
      };

      const result = await agendaUserService.createAgendaUserWithLink(agendaUserData, system_user_id);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message || 'Error al crear usuario con enlace'
        });
      }

      newEmployee = result.data;
    } else {
      console.log('👤 Creando usuario de agenda independiente...');
      
      // Crear empleado sin enlace usando el servicio tradicional
      newEmployee = await agendaUserService.createUser({
        name,
        correo,
        perfil_usuario: parseInt(perfil_usuario),
        departamento,
        cargo: cargo || '',
        activo: activo !== undefined ? activo : true
      });
    }
    
    res.json({
      success: true,
      data: newEmployee,
      message: system_user_id ? 'Empleado creado con enlace al sistema principal' : 'Empleado creado exitosamente'
    });
  } catch (error) {
    console.error('Error en createEmployee:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear empleado'
    });
  }
};

// Obtener tareas para configuración
const getTasks = async (req, res) => {
  try {
    console.log('📋 getTasks - Usuario:', req.user);
    
    const tasks = await agendaTaskService.getAllTasks();
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error en getTasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas'
    });
  }
};

// Obtener departamentos para configuración
const getDepartments = async (req, res) => {
  try {
    console.log('🏢 getDepartments - Usuario:', req.user);
    
    const departments = await agendaUserService.getAllDepartments();
    console.log('📊 Departamentos obtenidos:', departments.length);
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error en getDepartments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos'
    });
  }
};

// Crear nuevo departamento
const createDepartment = async (req, res) => {
  try {
    console.log('➕ createDepartment - Datos:', req.body);
    
    const { name, code, description } = req.body;
    
    // Validar datos requeridos
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y código son requeridos'
      });
    }
    
    // Crear departamento usando el servicio
    const newDepartment = await agendaUserService.createDepartment({
      name,
      code,
      description: description || '',
      created_by: req.user._id
    });
    
    res.json({
      success: true,
      data: newDepartment,
      message: 'Departamento creado exitosamente'
    });
  } catch (error) {
    console.error('Error en createDepartment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear departamento'
    });
  }
};

// Obtener etiquetas para configuración
const getTags = async (req, res) => {
  try {
    console.log('🏷️ getTags - Usuario:', req.user);
    
    const tags = await agendaTaskService.getAllTags();
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error en getTags:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener etiquetas'
    });
  }
};

// Crear nueva etiqueta
const createTag = async (req, res) => {
  try {
    console.log('➕ createTag - Datos:', req.body);
    
    const { name, display_name, color, category, description } = req.body;
    
    // Validar datos requeridos
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y nombre de visualización son requeridos'
      });
    }
    
    // Validar categoría
    const validCategories = ['operaciones', 'administracion', 'rrhh', 'finanzas', 'logistica', 'tecnologia', 'otro'];
    const validCategory = validCategories.includes(category) ? category : 'otro';
    
    // Crear etiqueta usando el servicio
    const newTag = await agendaTaskService.createTag({
      name,
      display_name,
      color: color || '#6c757d',
      category: validCategory,
      description: description || '',
      created_by: req.user._id
    });
    
    res.json({
      success: true,
      data: newTag,
      message: 'Etiqueta creada exitosamente'
    });
  } catch (error) {
    console.error('Error en createTag:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear etiqueta: ' + error.message
    });
  }
};

// Obtener empleado por ID para edición
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👤 getEmployeeById - ID:', id);
    
    const employee = await agendaUserService.getUserByIdForEdit(id);
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error en getEmployeeById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleado'
    });
  }
};

// Obtener departamento por ID para edición
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 getDepartmentById - ID:', id);
    
    const Department = require('../../models/agenda.Department');
    
    // Intentar buscar por ObjectId primero
    let department = null;
    try {
      department = await Department.findById(id);
    } catch (objectIdError) {
      // Si falla, intentar buscar por code o name
      console.log('⚠️ ID no es ObjectId válido, buscando por code o name');
      department = await Department.findOne({ 
        $or: [
          { code: id },
          { name: id }
        ]
      });
    }
    
    if (!department) {
      return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
    }
    
    res.json({ success: true, data: department });
  } catch (error) {
    console.error('Error en getDepartmentById:', error);
    res.status(500).json({ success: false, message: 'Error al obtener departamento: ' + error.message });
  }
};

// Actualizar empleado
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeData = req.body;
    console.log('✏️ updateEmployee - ID:', id, 'Datos:', employeeData);
    
    // Validar datos requeridos
    if (!employeeData.name || !employeeData.correo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y correo son requeridos'
      });
    }
    
    const updatedEmployee = await agendaUserService.updateUser(id, employeeData);
    
    res.json({
      success: true,
      data: updatedEmployee,
      message: 'Empleado actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en updateEmployee:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar empleado'
    });
  }
};

// Eliminar empleado
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ deleteEmployee - ID:', id);
    
    const result = await agendaUserService.deleteUser(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error en deleteEmployee:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar empleado'
    });
  }
};

// Obtener tarea por ID para edición
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 getTaskById - ID:', id);
    
    const TaskDefinition = require('../../models/agenda.TaskDefinition');
    const task = await TaskDefinition.findById(id)
      .populate('tags', 'name display_name color category');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error en getTaskById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarea'
    });
  }
};

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    console.log('➕ createTask - Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { 
      title, 
      description, 
      mode, 
      periodicity, 
      target_per_period, 
      sla_time, 
      requires_evidence, 
      tags, 
      assigned_users,
      specific_days,
      department
    } = req.body;
    
    console.log('🔍 Validando campos:');
    console.log('  - title:', title, '(tipo:', typeof title, ')');
    console.log('  - description:', description, '(tipo:', typeof description, ')');
    console.log('  - mode:', mode, '(tipo:', typeof mode, ')');
    console.log('  - periodicity:', periodicity, '(tipo:', typeof periodicity, ')');
    console.log('  - assigned_users:', assigned_users, '(tipo:', typeof assigned_users, ')');
    console.log('  - department:', department, '(tipo:', typeof department, ')');
    
    // Validar datos requeridos
    if (!title || !mode || !periodicity) {
      console.log('❌ Validación fallida - Faltan datos requeridos');
      console.log('  - title válido:', !!title);
      console.log('  - mode válido:', !!mode);
      console.log('  - periodicity válido:', !!periodicity);
      console.log('  - department válido:', !!department);
      
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos',
        details: {
          title: !!title,
          mode: !!mode,
          periodicity: !!periodicity,
          department: !!department
        }
      });
    }
    
    // Crear tarea usando el servicio
    const newTask = await agendaTaskService.createTask({
      title,
      description: description || '',
      mode,
      periodicity,
      target_per_period: target_per_period || 1,
      sla_time: sla_time || null,
      requires_evidence: requires_evidence || false,
      tags: tags || [],
      assigned_users: assigned_users || [],
      specific_days: specific_days || [],
      department,
      created_by: req.user._id
    });
    
    res.json({
      success: true,
      data: newTask,
      message: 'Tarea creada exitosamente'
    });
  } catch (error) {
    console.error('Error en createTask:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea: ' + error.message
    });
  }
};

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskData = req.body;
    console.log('✏️ updateTask - ID:', id, 'Datos:', JSON.stringify(taskData, null, 2));
    
    // Validar datos requeridos
    if (!taskData.title || !taskData.mode || !taskData.periodicity) {
      return res.status(400).json({
        success: false,
        message: 'Título, modo y periodicidad son requeridos'
      });
    }
    
    const updatedTask = await agendaTaskService.updateTask(id, taskData);
    
    res.json({
      success: true,
      data: updatedTask,
      message: 'Tarea actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en updateTask:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar tarea'
    });
  }
};

// Eliminar tarea
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ deleteTask - ID:', id);
    
    const result = await agendaTaskService.deleteTask(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error en deleteTask:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar tarea'
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDepartments,
  getDepartmentById,
  createDepartment,
  getTags,
  createTag
};
