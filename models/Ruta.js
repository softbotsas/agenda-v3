const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rutaSchema = new Schema({
  numero: {
    type: Number,
    required: true
  },
  Rutas: {
    type: String,
    required: true
  },
  CodigosPostales: {
    type: [String],
    required: true
  }
  ,
  dias: {
    type: [String]
  }
});

const Ruta = mongoose.model('Ruta', rutaSchema);

module.exports = Ruta;
