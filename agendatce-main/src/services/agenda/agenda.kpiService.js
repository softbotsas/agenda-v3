const TaskDefinition = require('../../models/agenda.TaskDefinition');
const TaskAssignment = require('../../models/agenda.TaskAssignment');
const TaskLog = require('../../models/agenda.TaskLog');
const AgendaUser = require('../../models/agenda.User');

// Calcular KPIs para un usuario específico
const calculateUserKPIs = async (userId, startDate, endDate) => {
  try {
    // Obtener asignaciones del usuario en el período
    const assignments = await TaskAssignment.find({
      user: userId,
      activo: true,
      start_date: { $lte: endDate },
      $or: [
        { end_date: { $exists: false } },
        { end_date: { $gte: startDate } }
      ]
    })
    .populate('task_definition');

    // Obtener logs del usuario en el período
    const logs = await TaskLog.find({
      user: userId,
      log_date: { $gte: startDate, $lte: endDate }
    })
    .populate('task_assignment');

    // Calcular métricas
    const totalTasks = assignments.length;
    const completedTasks = logs.filter(log => log.action_type === 'completed').length;
    const lateTasks = logs.filter(log => log.is_late).length;
    const totalIncrements = logs.filter(log => log.action_type === 'increment').length;

    // Calcular tasa de cumplimiento
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calcular tasa de atrasos
    const lateRate = completedTasks > 0 ? Math.round((lateTasks / completedTasks) * 100) : 0;

    // Agrupar por etiquetas
    const tasksByTag = {};
    assignments.forEach(assignment => {
      const taskDef = assignment.task_definition;
      if (taskDef && taskDef.tags) {
        taskDef.tags.forEach(tagId => {
          const tagKey = tagId.toString();
          if (!tasksByTag[tagKey]) {
            tasksByTag[tagKey] = { completed: 0, total: 0 };
          }
          tasksByTag[tagKey].total += 1;
          
          // Verificar si está completada
          const hasLog = logs.some(log => 
            log.task_assignment._id.toString() === assignment._id.toString() && 
            log.action_type === 'completed'
          );
          if (hasLog) {
            tasksByTag[tagKey].completed += 1;
          }
        });
      }
    });

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      late_tasks: lateTasks,
      total_increments: totalIncrements,
      completion_rate: completionRate,
      late_rate: lateRate,
      tasks_by_tag: tasksByTag
    };

  } catch (error) {
    console.error('Error calculating user KPIs:', error);
    throw error;
  }
};

// Obtener actividad reciente
const getRecentActivity = async (userId, limit = 10) => {
  try {
    console.log('🔍 getRecentActivity - userId:', userId);
    const logs = await TaskLog.find({ user: userId })
      .populate('user', 'nombre email', 'agenda.User')
      .populate({
        path: 'task_assignment',
        populate: [
          {
            path: 'task_definition',
            model: 'TaskDefinition'
          },
          {
            path: 'user',
            select: 'nombre email',
            model: 'agenda.User'
          }
        ]
      })
      .sort({ log_date: -1 })
      .limit(limit);

    console.log(`📊 getRecentActivity - Encontrados ${logs.length} logs para usuario ${userId}`);
    
    logs.forEach((log, index) => {
      console.log(`🔍 Activity Log ${index + 1}:`, {
        id: log._id,
        user: log.user,
        user_nombre: log.user?.nombre,
        task_assignment: log.task_assignment,
        task_title: log.task_assignment?.task_definition?.title
      });
    });

    // Mapear los logs para el frontend
    const mappedActivity = logs.map((log) => {
      // Usar el usuario del log o del task_assignment como fallback
      let userName = 'Usuario eliminado';
      let userId = null;
      
      if (log.user && log.user.nombre) {
        // Usar el usuario poblado del log
        userName = log.user.nombre;
        userId = log.user._id;
      } else if (log.task_assignment && log.task_assignment.user && log.task_assignment.user.nombre) {
        // Usar el usuario poblado del task_assignment como fallback
        userName = log.task_assignment.user.nombre;
        userId = log.task_assignment.user._id;
      }
      
      return {
        id: log._id,
        task_title: log.task_assignment?.task_definition?.title || 'Tarea eliminada',
        user_name: userName,
        user_id: userId,
        action_type: log.action_type,
        value: log.value,
        comment: log.comment,
        created_at: log.log_date,
        evidence: log.evidence || []
      };
    });

    console.log('📊 getRecentActivity - Actividad mapeada:', mappedActivity.slice(0, 3));
    return mappedActivity;

  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw error;
  }
};

// Obtener resumen de todos los usuarios
const getAllUsersSummary = async (startDate, endDate) => {
  try {
    // Obtener todos los usuarios activos
    const users = await AgendaUser.find({ activo: true });

    // Calcular KPIs para cada usuario
    const usersSummary = await Promise.all(
      users.map(async (user) => {
        try {
          const kpis = await calculateUserKPIs(user._id, startDate, endDate);
          
          return {
            user_id: user._id.toString(),
            name: user.nombre,
            email: user.email,
            color: user.color,
            completion_rate: kpis.completion_rate,
            completed_tasks: kpis.completed_tasks,
            total_tasks: kpis.total_tasks,
            late_tasks: kpis.late_tasks,
            late_rate: kpis.late_rate,
            total_increments: kpis.total_increments
          };
        } catch (error) {
          console.error(`Error calculating KPIs for user ${user._id}:`, error);
          return {
            user_id: user._id.toString(),
            name: user.nombre,
            email: user.email,
            color: user.color,
            completion_rate: 0,
            completed_tasks: 0,
            total_tasks: 0,
            late_tasks: 0,
            late_rate: 0,
            total_increments: 0
          };
        }
      })
    );

    return usersSummary;

  } catch (error) {
    console.error('Error getting all users summary:', error);
    throw error;
  }
};

// Calcular KPIs generales del sistema
const calculateSystemKPIs = async (startDate, endDate) => {
  try {
    // Obtener estadísticas generales
    const totalUsers = await AgendaUser.countDocuments({ activo: true });
    const totalTasks = await TaskDefinition.countDocuments({ active: true });
    const totalAssignments = await TaskAssignment.countDocuments({ activo: true });
    
    // Obtener logs del período
    const logs = await TaskLog.find({
      log_date: { $gte: startDate, $lte: endDate }
    });

    const totalLogs = logs.length;
    const completedLogs = logs.filter(log => log.action_type === 'completed').length;
    const lateLogs = logs.filter(log => log.is_late).length;

    // Calcular métricas generales
    const averageCompletionRate = totalUsers > 0 ? 
      Math.round((completedLogs / Math.max(totalLogs, 1)) * 100) : 0;
    
    const averageLateRate = completedLogs > 0 ? 
      Math.round((lateLogs / completedLogs) * 100) : 0;

    return {
      total_users: totalUsers,
      total_tasks: totalTasks,
      total_assignments: totalAssignments,
      total_logs: totalLogs,
      completed_logs: completedLogs,
      late_logs: lateLogs,
      average_completion_rate: averageCompletionRate,
      average_late_rate: averageLateRate
    };

  } catch (error) {
    console.error('Error calculating system KPIs:', error);
    throw error;
  }
};

module.exports = {
  calculateUserKPIs,
  getRecentActivity,
  getAllUsersSummary,
  calculateSystemKPIs
};