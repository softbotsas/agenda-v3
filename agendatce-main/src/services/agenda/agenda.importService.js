const fs = require('fs');
const csv = require('csv-parser');
const TaskDefinition = require('../../models/agenda.TaskDefinition');
const TaskAssignment = require('../../models/agenda.TaskAssignment');

class ImportService {
  
  // Importar tareas desde CSV
  static async importTasksFromCSV(filePath, createdBy) {
    try {
      const results = {
        success: 0,
        errors: 0,
        errors_list: [],
        task_definitions: []
      };
      
      const tasks = [];
      
      // Leer archivo CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            tasks.push(row);
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Procesar cada tarea
      for (const row of tasks) {
        try {
          // Validar datos requeridos
          if (!row.title || !row.periodicity || !row.mode) {
            throw new Error('Faltan campos requeridos');
          }
          
          // Crear definición de tarea
          const taskData = {
            title: row.title.trim(),
            description: row.description ? row.description.trim() : '',
            periodicity: row.periodicity.trim(),
            mode: row.mode.trim(),
            target_per_period: parseFloat(row.target_per_period) || 1,
            sla_time: row.sla_time ? row.sla_time.trim() : null,
            requires_evidence: row.requires_evidence === 'True' || row.requires_evidence === 'true',
            tags: this.parseTags(row.tags),
            created_by: createdBy
          };
          
          // Verificar si la tarea ya existe
          const existingTask = await TaskDefinition.findOne({
            title: taskData.title,
            created_by: createdBy
          });
          
          if (existingTask) {
            results.errors++;
            results.errors_list.push(`Tarea "${row.title}" ya existe`);
            continue;
          }
          
          const taskDefinition = new TaskDefinition(taskData);
          await taskDefinition.save();
          
          results.success++;
          results.task_definitions.push(taskDefinition);
          
        } catch (error) {
          results.errors++;
          results.errors_list.push(`Error en "${row.title}": ${error.message}`);
        }
      }
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Error importing tasks from CSV:', error);
      return { success: false, message: 'Error al importar tareas desde CSV' };
    }
  }

  // Asignar tareas a usuarios
  static async assignTasksToUsers(taskIds, userIds, assignedBy) {
    try {
      const results = {
        success: 0,
        errors: 0,
        errors_list: [],
        assignments: []
      };
      
      for (const taskId of taskIds) {
        for (const userId of userIds) {
          try {
            // Verificar si ya existe la asignación
            const existingAssignment = await TaskAssignment.findOne({
              task_definition: taskId,
              assigned_to: userId,
              active: true
            });
            
            if (existingAssignment) {
              results.errors++;
              results.errors_list.push(`Tarea ya asignada al usuario`);
              continue;
            }
            
            const assignment = new TaskAssignment({
              task_definition: taskId,
              assigned_to: userId,
              assigned_by: assignedBy,
              start_date: new Date()
            });
            
            await assignment.save();
            results.success++;
            results.assignments.push(assignment);
            
          } catch (error) {
            results.errors++;
            results.errors_list.push(`Error asignando tarea: ${error.message}`);
          }
        }
      }
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Error assigning tasks to users:', error);
      return { success: false, message: 'Error al asignar tareas a usuarios' };
    }
  }

  // Parsear etiquetas desde string
  static parseTags(tagsString) {
    if (!tagsString) return [];
    
    try {
      // Intentar parsear como JSON
      if (tagsString.startsWith('[') && tagsString.endsWith(']')) {
        return JSON.parse(tagsString.replace(/'/g, '"'));
      }
      
      // Si no es JSON, dividir por comas
      return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    } catch (error) {
      // Si falla el parseo, dividir por comas
      return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  }

  // Exportar tareas a CSV
  static async exportTasksToCSV(userId, startDate, endDate) {
    try {
      const TaskLog = require('../../models/agenda.TaskLog');
      
      const query = { user: userId };
      if (startDate && endDate) {
        query.log_date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const logs = await TaskLog.find(query)
        .populate('task_assignment')
        .populate('user', 'nombre email')
        .sort({ log_date: -1 });
      
      // Crear CSV
      let csv = 'Fecha,Usuario,Tarea,Accion,Valor,Comentario,Evidencia,Atrazo,Minutos_Atrazo\n';
      
      logs.forEach(log => {
        const taskName = log.task_assignment?.task_definition?.title || 'N/A';
        const evidence = log.evidence.map(e => e.original_name).join(';');
        
        csv += `"${log.log_date.toISOString()}","${log.user.name}","${taskName}","${log.action_type}","${log.value}","${log.comment || ''}","${evidence}","${log.is_late ? 'Si' : 'No'}","${log.sla_breach_minutes}"\n`;
      });
      
      return { success: true, data: csv };
    } catch (error) {
      console.error('Error exporting tasks to CSV:', error);
      return { success: false, message: 'Error al exportar tareas a CSV' };
    }
  }
}

module.exports = ImportService;
