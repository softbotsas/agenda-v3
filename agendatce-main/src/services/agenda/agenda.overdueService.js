const TaskDefinition = require('../../models/agenda.TaskDefinition');
const TaskAssignment = require('../../models/agenda.TaskAssignment');
const TaskLog = require('../../models/agenda.TaskLog');

// Función simple para marcar tareas atrasadas como "No Aplicable"
const markOverdueTaskAsNotApplicable = async (taskId, userId, reason) => {
  try {
    console.log('🔍 markOverdueTaskAsNotApplicable iniciado:', { taskId, userId, reason });

    // Buscar la tarea
    const taskDefinition = await TaskDefinition.findById(taskId);
    if (!taskDefinition) {
      return { success: false, message: 'Tarea no encontrada' };
    }

    // Buscar o crear asignación
    let assignment = await TaskAssignment.findOne({
      task_definition: taskId,
      user: userId,
      activo: true
    });

    if (!assignment) {
      assignment = new TaskAssignment({
        task_definition: taskId,
        user: userId,
        start_date: new Date(),
        activo: true,
        assignment_type: taskDefinition.assignment_type === 'anyone' ? 'general' : 'specific'
      });
      await assignment.save();
    }

    // Crear log simple
    const log = new TaskLog({
      task_assignment: assignment._id,
      user: userId,
      action_type: 'completed',
      value: 1,
      comment: `Marcada como no aplicable: ${reason}`,
      evidence_files: [],
      log_date: new Date()
    });

    await log.save();

    console.log('✅ Tarea marcada como no aplicable exitosamente:', log._id);

    return {
      success: true,
      message: 'Tarea marcada como no aplicable exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en markOverdueTaskAsNotApplicable:', error);
    return {
      success: false,
      message: 'Error al marcar tarea como no aplicable: ' + error.message
    };
  }
};

// Función simple para completar tareas atrasadas con fecha retroactiva
const completeOverdueTaskRetroactive = async (taskId, userId, retroactiveDate, comment) => {
  try {
    console.log('🔍 completeOverdueTaskRetroactive iniciado:', { taskId, userId, retroactiveDate, comment });

    // Buscar la tarea
    const taskDefinition = await TaskDefinition.findById(taskId);
    if (!taskDefinition) {
      return { success: false, message: 'Tarea no encontrada' };
    }

    // Buscar o crear asignación
    let assignment = await TaskAssignment.findOne({
      task_definition: taskId,
      user: userId,
      activo: true
    });

    if (!assignment) {
      assignment = new TaskAssignment({
        task_definition: taskId,
        user: userId,
        start_date: new Date(),
        activo: true,
        assignment_type: taskDefinition.assignment_type === 'anyone' ? 'general' : 'specific'
      });
      await assignment.save();
    }

    // Crear log con fecha retroactiva
    const log = new TaskLog({
      task_assignment: assignment._id,
      user: userId,
      action_type: 'completed',
      value: 1,
      comment: comment || `Completado retroactivamente para fecha: ${retroactiveDate}`,
      evidence_files: [],
      log_date: new Date(retroactiveDate)
    });

    await log.save();

    console.log('✅ Tarea completada retroactivamente:', log._id);

    return {
      success: true,
      message: 'Tarea completada retroactivamente exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en completeOverdueTaskRetroactive:', error);
    return {
      success: false,
      message: 'Error al completar tarea retroactivamente: ' + error.message
    };
  }
};

module.exports = {
  markOverdueTaskAsNotApplicable,
  completeOverdueTaskRetroactive
};



