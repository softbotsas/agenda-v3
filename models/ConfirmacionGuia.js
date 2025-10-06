const mongoose = require('mongoose');

const confirmacionGuiaSchema = new mongoose.Schema({
  nro_guia: {
    type: String,
    required: true
  },
  nombreRemitente: {
    type: String,
    required: true
  },
  celula_remitente: {
    type: String,
    required: true
  },
  nota: {
    type: String,
    required: true
  },
  ruta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ruta',
    required: true
  },
  chofer: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  imagenes: [{
    type: String
  }],
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ConfirmacionGuia', confirmacionGuiaSchema);

