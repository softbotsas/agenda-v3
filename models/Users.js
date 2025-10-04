const { Schema, model } = require('mongoose');
//const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserSchema = new Schema({
  name: { type: String, required: true },
  correo: { type: String, required: true },
  password: { type: String, required: true },
  celular: { type: String, required: true  }, // Campo opcional
  telefono: { type: String }, // Campo opcional
  direccion: { type: String }, // Campo opcional
  pais: { type: String , required: true  }, // Campo opcional
  estado: { type: String, required: true  }, // Campo opcional
  ciudad: { type: String, required: true  }, // Campo opcional
  perfil_usuario: { type: Number , required: true }, // Campo opcional
  tipo_impre: { type: Number , required: true }, // Campo opcional
  cargo: {
    type: Schema.Types.ObjectId,
    ref: 'Cargo'
  },
  agencia: {
    type: Schema.Types.ObjectId,
    ref: 'Agencia'
  },
  status: {
    type: Boolean,
    default: true
  },
  horarioTrabajo: {
    activo: {
      type: Boolean,
      default: false
    },
    desde: {
      type: String,
      default: "08:00"
    },
    hasta: {
      type: String,
      default: "17:00"
    }
  },
  agenda_user: {
    type: Schema.Types.ObjectId,
    ref: 'agenda.User',
    default: null
  },
  // Información específica para agenda
  agenda_info: {
    nombre_agenda: { type: String, trim: true },
    color: { type: String, default: '#007bff' },
    activo_agenda: { type: Boolean, default: true }
  }
    
}, {
  timestamps: true
});
/*
UserSchema.methods.encryptPassword = async function(password) {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

UserSchema.methods.matchPassword = async function(password) { // Corregir typo
  return await bcrypt.compare(password, this.password);
};*/

module.exports = model('User', UserSchema);