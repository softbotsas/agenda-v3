const express = require('express');
const router = express.Router();
const confirmacionGuiaController = require('../controlls/confirmacionGuia.controller');

// Rutas para confirmaciones de guía
router.post('/crear', confirmacionGuiaController.crearConfirmacionGuia);
router.post('/reconfirmacion/crear', confirmacionGuiaController.crearReconfirmacionGuia);
router.get('/obtener', confirmacionGuiaController.obtenerConfirmacionesGuia);
router.get('/reconfirmacion/obtener', confirmacionGuiaController.obtenerReconfirmacionesGuia);
router.get('/rutas', confirmacionGuiaController.obtenerRutas);
router.get('/conductores', confirmacionGuiaController.obtenerConductores);

module.exports = router;

