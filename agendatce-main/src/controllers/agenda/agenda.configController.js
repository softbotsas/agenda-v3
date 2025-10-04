const AgendaUser = require('../../models/agenda.User');
const User = require('../../../../models/Users');
const TaskDefinition = require('../../models/agenda.TaskDefinition');
const TaskAssignment = require('../../models/agenda.TaskAssignment');
const Tag = require('../../models/agenda.Tag');

// Obtener todos los usuarios de agenda
const getAgendaUsers = async (req, res) => {
  try {
    const users = await AgendaUser.find({ activo: true })
      .populate('user_id', 'name correo')
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Crear nuevo usuario de agenda
const createAgendaUser = async (req, res) => {
  try {
    const { nombre, email, user_id, color } = req.body;
    
    // Verificar si el email ya existe
    const existingUser = await AgendaUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    const newUser = new AgendaUser({
      nombre,
      email,
      user_id: user_id || null,
      color: color || '#007bff'
    });
    
    await newUser.save();
    
    // Si se vinculó con un usuario del sistema, actualizar la relación
    if (user_id) {
      await User.findByIdAndUpdate(user_id, {
        agenda_user: newUser._id,
        'agenda_info.nombre_agenda': nombre,
        'agenda_info.color': color || '#007bff'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

// Obtener usuarios del sistema para vincular
const getSystemUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      activo: true,
      agenda_user: null // Solo usuarios que no tienen agenda_user asignado
    }).select('name correo perfil_usuario');
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios del sistema',
      error: error.message
    });
  }
};

// Actualizar usuario de agenda
const updateAgendaUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, user_id, color, activo } = req.body;
    
    const user = await AgendaUser.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el email ya existe en otro usuario
    if (email !== user.email) {
      const existingUser = await AgendaUser.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }
    
    // Actualizar usuario
    const updatedUser = await AgendaUser.findByIdAndUpdate(id, {
      nombre,
      email,
      user_id: user_id || null,
      color,
      activo
    }, { new: true });
    
    // Actualizar relación en el usuario del sistema
    if (user_id) {
      await User.findByIdAndUpdate(user_id, {
        agenda_user: id,
        'agenda_info.nombre_agenda': nombre,
        'agenda_info.color': color
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// Eliminar usuario de agenda
const deleteAgendaUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await AgendaUser.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Desactivar en lugar de eliminar
    await AgendaUser.findByIdAndUpdate(id, { activo: false });
    
    // Desvincular del usuario del sistema
    if (user.user_id) {
      await User.findByIdAndUpdate(user.user_id, {
        agenda_user: null,
        'agenda_info.nombre_agenda': null
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

// Obtener todas las definiciones de tareas
const getTaskDefinitions = async (req, res) => {
  try {
    const tasks = await TaskDefinition.find({ active: true })
      .populate('created_by', 'nombre email')
      .populate({
        path: 'tags',
        model: 'agenda.Tag',
        select: 'name display_name color category',
        match: { active: true }
      })
      .sort({ title: 1 });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tareas',
      error: error.message
    });
  }
};

// Crear nueva definición de tarea
const createTaskDefinition = async (req, res) => {
  try {
    const { title, description, periodicity, mode, target_per_period, sla_time, requires_evidence, tags, frequency, assignment_type, specific_user, specific_days } = req.body;
    const created_by = req.user.id || '68cede72d2425a798fd91ace'; // Usuario por defecto para desarrollo
    
    // Validar que las etiquetas existan si se proporcionan
    let tagIds = [];
    if (tags && tags.length > 0) {
      const existingTags = await Tag.find({ _id: { $in: tags }, active: true });
      tagIds = existingTags.map(tag => tag._id);
    }
    
    const newTask = new TaskDefinition({
      title,
      description,
      periodicity,
      mode,
      target_per_period: target_per_period || 1,
      sla_time: sla_time || null,
      requires_evidence: requires_evidence || false,
      tags: tagIds,
      created_by,
      frequency: frequency || 1,
      assignment_type: assignment_type || 'anyone',
      specific_user: assignment_type === 'specific' ? specific_user : null,
      specific_days: specific_days && specific_days.length > 0 ? specific_days : []
    });
    
    await newTask.save();
    
    // Poblar el creador y las etiquetas
    await newTask.populate('created_by', 'nombre email');
    await newTask.populate('tags', 'name display_name color category');
    
    res.json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear tarea',
      error: error.message
    });
  }
};

// Actualizar definición de tarea
const updateTaskDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, periodicity, mode, target_per_period, sla_time, requires_evidence, tags, active, frequency, assignment_type, specific_user, specific_days } = req.body;
    
    const task = await TaskDefinition.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Validar que las etiquetas existan si se proporcionan
    let tagIds = [];
    if (tags && tags.length > 0) {
      const existingTags = await Tag.find({ _id: { $in: tags }, active: true });
      tagIds = existingTags.map(tag => tag._id);
    }
    
    const updatedTask = await TaskDefinition.findByIdAndUpdate(id, {
      title,
      description,
      periodicity,
      mode,
      target_per_period: target_per_period || 1,
      sla_time: sla_time || null,
      requires_evidence: requires_evidence || false,
      tags: tagIds,
      active: active !== undefined ? active : true,
      frequency: frequency || 1,
      assignment_type: assignment_type || 'anyone',
      specific_user: assignment_type === 'specific' ? specific_user : null,
      specific_days: specific_days && specific_days.length > 0 ? specific_days : []
    }, { new: true });
    
    // Poblar las etiquetas
    await updatedTask.populate('tags', 'name display_name color category');
    
    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tarea',
      error: error.message
    });
  }
};

// Eliminar definición de tarea
const deleteTaskDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await TaskDefinition.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Desactivar en lugar de eliminar
    await TaskDefinition.findByIdAndUpdate(id, { active: false });
    
    res.json({
      success: true,
      message: 'Tarea desactivada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar tarea',
      error: error.message
    });
  }
};

// Obtener todas las asignaciones de tareas
const getTaskAssignments = async (req, res) => {
  try {
    const assignments = await TaskAssignment.find()
      .populate('task_definition', 'title description periodicity mode')
      .populate('user', 'nombre email')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones',
      error: error.message
    });
  }
};

// Crear nueva asignación de tarea
const createTaskAssignment = async (req, res) => {
  try {
    const { task_definition, user, assignment_type = 'general', start_date, end_date } = req.body;
    
    const newAssignment = new TaskAssignment({
      task_definition,
      user,
      assignment_type,
      start_date: start_date ? new Date(start_date) : new Date(),
      end_date: end_date ? new Date(end_date) : null,
      activo: true
    });
    
    await newAssignment.save();
    
    // Poblar los datos para la respuesta
    await newAssignment.populate('task_definition', 'title description periodicity mode');
    await newAssignment.populate('user', 'nombre email');
    
    res.json({
      success: true,
      message: 'Asignación creada exitosamente',
      data: newAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear asignación',
      error: error.message
    });
  }
};

// Eliminar asignación de tarea
const deleteTaskAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await TaskAssignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      });
    }
    
    await TaskAssignment.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Asignación eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar asignación',
      error: error.message
    });
  }
};

// Obtener todas las etiquetas
const getTags = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { active: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { display_name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tags = await Tag.find(query)
      .populate('created_by', 'nombre email')
      .sort({ category: 1, usage_count: -1, display_name: 1 });
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener etiquetas',
      error: error.message
    });
  }
};

// Crear nueva etiqueta
const createTag = async (req, res) => {
  try {
    const { name, display_name, description, color, category } = req.body;
    const created_by = req.user.id || '68cede72d2425a798fd91ace'; // Usuario por defecto para desarrollo
    
    // Verificar si la etiqueta ya existe
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre'
      });
    }
    
    const newTag = new Tag({
      name: name.toLowerCase(),
      display_name: display_name || name,
      description,
      color: color || '#6c757d',
      category: category || 'otro',
      created_by
    });
    
    await newTag.save();
    
    // Poblar el creador
    await newTag.populate('created_by', 'nombre email');
    
    res.json({
      success: true,
      message: 'Etiqueta creada exitosamente',
      data: newTag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear etiqueta',
      error: error.message
    });
  }
};

// Actualizar etiqueta
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_name, description, color, category, active } = req.body;
    
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    // Verificar si el nuevo nombre ya existe en otra etiqueta
    if (name && name.toLowerCase() !== tag.name) {
      const existingTag = await Tag.findOne({ 
        name: name.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una etiqueta con ese nombre'
        });
      }
    }
    
    const updatedTag = await Tag.findByIdAndUpdate(id, {
      name: name ? name.toLowerCase() : tag.name,
      display_name: display_name || tag.display_name,
      description: description !== undefined ? description : tag.description,
      color: color || tag.color,
      category: category || tag.category,
      active: active !== undefined ? active : tag.active
    }, { new: true });
    
    res.json({
      success: true,
      message: 'Etiqueta actualizada exitosamente',
      data: updatedTag
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar etiqueta',
      error: error.message
    });
  }
};

// Eliminar etiqueta
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    // Verificar si la etiqueta está siendo usada
    if (tag.usage_count > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una etiqueta que está siendo usada. Desactívala en su lugar.'
      });
    }
    
    await Tag.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Etiqueta eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar etiqueta',
      error: error.message
    });
  }
};

// Obtener categorías de etiquetas
const getTagCategories = async (req, res) => {
  try {
    const categories = await Tag.distinct('category', { active: true });
    
    const categoryInfo = {
      'operaciones': { name: 'Operaciones', color: '#007bff', icon: 'fas fa-cogs' },
      'administracion': { name: 'Administración', color: '#6c757d', icon: 'fas fa-clipboard-list' },
      'rrhh': { name: 'Recursos Humanos', color: '#e83e8c', icon: 'fas fa-users' },
      'finanzas': { name: 'Finanzas', color: '#28a745', icon: 'fas fa-dollar-sign' },
      'logistica': { name: 'Logística', color: '#fd7e14', icon: 'fas fa-truck' },
      'tecnologia': { name: 'Tecnología', color: '#17a2b8', icon: 'fas fa-laptop-code' },
      'otro': { name: 'Otro', color: '#6c757d', icon: 'fas fa-tag' }
    };
    
    const result = categories.map(cat => ({
      value: cat,
      ...categoryInfo[cat] || categoryInfo['otro']
    }));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

module.exports = {
  getAgendaUsers,
  createAgendaUser,
  getSystemUsers,
  updateAgendaUser,
  deleteAgendaUser,
  getTaskDefinitions,
  createTaskDefinition,
  updateTaskDefinition,
  deleteTaskDefinition,
  getTaskAssignments,
  createTaskAssignment,
  deleteTaskAssignment,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getTagCategories
};



