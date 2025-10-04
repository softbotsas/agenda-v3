const { Schema, model } = require('mongoose');

const TagSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  display_name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  color: { 
    type: String, 
    default: '#6c757d',
    match: /^#[0-9A-Fa-f]{6}$/
  },
  category: {
    type: String,
    enum: ['operaciones', 'administracion', 'rrhh', 'finanzas', 'logistica', 'tecnologia', 'otro'],
    default: 'otro'
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    required: true
  },
  usage_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
TagSchema.index({ name: 1 });
TagSchema.index({ active: 1, category: 1 });
TagSchema.index({ usage_count: -1 });

// Middleware para actualizar usage_count cuando se usa una etiqueta
TagSchema.methods.incrementUsage = function() {
  this.usage_count += 1;
  return this.save();
};

TagSchema.methods.decrementUsage = function() {
  this.usage_count = Math.max(0, this.usage_count - 1);
  return this.save();
};

module.exports = model('Tag', TagSchema);

