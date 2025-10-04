const { Schema, model } = require('mongoose');

const TaskDefinitionSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  periodicity: { 
    type: String, 
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'monThu', 'biweekly'],
    default: 'daily'
  },
  mode: { 
    type: String, 
    required: true,
    enum: ['binary', 'counter'],
    default: 'binary'
  },
  target_per_period: { 
    type: Number, 
    default: 1 
  },
  sla_time: { 
    type: String, 
    trim: true // Formato HH:MM
  },
  requires_evidence: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ 
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  active: { 
    type: Boolean, 
    default: true 
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    required: true
  },
  // Nuevos campos para frecuencia y días específicos
  frequency: {
    type: Number,
    default: 1
  },
  specific_days: [{
    type: Number
  }],
  // Campos para asignación específica (solo a empleados específicos)
  assigned_users: [{
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    required: true
  }],
  // Mantener compatibilidad temporal
  assignment_type: {
    type: String,
    enum: ['specific'],
    default: 'specific'
  },
  specific_user: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    default: null
  },
  // Departamento al que pertenece la tarea
  department: {
    type: String, // Cambiado a String para permitir códigos como "dept_usa"
    default: null
  },
  // Si la tarea es específica para un departamento o global
  department_scope: {
    type: String,
    enum: ['department', 'global'],
    default: 'department'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
TaskDefinitionSchema.index({ active: 1, periodicity: 1 });
TaskDefinitionSchema.index({ tags: 1 });

module.exports = model('TaskDefinition', TaskDefinitionSchema);
