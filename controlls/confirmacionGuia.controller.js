const ConfirmacionGuia = require('../models/ConfirmacionGuia');
const ReconfirmacionGuia = require('../models/ReconfirmacionGuia');
const Guia = require('../models/Guia');
const Ruta = require('../models/Ruta');
const Conductores = require('../models/Conductores');

exports.obtenerRutas = async (req, res) => {
  try {
    console.log('🔍 Obteniendo rutas...');
    
    const rutas = await Ruta.find();
    
    console.log('📊 Rutas encontradas:', rutas.length);
    console.log('📋 Primera ruta:', rutas[0] ? {
      _id: rutas[0]._id,
      Rutas: rutas[0].Rutas,
      numero: rutas[0].numero
    } : 'No hay rutas');
    
    res.json({ success: true, data: rutas });
  } catch (err) {
    console.error('❌ Error al obtener rutas:', err);
    res.status(500).json({ success: false, message: 'Error al obtener rutas' });
  }
};

exports.obtenerConductores = async (req, res) => {
  try {
    console.log('🔍 Obteniendo conductores...');
    
    const conductores = await Conductores.find();
    
    console.log('📊 Conductores encontrados:', conductores.length);
    console.log('📋 Primer conductor:', conductores[0] ? {
      _id: conductores[0]._id,
      nombre: conductores[0].nombre,
      usuario: conductores[0].usuario
    } : 'No hay conductores');
    
    res.json({ success: true, data: conductores });
  } catch (err) {
    console.error('❌ Error al obtener conductores:', err);
    res.status(500).json({ success: false, message: 'Error al obtener conductores' });
  }
};

exports.crearConfirmacionGuia = async (req, res) => {
  try {
    const { guiaId, nota, imagenes, monto } = req.body;
    const usuario = req.session?.userId;

    console.log('Creando confirmación de guía:', req.body);

    if (!guiaId || !nota || !usuario || !monto) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos para crear la confirmación de guía' 
      });
    }

    const guia = await Guia.findById(guiaId);
    if (!guia) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guía no encontrada' 
      });
    }

    const nuevaConfirmacionGuia = new ConfirmacionGuia({
      nro_guia: guia.nro_guia,
      nombreRemitente: guia.remitente || 'No especificado',
      celula_remitente: guia.telefono_remitente || 'No especificado',
      nota,
      ruta: guia.ruta,
      idchofer: guia.chofer,
      monto: parseFloat(monto),
      imagenes: Array.isArray(imagenes) ? imagenes : [],
      usuario
    });

    await nuevaConfirmacionGuia.save();

    res.json({ 
      success: true, 
      message: 'Confirmación de guía creada correctamente',
      confirmacion: nuevaConfirmacionGuia
    });

  } catch (err) {
    console.error('Error al crear confirmación de guía:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.crearReconfirmacionGuia = async (req, res) => {
  try {
    const { guiaId, nota, imagenes, monto, statusReconfirmacion } = req.body;
    const usuario = req.session?.userId;

    console.log('Creando reconfirmación de guía:', req.body);

    if (!guiaId || !nota || !usuario || !monto || !statusReconfirmacion) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos para crear la reconfirmación de guía' 
      });
    }

    const guia = await Guia.findById(guiaId);
    if (!guia) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guía no encontrada' 
      });
    }

    const nuevaReconfirmacionGuia = new ReconfirmacionGuia({
      nro_guia: guia.nro_guia,
      nombreRemitente: guia.remitente || 'No especificado',
      celula_remitente: guia.telefono_remitente || 'No especificado',
      nota,
      ruta: guia.ruta,
      idchofer: guia.chofer,
      monto: parseFloat(monto),
      statusReconfirmacion,
      imagenes: Array.isArray(imagenes) ? imagenes : [],
      usuario
    });

    await nuevaReconfirmacionGuia.save();

    res.json({ 
      success: true, 
      message: 'Reconfirmación de guía creada correctamente',
      reconfirmacion: nuevaReconfirmacionGuia
    });

  } catch (err) {
    console.error('Error al crear reconfirmación de guía:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.obtenerConfirmacionesGuia = async (req, res) => {
  try {
    console.log('🔍 Obteniendo confirmaciones de guía...');
    
    const confirmaciones = await ConfirmacionGuia.find()
      .populate('ruta', 'Rutas')
      .populate('usuario', 'name')
      .sort({ createdAt: -1 });

    console.log('📊 Confirmaciones encontradas:', confirmaciones.length);
    console.log('📋 Primera confirmación:', confirmaciones[0] ? {
      nro_guia: confirmaciones[0].nro_guia,
      nombreRemitente: confirmaciones[0].nombreRemitente,
      usuario: confirmaciones[0].usuario,
      ruta: confirmaciones[0].ruta
    } : 'No hay confirmaciones');

    res.json({ 
      success: true, 
      confirmaciones 
    });

  } catch (err) {
    console.error('❌ Error al obtener confirmaciones de guía:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

exports.obtenerReconfirmacionesGuia = async (req, res) => {
  try {
    console.log('🔍 Obteniendo reconfirmaciones de guía...');
    
    const reconfirmaciones = await ReconfirmacionGuia.find()
      .populate('ruta', 'Rutas')
      .populate('usuario', 'name')
      .sort({ createdAt: -1 });

    console.log('📊 Reconfirmaciones encontradas:', reconfirmaciones.length);
    console.log('📋 Primera reconfirmación:', reconfirmaciones[0] ? {
      nro_guia: reconfirmaciones[0].nro_guia,
      nombreRemitente: reconfirmaciones[0].nombreRemitente,
      usuario: reconfirmaciones[0].usuario,
      ruta: reconfirmaciones[0].ruta,
      statusReconfirmacion: reconfirmaciones[0].statusReconfirmacion
    } : 'No hay reconfirmaciones');

    res.json({ 
      success: true, 
      reconfirmaciones 
    });

  } catch (err) {
    console.error('❌ Error al obtener reconfirmaciones de guía:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

