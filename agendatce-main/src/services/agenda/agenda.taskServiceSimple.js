const TaskDefinition = require('../../models/agenda.TaskDefinition');
const TaskAssignment = require('../../models/agenda.TaskAssignment');
const TaskLog = require('../../models/agenda.TaskLog');
const mongoose = require('mongoose');

// Función SIMPLE para completar tareas
const completeTaskSimple = async (assignmentId, userId, comment, evidenceFile, req = null) => {
  try {
    console.log('🔍 completeTaskSimple iniciado:', { assignmentId, userId, comment });

    let realAssignmentId = assignmentId;
    
    // Si es un ID virtual, buscar o crear la asignación real
    if (assignmentId.startsWith('virtual_')) {
      const taskDefinitionId = assignmentId.replace('virtual_', '').replace(`_${userId}`, '');
      console.log('🔍 ID de tarea extraído:', taskDefinitionId);
      
      // Buscar la definición de la tarea
      const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return { success: false, message: 'Tarea no encontrada' };
      }

      // Buscar si ya existe una asignación para este usuario y esta tarea
      let assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      // Si no existe, crear una nueva asignación
      if (!assignment) {
        assignment = new TaskAssignment({
          task_definition: new mongoose.Types.ObjectId(taskDefinitionId),
          user: new mongoose.Types.ObjectId(userId),
          activo: true,
          start_date: new Date()
        });
        await assignment.save();
        console.log('✅ Nueva asignación creada:', assignment._id);
      }

      realAssignmentId = assignment._id;
    }

    console.log('🔍 ID de asignación real:', realAssignmentId);

    // Preparar evidencia si hay archivo
    let evidence = [];
    if (evidenceFile) {
      evidence = [{
        filename: evidenceFile,
        original_name: req.file ? req.file.originalname : evidenceFile,
        mime_type: req.file ? req.file.mimetype : 'image/jpeg',
        size: req.file ? req.file.size : 0,
        url: `/uploads/${evidenceFile}`,
        uploaded_at: new Date()
      }];
    }

    // Crear el log usando la asignación real
    const log = new TaskLog({
      task_assignment: new mongoose.Types.ObjectId(realAssignmentId),
      user: new mongoose.Types.ObjectId(userId),
      action_type: 'completed',
      value: 1,
      comment: comment || 'Tarea completada',
      evidence: evidence,
      log_date: new Date()
    });

    await log.save();
    console.log('✅ Tarea completada exitosamente:', log._id);

    return {
      success: true,
      message: 'Tarea completada exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en completeTaskSimple:', error);
    return {
      success: false,
      message: 'Error al completar tarea: ' + error.message
    };
  }
};

// Función SIMPLE para registrar acciones en tareas contables
const registerActionSimple = async (assignmentId, userId, value, comment, evidenceFile, req = null, evidenceUrl = null) => {
  try {
    console.log('🔍 registerActionSimple iniciado:', { assignmentId, userId, value, comment, evidenceUrl });

    let realAssignmentId = assignmentId;
    
    // Si es un ID virtual, buscar o crear la asignación real
    if (assignmentId.startsWith('virtual_')) {
      // Extraer el ID de la tarea del assignmentId
      // Formato: virtual_68cdc3db7954a458b84bd761_68dd216ef442da8e30f3c453
      const parts = assignmentId.replace('virtual_', '').split('_');
      const taskDefinitionId = parts[0]; // Solo la primera parte es el ID de la tarea
      console.log('🔍 ID de tarea extraído:', taskDefinitionId);
      
      // Buscar la definición de la tarea
      const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return { success: false, message: 'Tarea no encontrada' };
      }

      // Buscar si ya existe una asignación para este usuario y esta tarea
      let assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      // Si no existe, crear una nueva asignación
      if (!assignment) {
        assignment = new TaskAssignment({
          task_definition: new mongoose.Types.ObjectId(taskDefinitionId),
          user: new mongoose.Types.ObjectId(userId),
          activo: true,
          start_date: new Date()
        });
        await assignment.save();
        console.log('✅ Nueva asignación creada:', assignment._id);
      }

      realAssignmentId = assignment._id;
    }

    console.log('🔍 ID de asignación real:', realAssignmentId);

    // Crear el log usando la asignación real
    const log = new TaskLog({
      task_assignment: new mongoose.Types.ObjectId(realAssignmentId),
      user: new mongoose.Types.ObjectId(userId),
      action_type: 'increment',
      value: parseInt(value) || 1,
      comment: comment || 'Acción registrada',
      evidence: evidenceFile ? [{
        filename: evidenceFile,
        original_name: req.file ? req.file.originalname : evidenceFile,
        mime_type: req.file ? req.file.mimetype : 'image/jpeg',
        size: req.file ? req.file.size : 0,
        url: `/uploads/${evidenceFile}`,
        uploaded_at: new Date()
      }] : evidenceUrl ? [{
        filename: evidenceUrl.split('/').pop(),
        original_name: evidenceUrl.split('/').pop(),
        mime_type: 'image/jpeg',
        size: 0,
        url: evidenceUrl,
        uploaded_at: new Date()
      }] : [],
      log_date: new Date()
    });

    await log.save();
    console.log('✅ Acción registrada exitosamente:', log._id);

    return {
      success: true,
      message: 'Acción registrada exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en registerActionSimple:', error);
    return {
      success: false,
      message: 'Error al registrar acción: ' + error.message
    };
  }
};




// Función SIMPLE para marcar como no aplicable
const markNotApplicableSimple = async (assignmentId, userId, reason) => {
  try {
    console.log('🔍 markNotApplicableSimple iniciado:', { assignmentId, userId, reason });

    let realAssignmentId = assignmentId;
    let taskDefinitionId = null;
    
    // Si es un ID virtual, buscar o crear la asignación real
    if (assignmentId.startsWith('virtual_') || assignmentId.includes('overdue_')) {
      // Para IDs de tareas atrasadas, extraer el ID de la tarea
      if (assignmentId.includes('overdue_')) {
        // Para IDs como overdue_TASKID_USERID o overdue_overdue_TASKID_USERID
        const parts = assignmentId.split('_');
        // Si hay doble prefijo overdue_, el ID está en la posición 2
        // Si hay un solo prefijo overdue_, el ID está en la posición 1
        taskDefinitionId = parts[1] === 'overdue' ? parts[2] : parts[1];
      } else {
        // Para IDs virtuales normales
        taskDefinitionId = assignmentId.replace('virtual_', '').replace(`_${userId}`, '');
      }
      
      console.log('🔍 ID de tarea extraído:', taskDefinitionId);
      
      // Buscar la definición de la tarea
      const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return { success: false, message: 'Tarea no encontrada' };
      }

      // Buscar si ya existe una asignación para este usuario y esta tarea
      let assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      // Si no existe, crear una nueva asignación
      if (!assignment) {
        assignment = new TaskAssignment({
          task_definition: new mongoose.Types.ObjectId(taskDefinitionId),
          user: new mongoose.Types.ObjectId(userId),
          activo: true,
          start_date: new Date()
        });
        await assignment.save();
        console.log('✅ Nueva asignación creada:', assignment._id);
      }

      realAssignmentId = assignment._id;
    }

    console.log('🔍 ID de asignación real:', realAssignmentId);

    // Si no tenemos taskDefinitionId, extraerlo del assignment_id real
    if (!taskDefinitionId) {
      // Si es un ID real de TaskAssignment, necesitamos obtener el task_definition
      const assignment = await TaskAssignment.findById(realAssignmentId);
      if (assignment) {
        taskDefinitionId = assignment.task_definition;
      }
    }

    // Obtener la definición de la tarea para determinar el tipo
    const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
    
    // Para tareas contables, usar 'not_applicable' en lugar de 'completed'
    // Para tareas binarias, usar 'completed' para que se marquen como completadas
    const actionType = taskDefinition && taskDefinition.mode === 'counter' ? 'not_applicable' : 'completed';
    
    // Crear un solo log para hoy marcando como "no aplica"
    const log = new TaskLog({
      task_assignment: new mongoose.Types.ObjectId(realAssignmentId),
      user: new mongoose.Types.ObjectId(userId),
      action_type: actionType,
      value: 1,
      comment: `No aplica - ${reason || 'Marcada como no aplicable'}`,
      evidence: [],
      log_date: new Date()
    });

    await log.save();
    console.log('✅ Tarea marcada como no aplicable:', log._id);

    return {
      success: true,
      message: 'Tarea marcada como no aplicable exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en markNotApplicableSimple:', error);
    return {
      success: false,
      message: 'Error al marcar como no aplicable: ' + error.message
    };
  }
};

// Función SIMPLE para completar todas las tareas atrasadas
const completeAllOverdueSimple = async (assignmentId, userId, comment) => {
  try {
    console.log('🔍 completeAllOverdueSimple iniciado:', { assignmentId, userId, comment });

    let realAssignmentId = assignmentId;
    
    // Si es un ID virtual, buscar o crear la asignación real
    if (assignmentId.startsWith('virtual_') || assignmentId.includes('overdue_')) {
      // Para IDs de tareas atrasadas, extraer el ID de la tarea
      let taskDefinitionId;
      if (assignmentId.includes('overdue_')) {
        // Para IDs como overdue_TASKID_USERID o overdue_overdue_TASKID_USERID
        const parts = assignmentId.split('_');
        // Si hay doble prefijo overdue_, el ID está en la posición 2
        // Si hay un solo prefijo overdue_, el ID está en la posición 1
        taskDefinitionId = parts[1] === 'overdue' ? parts[2] : parts[1];
      } else {
        // Para IDs virtuales normales
        taskDefinitionId = assignmentId.replace('virtual_', '').replace(`_${userId}`, '');
      }
      
      console.log('🔍 ID de tarea extraído:', taskDefinitionId);
      
      // Buscar la definición de la tarea
      const taskDefinition = await TaskDefinition.findById(taskDefinitionId);
      if (!taskDefinition) {
        return { success: false, message: 'Tarea no encontrada' };
      }

      // Buscar si ya existe una asignación para este usuario y esta tarea
      let assignment = await TaskAssignment.findOne({
        task_definition: taskDefinitionId,
        user: userId,
        activo: true
      });

      // Si no existe, crear una nueva asignación
      if (!assignment) {
        assignment = new TaskAssignment({
          task_definition: new mongoose.Types.ObjectId(taskDefinitionId),
          user: new mongoose.Types.ObjectId(userId),
          activo: true,
          start_date: new Date()
        });
        await assignment.save();
        console.log('✅ Nueva asignación creada:', assignment._id);
      }

      realAssignmentId = assignment._id;
    }

    console.log('🔍 ID de asignación real:', realAssignmentId);

    // Crear un solo log para hoy
    const log = new TaskLog({
      task_assignment: new mongoose.Types.ObjectId(realAssignmentId),
      user: new mongoose.Types.ObjectId(userId),
      action_type: 'completed',
      value: 1,
      comment: comment || 'Tarea completada',
      evidence: [],
      log_date: new Date()
    });

    await log.save();
    console.log('✅ Tarea completada:', log._id);

    return {
      success: true,
      message: 'Tarea completada exitosamente',
      logId: log._id
    };

  } catch (error) {
    console.error('❌ Error en completeAllOverdueSimple:', error);
    return {
      success: false,
      message: 'Error al completar tarea: ' + error.message
    };
  }
};

// Función SIMPLE para saltar todas las tareas atrasadas (marcar como no aplicable)
const skipAllOverdueSimple = async (assignmentId, userId, reason) => {
  try {
    console.log('🔍 skipAllOverdueSimple iniciado:', { assignmentId, userId, reason });

    let realAssignmentId = assignmentId;
    let taskDefinitionId = null;
    
    // Si es un ID virtual, buscar o crear la asignación real
    if (assignmentId.startsWith('virtual_') || assignmentId.includes('overdue_')) {
      // Para IDs de tareas atrasadas, extraer el ID de la tarea
      if (assignmentId.includes('overdue_')) {
        // Para IDs como overdue_TASKID_USERID o overdue_overdue_TASKID_USERID
        const parts = assignmentId.split('_');
        // Si hay doble prefijo overdue_, el ID está en la posición 2
        // Si hay un solo prefijo overdue_, el ID está en la posición 1
        taskDefinitionId = parts[1] === 'overdue' ? parts[2] : parts[1];
      } else {
        // Para IDs virtuales normales
        taskDefinitionId = assignmentId.replace('virtual_', '').replace(`_${userId}`, '');
      }

      console.log('🔍 Extrayendo taskDefinitionId:', taskDefinitionId);

      // Buscar si ya existe una asignación real
      let existingAssignment = await TaskAssignment.findOne({
        task_definition: new mongoose.Types.ObjectId(taskDefinitionId),
        user: new mongoose.Types.ObjectId(userId)
      });

      if (existingAssignment) {
        realAssignmentId = existingAssignment._id;
        console.log('✅ Usando asignación existente:', realAssignmentId);
      } else {
        console.log('⚠️ No se encontró asignación existente para tarea atrasada');
        return {
          success: false,
          message: 'No se encontró asignación para esta tarea atrasada'
        };
      }
    }

    // Crear log de "no aplicable" para la tarea
    const taskLog = new TaskLog({
      task_assignment: new mongoose.Types.ObjectId(realAssignmentId),
      user: new mongoose.Types.ObjectId(userId),
      action_type: 'not_applicable',
      value: 0,
      comment: reason || 'Marcada como no aplicable',
      evidence: [],
      log_date: new Date()
    });

    await taskLog.save();

    console.log('✅ Log de no aplicable creado exitosamente');

    return {
      success: true,
      message: 'Tarea marcada como no aplicable exitosamente',
      log_id: taskLog._id
    };

  } catch (error) {
    console.error('❌ Error en skipAllOverdueSimple:', error);
    return {
      success: false,
      message: 'Error al saltar tarea atrasada: ' + error.message
    };
  }
};

module.exports = {
  completeTaskSimple,
  registerActionSimple,
  markNotApplicableSimple,
  completeAllOverdueSimple,
  skipAllOverdueSimple
};
