const { Schema, model } = require('mongoose');

const ConductorSchema = new Schema({
  nombre: { type: String, required: true },
  fecha_agregado: { type: Date, default: Date.now },
  rutas: [{
    type: Schema.Types.ObjectId,
    ref: 'Ruta'
  }],
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Relación con el modelo Users
    required: true
  }
}, {
  timestamps: true
});

module.exports = model('Conductor', ConductorSchema);
