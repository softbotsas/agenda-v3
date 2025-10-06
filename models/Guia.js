const { localsName } = require('ejs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');  // Solo moment, sin moment-timezone
const guiaSchema = new Schema({
 
  telefono_remite: {
    type: String
  },
  celular_remite:{
    type: String,
    required: true
  },
  nom_cliente_remite: String,
  nro_id_remite: String,
  direccion_remite: {
    type: String,
    trim: true // Aplica trim() automáticamente
  },
  Interior_remite: String,
  referido: String,
  pais_remite: {
    type: Object,
    required: true,
    ref: 'Country'
  },
  estado_remite: {
    type: Object,
    required: true,
    ref: 'State'
  },
  ciudad_remite: {
    type: Object,
    required: true,
    ref: 'City'
  },
  email_remite: String,
  zip_remite: String,
  telefono_destina: String,
  celular_destina: String,
  nom_cliente_destina: String,
  nro_id_destina: String,
  direccion_destina: {
    type: String,
    trim: true // Aplica trim() automáticamente
  },
  Interior_destina: String,
  pais_destina: {
    type: Object,
    ref: 'pais_destina',
    required: true
  },
  estado_destina: {
    type: Object,
    required: true,
    ref: 'State2'
  },
  ciudad_destina: {
    type: Object,
    required: true,
    ref: 'City2'
  },
  email_destina: String,
  zip_destina: String,
  lugar_recogida: String,
  ruta: {
    type: String,
    ref: 'Ruta'
  },
  tipo_contenido: String,
  tipo_envio: String,
  preguia: String,
  fecha: {
    type: Date
  },
  fecha_recepcion: {
    type: Date,
    default: Date.now
  },
  firmaGuardada:String,
  firmaEntrega:String,
  agencia: {
    type: Schema.Types.ObjectId,
    ref: 'Agencia',
    required: true
  },
  // Nuevos campos agregados
  precio_a_pagar: Number,
  total_seguro: Number,
  total_fac: Number, // Añadido según la solicitud
  total_impuesto: Number, // Añadido según la solicitud
  despachado: { type: Boolean, default: false },
  usuario: {
    type: Schema.Types.Mixed,
    required: true
  },
  status : {
    type : String
  },
  nro_guia : String,
  lat : String,
  lon: String,
  referencia1: String,
  referencia2: String,
  barrio2: String,
  total_descuento: Number,
  chofer : String,
  recolector: String,
  ruta_destino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RutaDestino'
  }, 

  nota_recogida:{type : String},
  direccion_recogida:{type : String}
  
});

// Índices para optimizar consultas frecuentes
guiaSchema.index({ fecha: -1 });
guiaSchema.index({ nro_guia: 1 });
guiaSchema.index({ agencia: 1, fecha: -1 });
guiaSchema.index({ ruta: 1, fecha: -1 });
guiaSchema.index({ status: 1, fecha: -1 });
guiaSchema.index({ celular_remite: 1 });
guiaSchema.index({ nom_cliente_remite: 1 });
guiaSchema.index({ usuario: 1, fecha: -1 });
guiaSchema.index({ fecha_recepcion: -1 });

const Guia = mongoose.model('Guia', guiaSchema);
module.exports = Guia;