const { Schema, model } = require('mongoose');

const TaskAssignmentSchema = new Schema({
  task_definition: {
    type: Schema.Types.ObjectId,
    ref: 'TaskDefinition',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    required: true
  },
  start_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  end_date: {
    type: Date
  },
  activo: {
    type: Boolean,
    default: true
  },
  assignment_type: {
    type: String,
    enum: ['general', 'specific'],
    default: 'general'
  },
  notes: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completed_at: {
    type: Date
  },
  skipped: {
    type: Boolean,
    default: false
  },
  skipped_at: {
    type: Date
  },
  not_applicable: {
    type: Boolean,
    default: false
  },
  not_applicable_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
TaskAssignmentSchema.index({ user: 1, activo: 1 });
TaskAssignmentSchema.index({ task_definition: 1, activo: 1 });
TaskAssignmentSchema.index({ start_date: 1, end_date: 1 });

module.exports = model('TaskAssignment', TaskAssignmentSchema);
