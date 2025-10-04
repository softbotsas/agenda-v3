module.exports = (req, res, next) => {
  console.log(req.path);
  
  if (req.session.userId) {
    // Si el usuario está autenticado, continúa
    return next();
  } else {
    // Permitir ciertas rutas sin autenticación:
    if (
      req.path === '/login' ||
      req.path === '/iniciar_session' ||
      req.path.startsWith('/tuagencia/') ||
      req.path === '/preguia/add' ||
      req.path === '/cargar_contenido/add' ||
      
      req.path === '/terminos_condiciones' ||
      req.path === '/accesos_externos/preguias_sussesfull' ||
      req.path.startsWith('/assets/media/comprobantes') ||
      /^\/assets\/media\/comprobantes(\/|$)/.test(req.path) ||
      /^\/agendatce\//.test(req.path) ||
      /^\/preguia2\//.test(req.path) ||
      /^\/preguia3\//.test(req.path) ||
      /^\/carga_contenido\//.test(req.path) ||
      /^\/states\//.test(req.path) ||
      /^\/cities\//.test(req.path) ||
      /^\/guia_ex\//.test(req.path) ||
      /^\/factura_guia\//.test(req.path) ||
      /^\/terminos_condiciones\//.test(req.path) ||

      req.path === '/accesos_externos/preguias_sussesfull2' ||
      req.path === '/guardar-firma' ||
      req.path === '/actualizar_movimiento' ||
      /^\/ubicacion\//.test(req.path) ||
      /^\/ubicacion2\//.test(req.path) ||
      req.path === '/ubicacion_por_selects' ||
      /^\/ultimaguia2\//.test(req.path) ||
      req.path.startsWith('/info_login') ||
      req.path.startsWith('/api/obtener_rutas') ||
      req.path.startsWith('/api/cuadre/api') ||
      req.path.startsWith('/api/guardarcuadre_api') ||
      req.path.startsWith('/api/guardar_ubicacion_chofer') ||
      req.path.startsWith('/api/ultima_ubicacion_chofer') ||
      req.path.startsWith('/api/ubicaciones-multiples') ||
      req.path.startsWith('/api/cancelar_visita') ||
      req.path.startsWith('/api/notas') ||
      req.path.startsWith('/notas_app') ||
      
      req.path.startsWith('/api/ubicaciones_chofer') ||
      req.path.startsWith('/api/mov_chofer_destino2') ||
      
      
      req.path.startsWith('/api/guardar_ruta_previa') ||
      req.path.startsWith('/api/estado_ruta') ||
      req.path.startsWith('/api/reporte/movimientos') ||
      req.path.startsWith('/api/preguia') ||
      req.path.startsWith('/api/agencias') ||
      req.path.startsWith('/agencias') ||
      req.path.startsWith('/api/rutas') ||
      req.path.startsWith('/rutas/by-zip') ||
      req.path.startsWith('/ruta/by-zip') ||
      req.path.startsWith('/rutas/zip') ||
      req.path.startsWith('/api/tabuladores') ||
      req.path.startsWith('/tabuladores') ||
      req.path.startsWith('/api/countries/origenes') ||
      req.path.startsWith('/countries/origenes') ||
      req.path.startsWith('/api/countries/destinos') ||
      req.path.startsWith('/countries/destinos') ||
      req.path.startsWith('/api/countriess') ||
      req.path.startsWith('/countries') ||
      req.path.startsWith('/api/states') ||
      req.path.startsWith('/states') ||
      req.path.startsWith('/api/cities') ||
      req.path.startsWith('/cities') ||
      req.path.startsWith('/ubicacion') ||
      req.path.startsWith('/api/ubicacion') ||
      req.path.startsWith('/api/ubicacion2') ||
      req.path.startsWith('/api/ubicacion_por_selects') ||
      req.path.startsWith('/api/ultimaguia2') ||
      req.path.startsWith('/api/guardar-firma') ||
      req.path.startsWith('/api/crear_guia_app') ||
      req.path.startsWith('/api/crear_guia_app') ||



      req.path.startsWith('/api/buscar_rutas_usuario') ||
      req.path.startsWith('/api/movimiento_deposito_api') ||
      req.path.startsWith('/api/buscardeposito') ||
      req.path.startsWith('/api/buscardeposito2') ||
      req.path.startsWith('/api/depositos_usuario') ||      
      req.path.startsWith('/api/choferes_deposito') ||  
      req.path.startsWith('/api/mov_deposito_destino/carga2') ||
      req.path.startsWith('/api/obtener_info_guia_web') ||
      req.path.startsWith('/api/whatsapp-webhook') ||
      req.path.startsWith('/api/whatsapp-fallback') ||
      req.path === '/lista_rutas_todas' ||
      req.path === '/lista_rutas_todas2' ||
      req.path === '/lista_rutas_todas3' ||
      req.path === '/lista_rutas_todas4' ||
      
      req.path.startsWith('/api/pagar_recibir_pago') ||
      req.path.startsWith('/info_guia') ||
      req.path.startsWith('/api_registrarPago') ||
      req.path.startsWith('/api/dashboard-data') ||
      req.path.startsWith('/api/dashboard-data2') ||
      req.path.startsWith('/api/dashboard-data3') ||
      req.path.startsWith('/api/dashboard-data4') ||
      req.path.startsWith('/guia_pdt_registrar_agencia_eficiencia') ||
      req.path.startsWith('/api/movimienos_usuarios2') ||
      req.path.startsWith('/api/egreso/new') ||
      req.path.startsWith('/api/egresos/add') ||
      req.path.startsWith('/api/movimienos_usuarios') ||
      req.path.startsWith('/api/entregar_paquete_externo') ||
      req.path.startsWith('/api/guia_pdt_registrar_agencia_api2') ||
      req.path === '/actualizar_firma' ||
      req.path.startsWith('/actualizar_firma') ||
      req.path.startsWith('/guardar-comprobante') ||
      req.path.startsWith('/buscar_inf_chofer_destino') ||
      req.path.startsWith('/api/buscar_guias_geo') ||
      req.path.startsWith('/api/preguia2/add') ||
      req.path.startsWith('/api/conductores') ||
      req.path.startsWith('/api/reenviar-wa-cliente') ||
      req.path.startsWith('/api/pago_factura_conductor_4/add2') ||
      req.path.startsWith('/api/guia_pdt_registrar_agencia_api3') ||
      req.path.startsWith('/api/comisiones') ||
      req.path.startsWith('/api/tabuladores') ||
      
      req.path.startsWith('/api/obtener_tabulado') ||
        req.path.startsWith('/api/lista_rutas_list2')||
        req.path.startsWith('/api/lista_rutas_list3')||
      req.path.startsWith('/api/lista_tipo_egresos') 

      

      

      
    ) {
      return next(); // Se permite el acceso a estas rutas sin autenticación
    }
    return res.redirect('/login'); // Redirige al login si no cumple ninguna condición
  }
};