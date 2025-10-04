const { Schema, model } = require('mongoose');

const TaskLogSchema = new Schema({
  task_assignment: {
    type: Schema.Types.ObjectId,
    ref: 'TaskAssignment',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    required: true
  },
  log_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  action_type: {
    type: String,
    required: true,
    enum: ['completed', 'increment', 'comment', 'not_applicable'],
    default: 'completed'
  },
  value: {
    type: Number,
    default: 1
  },
  comment: {
    type: String,
    trim: true
  },
  evidence: [{
    filename: String,
    original_name: String,
    mime_type: String,
    size: Number,
    url: String, // URL para acceder al archivo
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  // Nota adicional del usuario
  nota: {
    type: String,
    trim: true,
    maxlength: 500
  },
  is_late: {
    type: Boolean,
    default: false
  },
  sla_breach_minutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
TaskLogSchema.index({ user: 1, log_date: 1 });
TaskLogSchema.index({ task_assignment: 1, log_date: 1 });
TaskLogSchema.index({ log_date: 1, action_type: 1 });

// Método para calcular si está atrasado
TaskLogSchema.methods.calculateSLAStatus = function(taskDefinition) {
  if (!taskDefinition.sla_time) return;
  
  const logTime = new Date(this.log_date);
  const today = new Date();
  const slaTime = taskDefinition.sla_time.split(':');
  
  const slaDateTime = new Date(today);
  slaDateTime.setHours(parseInt(slaTime[0]), parseInt(slaTime[1]), 0, 0);
  
  this.is_late = logTime > slaDateTime;
  this.sla_breach_minutes = this.is_late ? 
    Math.floor((logTime - slaDateTime) / (1000 * 60)) : 0;
};

module.exports = model('TaskLog', TaskLogSchema);
