"use strict";



var id_Ruta_predefinida= ''
// Variables globales (si las necesitas en otras funciones)
var guias = [];   
var direcciones =[]
let puntoPartida = null;
let puntoLlegada = null;
let coordenadasArray = [];
        let guiasSinCoordenadas = [];
// Aquí almacenaremos las guías obtenidas
var calendar;      // Instancia del calendario de FullCalendar
var defaultDate = moment().startOf("day").format("YYYY-MM-DD")
var choferes = conductores
let chofer =""

let mapaGoogle = null; // Instancia del mapa
let directionsRenderer = null; // Para dibujar la ruta
let rutaOptimizadaActual = null; // Para almacenar la ruta optimizada
let guiasFiltradasActuales = []; // Para almacenar las guías mostradas en el listado


let rutaPolyline = null;          // Variable para guardar la referencia a la polilínea dibujada
let rutaMarkers = []; 
// Asegúrate de que el DOM esté cargado:
let rutasGuardadas = []
let esrutaprevia = false
let  guiasCompletasOrdenadas = [];
 $(document).ready(function() {
    
    let  usuario_chofer =""

    let  id_usuario_chofer =""



  // 1) Elemento donde se va a renderizar el calendario:
  var calendarEl = document.getElementById("kt_calendar");
  

   // Función para parsear URL query parameters
   function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let autoExecutedFromUrl = false; // Bandera para evitar doble ejecución si ya tienes un load por defecto

// Check for parameters on page load
const rutaDesdeUrl = getQueryParam('ruta');
const fechaDesdeUrl = getQueryParam('desde');
const fechaHastaUrl = getQueryParam('hasta');

console.log("Parámetros de URL detectados:", { ruta: rutaDesdeUrl, desde: fechaDesdeUrl, hasta: fechaHastaUrl });

if (rutaDesdeUrl && fechaDesdeUrl && fechaHastaUrl) {
    // Validar que los elementos del DOM existan antes de intentar establecer sus valores
    const selectRutaEl = $("#kt_datatable_search_type_geo");
    const datePickerDesdeEl = $("#kt_datetimepicker_1");
    const datePickerHastaEl = $("#kt_datetimepicker_1_2");
    const btnInformacionComiEl = $("#informacion_comi");

    let allElementsExist = true;
    if (!selectRutaEl.length) {
        console.error("Elemento select '#kt_datatable_search_type_geo' no encontrado.");
        allElementsExist = false;
    }
    if (!datePickerDesdeEl.length) {
        console.error("Elemento datepicker '#kt_datetimepicker_1' no encontrado.");
        allElementsExist = false;
    }
    if (!datePickerHastaEl.length) {
        console.error("Elemento datepicker '#kt_datetimepicker_1_2' no encontrado.");
        allElementsExist = false;
    }
    if (!btnInformacionComiEl.length) {
        console.error("Botón '#informacion_comi' no encontrado.");
        allElementsExist = false;
    }

    if (allElementsExist) {
        console.log("Estableciendo valores de filtro desde parámetros de URL...");
        selectRutaEl.val(rutaDesdeUrl);
        datePickerDesdeEl.val(fechaDesdeUrl);
        datePickerHastaEl.val(fechaHastaUrl);

        // Si usas selectores personalizados (como Select2) o datepickers con JS (como Flatpickr),
        // podrías necesitar actualizarlos o disparar sus eventos 'change' aquí.
        // Ejemplo para Select2: selectRutaEl.trigger('change.select2');
        // Ejemplo para Flatpickr (si tienes las instancias):
        // if (window.flatpickrInstanceDesde) window.flatpickrInstanceDesde.setDate(fechaDesdeUrl, false);
        // if (window.flatpickrInstanceHasta) window.flatpickrInstanceHasta.setDate(fechaHastaUrl, false);
        // El 'false' es para no disparar su propio evento onchange si no es necesario y solo queremos setear.

        console.log("Valores establecidos. Ruta:", selectRutaEl.val(), "Desde:", datePickerDesdeEl.val(), "Hasta:", datePickerHastaEl.val());
        
        autoExecutedFromUrl = true;
        console.log("Parámetros cargados desde URL, se disparará #informacion_comi.click() en breve.");
        
        // Usar un pequeño timeout puede ayudar si los datepickers o selects necesitan un instante para procesar el .val()
        // antes de que el .click() lea sus valores correctamente.
        setTimeout(function() {
            console.log("Disparando click en #informacion_comi...");
            btnInformacionComiEl.trigger('click'); // O .click()
        }, 250); // Ajusta este delay si es necesario, o prueba sin él.
    } else {
        console.warn("Algunos elementos de filtro no se encontraron en el DOM. No se pudo autoejecutar la búsqueda desde URL.");
    }
} else if (rutaDesdeUrl || fechaDesdeUrl || fechaHastaUrl) {
    console.warn("Se encontraron algunos parámetros de URL, pero no todos los necesarios (ruta, desde, hasta) para autoejecutar la búsqueda.");
} else {
    console.log("No se encontraron parámetros de URL para filtros automáticos.");
    // Aquí podrías tener tu lógica para cargar datos por defecto si no hay parámetros en la URL
    // y `autoExecutedFromUrl` es false.
}






  $('#modalMostrarRuta').on('shown.bs.modal', function () {
    console.log("Modal #modalMostrarRuta mostrado. Disparando resize del mapa.");
    if (mapaGoogle) {
        google.maps.event.trigger(mapaGoogle, 'resize');

        // Volver a ajustar los bounds DESPUÉS del resize puede ser necesario
        const currentBoundsData = rutaOptimizadaActual?.bounds; // Acceder a los bounds guardados
        if (currentBoundsData && currentBoundsData.northeast && currentBoundsData.southwest) {
             console.log("Re-ajustando bounds después de mostrar modal...");
             try {
                 const bounds = new google.maps.LatLngBounds(
                     new google.maps.LatLng(currentBoundsData.southwest.lat, currentBoundsData.southwest.lng),
                     new google.maps.LatLng(currentBoundsData.northeast.lat, currentBoundsData.northeast.lng)
                 );
                 mapaGoogle.fitBounds(bounds);
             } catch (boundsError) {
                  console.error("Error re-ajustando bounds:", boundsError);
             }
        } else if (rutaOptimizadaActual?.optimizedRoutePoints?.length > 0) {
             // Fallback si no había bounds (chunking)
             console.log("Re-calculando y ajustando bounds desde puntos después de mostrar modal...");
             const bounds = new google.maps.LatLngBounds();
             let boundsExtended = false;
             rutaOptimizadaActual.optimizedRoutePoints.forEach(punto => {
                if(punto.coordenadas) {
                    try { bounds.extend(new google.maps.LatLng(punto.coordenadas.lat, punto.coordenadas.lng)); boundsExtended = true; } catch(e){}
                }
             });
             if(boundsExtended && !bounds.isEmpty()) mapaGoogle.fitBounds(bounds);
        }
    } else {
        console.warn("El objeto mapaGoogle no estaba listo al mostrar el modal.");
    }
});
  /**
   * Llamada AJAX para obtener las guías filtradas por:
   *  - from (fecha desde, formato YYYY-MM-DD)
   *  - to (fecha hasta, formato YYYY-MM-DD)
   *  - route (id de la ruta)
   * Retorna una promesa (jqXHR) de jQuery.
   */
  
  function buscarConductorPorRuta(rutaBuscada, conductores) {
    // Recorremos cada conductor
  
    conductores
    for (const conductor of conductores) {
        if(conductor.usuario._id === mi_usuario){
          console.log('ver ruta', conductor.nombre)

          return conductor.nombre || (conductor.usuario && conductor.usuario.name) || "";


        }


   
     
    }
   
    return "";
  }



  function fetchGuias(from, to, route) {

    let url = "/lista_rutas_list1?"; // Ajusta según tu endpoint real
    if (from) {
      url += `from=${encodeURIComponent(from)}&`;
    }
    if (to) {
      url += `to=${encodeURIComponent(to)}&`;
    }
    if (route) {
      url += `ruta=${encodeURIComponent(route)}&`;
    }
    // Quitar el '&' sobrante al final (opcional):
    url = url.replace(/&$/, "");

    return $.ajax({
      url: url,
      method: "GET",
      dataType: "json"
    });

  }

  /**
   * Recibe el array de guías y construye el calendario con FullCalendar.
   * Destruye el calendario anterior si existe, para evitar duplicados.
   */
  function renderCalendar(data) {
    // Destruir el calendario anterior (si existe)
    if (calendar) {
      calendar.destroy();
    }

    // Crear el nuevo calendario
    calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: ["interaction", "dayGrid", "timeGrid", "list"],
      locale: "es",                     // Cambia a "en" u otro si lo requieres
      isRTL: false,                     // Cambia a true si necesitas RTL
      header: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
      },
      height: 800,
      contentHeight: 750,
      aspectRatio: 3,
      defaultView: "listWeek",
      defaultDate: defaultDate,  // Día actual
      editable: true,
      eventLimit: true,
      navLinks: true,

      // Convertimos cada guía en un "evento" de FullCalendar
      events: data.map((guia) => ({
        // Texto a mostrar
        title:
          guia.tipo_contenido + 
          " Guía Nro: " + guia.nro_guia + 
          ", Dirección: " + (guia.direccion_recogida || guia.direccion_remite) + 
          ", Ciudad: " + (guia.ciudad_remite?.[0]?.name || ""),
        // Fecha inicial del evento
        start: moment(guia.fecha_recepcion).local().format(),
        // (Opcional) Para un tooltip o descripción extra
        description: guia.cliente_nombre,
        // Clases para dar color o estilo
        className:
          guia.tipo_contenido === "Delivery"
            ? "fc-event-danger fc-event-solid-warning"
            : guia.tipo_contenido === "Pickup"
            ? "fc-event-warning fc-event-solid-primary"
            : "",
        // Campos extra
        extendedProps: {
          nro_guia: guia.nro_guia,
          nom_cliente_remite: guia.nom_cliente_remite,
          direccion_remite: guia.direccion_recogida || guia.direccion_remite,
          lugar_recogida: guia.lugar_recogida,
          precio_a_pagar: guia.precio_a_pagar,
          ciudad_remite: guia.ciudad_remite,
          celular_remite: guia.celular_remite,
          tipo_contenidox: guia.tipo_contenido
        }
      })),

      /**
       *  eventRender: se ejecuta cuando se "pinta" cada evento en el calendario.
       *  Puedes personalizar el HTML, tooltips, modals, etc.
       */
      eventRender: function(info) {
        var element = $(info.el);
        if (info.event.extendedProps) {
          // Agregar un tooltip
          element.attr(
            "title",
            `${info.event.extendedProps.tipo_contenidox}\n` +
              `Guía Nro: ${info.event.extendedProps.nro_guia}\n` +
              `Cliente: ${info.event.extendedProps.nom_cliente_remite}\n` +
               ", Dirección: " + (info.event.extendedProps.direccion_recogida || info.event.extendedProps.direccion_remite) + 
              `Precio a Pagar: $${info.event.extendedProps.precio_a_pagar}`
          );

          // Al hacer clic, abrimos un modal (ejemplo con Bootstrap)
          element.on("click", function() {
            $("#exampleModalScrollable").modal("show");
            $("#exampleModalScrollable .modal-body").html(`
              <h5>Número de Guía: ${info.event.extendedProps.nro_guia} (${info.event.extendedProps.tipo_contenidox})</h5>
              <p><strong>Nombre del Cliente:</strong> ${info.event.extendedProps.nom_cliente_remite}</p>
             <p><strong>Dirección del Remitente:</strong> ${
                    info.event.extendedProps.direccion_recogida || info.event.extendedProps.direccion_remite
                  }</p>
              <p><strong>Lugar de Recogida:</strong> ${info.event.extendedProps.lugar_recogida}</p>
              <p><strong>Precio a Pagar:</strong> $${info.event.extendedProps.precio_a_pagar}</p>
              <p><strong>Ciudad del Remitente:</strong> ${
                info.event.extendedProps.ciudad_remite?.[0]?.name || ""
              }</p>
              <p><strong>Ver Guía:</strong> 
                <a href="https://sistematce.com/factura_guia/${info.event.extendedProps.nro_guia}" target="_blank">
                  ${info.event.extendedProps.nro_guia}
                </a>
              </p>
              <div style="display: flex; align-items: center;">
                <a href="https://wa.me/${info.event.extendedProps.celular_remite}" target="_blank" style="margin-right: 10px;">
                  <i class="fab fa-whatsapp" style="font-size: 34px; color: #25d366;"></i>
                </a>
                <a href="tel:${info.event.extendedProps.celular_remite}" style="margin-right: 10px;">
                  <i class="fas fa-phone" style="font-size: 34px; color: #4CAF50;"></i>
                </a>
              <a href="javascript:void(0);" onclick="obtenerCoordenadas2('${
                info.event.extendedProps.direccion_recogida || info.event.extendedProps.direccion_remite
              }')" style="margin-right: 10px;">
                <i class="fas fa-map-marker-alt" style="font-size: 34px; color: #FF5722;"></i>
              </a>
              </div>
            `);
          });
        }
      }
    });

    // Finalmente, renderizamos el calendario en la página
    calendar.render();
  }

  document.getElementById('btnFiltrar2').addEventListener('click', async function () {
        console.log( 'guia para seleccionar', guiasFiltradasActuales)
          abrirModalSeleccionGuias(guiasFiltradasActuales); 
     
      const guardarSection = document.getElementById("guardarRutaSection");
      if (guardarSection) guardarSection.style.display = "block";
  })


  document.getElementById('btnEliminarruta').addEventListener('click', async function () {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta ruta predefinida?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (!confirmacion.isConfirmed) {
      return; // El usuario canceló, no hacemos nada
    }
  
    try {
      const data = {
        id_Ruta_predefinida
      };
  
      const response = await fetch('/api/eliminar_ruta_previa', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      const result = await response.json();
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: result.message
        }).then(() => {
          location.reload(); // Recargar después de cerrar el modal
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo eliminar la ruta'
        });
      }
  
    } catch (error) {
      console.log('Error al eliminar ruta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al conectar con el servidor'
      });
    }
  });
  


  document.getElementById('btnFiltrar').addEventListener('click', async function() {
    console.log(guias)


    

    mostrarListadoGuias(guias);
      const partida = direcciones.find(direccion => direccion.predeterminado1 === 1);
      const llegada = direcciones.find(direccion => direccion.predeterminado2 === 1);

          puntoPartida = partida ? {
            coordenadas: {
                lat: Number(partida.lat),
                lng: Number(partida.lon)
            },
            nro_guia: 'Punto de Partida',
            direccion: partida.direccion,
            ciudad: '',
            estado: '',
            zip: ''
        } : null;

    puntoLlegada = llegada ? {
        coordenadas: {
            lat: Number(llegada.lat),
            lng: Number(llegada.lon)
        },
        nro_guia: 'Punto de Llegada',
        direccion: llegada.direccion,
        ciudad: '',
        estado: '',
        zip: ''
    } : null;


    const botonesParaQuitar = document.querySelectorAll('.quitar_lista');

  if (botonesParaQuitar.length > 0) {
    botonesParaQuitar.forEach(boton => {
      boton.style.display = 'none'; // Oculta el botón
    });
    console.log(`Se ocultaron ${botonesParaQuitar.length} botón(es) con la clase 'quitar_lista'.`);
  } else {
    console.log("No se encontraron botones con la clase 'quitar_lista' para ocultar.");
  }



  });

   // Fin de confirmarSeleccionYOptimizar
  

  async function busqueda_primarioa_ruta(guiasFiltradas) {
    console.log("Guias Filtradas:", guiasFiltradas);
    //clearMap();
    coordenadasArray = [];
    guiasSinCoordenadas = [];

    for (let guia of guiasFiltradas) {
        let coordenadas;
        if (!guia.lon || !guia.lat || guia.lon === "" || guia.lat === "") {
          var direccionBase = (guia.direccion_recogida && guia.direccion_recogida.trim() !== "") 
              ? guia.direccion_recogida 
              : guia.direccion_remite;
          var direccionCompleta = `${direccionBase}, ${guia.ciudad_remite[0].name}, ${guia.estado_remite[0].name}, ${guia.pais_remite[0].name}, ${guia.zip_remite}`;
          console.log("Direccion Completa:", direccionCompleta);
          
          coordenadas = await obtenerCoordenadas(direccionCompleta);
      } else {
            coordenadas = {
                lat: Number(guia.lat),  // Latitud guardada en la guía
                lng: Number(guia.lon)   // Longitud guardada en la guía
            };
        }
                            
            
    
        if (coordenadas && typeof coordenadas.lat === 'number' && typeof coordenadas.lng === 'number' && !isNaN(coordenadas.lat) && !isNaN(coordenadas.lng)) {
            coordenadasArray.push({
                coordenadas,
                nro_guia: `${guia.tipo_contenido} ${guia.nro_guia}`,
                nro_guia2: `${guia.nro_guia}`,
                direccion: (guia.direccion_recogida && guia.direccion_recogida.trim() !== "")
                ? guia.direccion_recogida
                : guia.direccion_remite,
                ciudad: guia.ciudad_remite[0]?.name,
                estado: guia.estado_remite[0]?.name,
                zip: guia.zip_remite,
                celular: guia.celular_remite,
                telefono: guia.telefono_remite,
                agencia: guia.agencia ? guia.agencia.NOMBRE : 'Agencia no disponible',
                lugar_recogida: guia.lugar_recogida,
                nom_cliente: guia.nom_cliente_remite,
                total_fac: guia.total_fac
            });
        } else {
            console.error('Coordenadas inválidas para la guía:', guia.nro_guia);
            guiasSinCoordenadas.push({
            nro_guia: `${guia.tipo_contenido || ''} ${guia.nro_guia || ''}`.trim(),
            nro_guia2: `${guia.nro_guia || ''}`,
            direccion: (guia.direccion_recogida && guia.direccion_recogida.trim() !== "")
            ? guia.direccion_recogida
            : guia.direccion_remite || 'Dirección no disponible',
            ciudad: guia.ciudad_remite?.[0]?.name || 'Ciudad no disponible',
            estado: guia.estado_remite?.[0]?.name || 'Estado no disponible',
            zip: guia.zip_remite || 'ZIP no disponible',
            celular: guia.celular_remite || 'Celular no disponible',
            telefono: guia.telefono_remite || 'Teléfono no disponible',
            agencia: guia.agencia?.NOMBRE || 'Agencia no disponible',
            direccion_agencia: guia.agencia?.DIRECCION || 'Dirección no disponible',
            lugar_recogida: guia.lugar_recogida || 'Lugar de recogida no disponible',
            nom_cliente: guia.nom_cliente_remite || 'Nombre del cliente no disponible',
            total_fac: guia.total_fac || 0
        });
        }
    }

    console.log('Coordenadas obtenidas:', coordenadasArray);
    const { optimizedRoute, totalDistance, totalDuration } =
      await optimizarRutaConGoogle(coordenadasArray);
    
    
    coordenadasArray = optimizedRoute;
    console.log("Ruta optimizada:", coordenadasArray);
    console.log("Distancia total (m):", totalDistance);
    console.log("Duración total (s):", totalDuration);
}

async function optimizarRutaConGoogle(coordenadasArray) {
  // Necesitamos mínimo 2 puntos: origen y destino
  if (!coordenadasArray || coordenadasArray.length < 2) {
    console.warn("No hay suficientes puntos para optimizar la ruta con Google.");
    return coordenadasArray || [];
  }

  // 1) Origen: primer elemento
  const origin = coordenadasArray[0].coordenadas; 
  // 2) Destino: último elemento
  const destination = coordenadasArray[coordenadasArray.length - 1].coordenadas;

  // 3) Waypoints: los elementos de en medio
  //    (el primer elemento es origen, el último es destino)
  const intermediate = coordenadasArray.slice(1, -1).map(item => ({
    location: new google.maps.LatLng(item.coordenadas.lat, item.coordenadas.lng),
    stopover: true
  }));

  const directionsService = new google.maps.DirectionsService();

  // 4) Construir la solicitud
  const request = {
    origin: new google.maps.LatLng(origin.lat, origin.lng),
    destination: new google.maps.LatLng(destination.lat, destination.lng),
    waypoints: intermediate,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  };

  // 5) Retornar una Promise para poder usar "await"
  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const route   = result.routes[0];
        const order   = route.waypoint_order; // orden re-optimizados

        // Reconstruimos un nuevo array, manteniendo el primero y último en su lugar
        // Origen = coordenadasArray[0]
        // Waypoints reordenados
        // Destino = coordenadasArray[coordenadasArray.length - 1]

        let routeOptimizada = [];
        routeOptimizada.push(coordenadasArray[0]); // Origen

        // Insertar cada waypoint en el nuevo orden
        // order[i] es un índice de 0 a intermediate.length-1,
        // que corresponde a coordenadasArray.slice(1, -1).
        order.forEach(idx => {
          // El waypoint real se ubica en coordenadasArray[idx + 1]
          // (+1 por el shift que hicimos al slice)
          routeOptimizada.push(coordenadasArray[idx + 1]);
        });

        // Finalmente agregamos el destino
        routeOptimizada.push(coordenadasArray[coordenadasArray.length - 1]);

        // Opcional: Calcular distancia y duración totales
        let totalDistance = 0;
        let totalDuration = 0;
        route.legs.forEach(leg => {
          totalDistance += leg.distance.value; // metros
          totalDuration += leg.duration.value; // segundos (o leg.duration_in_traffic.value si lo configuras)
        });

        // Resolvemos la Promise con el resultado
        resolve({
          optimizedRoute: routeOptimizada,
          totalDistance,
          totalDuration,
          directionsResult: result
        });
      } else {
        // Si no encuentra ruta, devolvemos error
        reject(status);
      }
    });
  });
}


  function construirDireccionCompleta(guia) {
    const dir = (guia.direccion_recogida && guia.direccion_recogida.trim() !== "")
    ? guia.direccion_recogida
    : (guia.direccion_remite || "");

    const ciudad = guia.ciudad_remite?.[0]?.name || "";
    const estado = guia.estado_remite?.[0]?.name || "";
    const pais   = guia.pais_remite?.[0]?.name   || "";
    const zip    = guia.zip_remite              || "";
  
    // Armar el string con cuidado de no concatenar "undefined"
    return `${dir}, ${ciudad}, ${estado}, ${pais}, ${zip}`.trim();
  }
  

  // Función para asegurar que todas las guías tengan lat/lon; si no, las obtiene usando la dirección.
  async function asegurarCoordenadasEnGuias(guiasAsegurar) { // Cambié el nombre del parámetro para evitar confusión
    console.log("Iniciando asegurarCoordenadasEnGuias para", guiasAsegurar.length, "guías.");
    for (const guia of guiasAsegurar) {
        if (!guia.lon || !guia.lat || String(guia.lon).trim() === "" || String(guia.lat).trim() === "" || isNaN(Number(guia.lat)) || isNaN(Number(guia.lon))) {
            const direccionCompleta = construirDireccionCompleta(guia); // Asumo que esta función existe
            console.log(`Obteniendo coordenadas para (ID: ${guia._id}, Nro: ${guia.nro_guia}): ${direccionCompleta}`);
            try {
                const coords = await obtenerCoordenadas(direccionCompleta); // Asumo que esta función existe
                if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
                    guia.lat = coords.lat;
                    guia.lon = coords.lng;
                    console.log(`Coordenadas obtenidas para ${guia.nro_guia}: {lat: ${guia.lat}, lng: ${guia.lon}}`);
                } else {
                    console.warn(`No se pudieron obtener coordenadas válidas para ${guia.nro_guia}. Coords recibidas:`, coords);
                    // Considera asignarles un valor que indique que no se pudieron geocodificar, ej: null, o no las modifiques
                    // para que fallen las validaciones posteriores si es el caso.
                }
            } catch (error) {
                console.error(`Error obteniendo coordenadas para ${guia.nro_guia}:`, error);
            }
        } else {
             // Si ya tiene coordenadas, asegúrate que sean números
             guia.lat = Number(guia.lat);
             guia.lon = Number(guia.lon);
             if(isNaN(guia.lat) || isNaN(guia.lon)){
                 console.warn(`Coordenadas existentes para <span class="math-inline">\{guia\.nro\_guia\} no son numéricas después de conversión\: Lat\=</span>{guia.lat}, Lon=${guia.lon}`);
                 // Podrías intentar geocodificar de nuevo o marcarlas como inválidas.
             }
        }
    }
    console.log("Finalizado asegurarCoordenadasEnGuias.");
    return guiasAsegurar;
}
// Versión async/await
async function obtenerCoordenadas(direccionCompleta) {
  try {
    const response = await fetch('/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direccion: direccionCompleta })
    });
    // Convertir la respuesta a JSON
    const data = await response.json();
    
    // Verificar si success === true
    if (data.success) {
      // Retornar las coordenadas que el backend envía en data.coordenadas
      return data.coordenadas;  // <--- Debería ser { lat, lng }
    } else {
      // El servidor devolvió success: false
      console.warn("No se pudieron obtener coordenadas (success=false). Respuesta:", data);
      return null;
    }
  } catch (error) {
    console.error("Error al llamar /geocode:", error);
    return null;
  }
}



  function optimizarRutaConGoogle2(originLat, originLon, guias, callback) {
    // Si no hay suficientes guías para usar como waypoints, retornar sin cambio
    if (!guias || guias.length < 1) {
      callback(null, { optimizedRoute: guias || [] });
      return;
    }
    console.log("Listado de coordenadas (lat, lon) para cada guía:");
      guias.forEach((guia, index) => {
        console.log(`Guía #${index + 1}: lat=${guia.lat}, lon=${guia.lon}`);
      });
    // Definir la API de Directions
    const directionsService = new google.maps.DirectionsService();

    // Convertir el origen (desde direcciones) a LatLng
    const origin = new google.maps.LatLng(originLat, originLon);

    // Definir un destino, por ejemplo la última guía
    const lastGuia = guias[guias.length - 1];
    const destination = new google.maps.LatLng(Number(lastGuia.lat), Number(lastGuia.lon));

    // Waypoints: el resto de las guías (exceptuando la última)
    const intermediate = guias.slice(0, -1).map(g => ({
      location: new google.maps.LatLng(Number(g.lat), Number(g.lon)),
      stopover: true
    }));

    // Construir la solicitud
    const request = {
      origin: origin,
      destination: destination,
      waypoints: intermediate,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING
     
    };

    directionsService.route(request, function(result, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        // waypoint_order: nuevo orden de los waypoints
        const order = result.routes[0].waypoint_order; // array de índices
        // Reconstruimos un array con el nuevo orden
        //  Origen (viene de direcciones, no está en el array guias)
        //  Waypoints reordenados
        //  Destino (la última guía)
        let routeOptimizada = [];

        // 1. No incluimos el origen en 'guias' – es externo
        // 2. Insertamos cada waypoint en el orden devuelto
        for (let i = 0; i < order.length; i++) {
          // order[i] es el índice dentro de 'intermediate'
          // Y 'intermediate' se corresponde con guias.slice(0, -1)
          routeOptimizada.push(guias[order[i]]);
        }
        // 3. Finalmente, el destino
        routeOptimizada.push(lastGuia);

        // Calcular distancia y duración total
        let totalDistance = 0;
        let totalDuration = 0;
        const routeLegs = result.routes[0].legs || [];
        for (let leg of routeLegs) {
          totalDistance += leg.distance.value;  // metros
          // Para ver la duración con tráfico, revisa si 'duration_in_traffic' existe
          totalDuration += (leg.duration_in_traffic?.value || leg.duration.value);
        }

        callback(null, {
          directionsResult: result,
          optimizedRoute: routeOptimizada,
          totalDistance,
          totalDuration
        });
      } else {
        callback(status);
      }
    });
  }


  $('#listadoGuias').on('dblclick', '#contenido_asignado .editable-observacion .text-display', function() {
    // ^^^^^^^^^^^^ Cambiado el selector base para la delegación
    //             y añadido #contenido_asignado al selector del evento para ser más específico

    const displaySpan = $(this);
    const containerDiv = displaySpan.closest('.editable-observacion');

    // Evitar múltiples textareas si ya se está editando
    if (containerDiv.find('textarea.edit-input-area').length > 0) {
        console.log("Ya en modo edición.");
        return;
    }
    console.log("Doble clic detectado, iniciando edición.");

    const seguimientoId = containerDiv.data('id');
    // Obtener el valor original desde el atributo data-original-value
    // Este valor se estableció cuando se generó el HTML de la celda.
    let originalValue = "";
    try {
        originalValue = decodeURIComponent(containerDiv.data('original-value'));
    } catch (e) {
        console.error("Error decodificando data-original-value:", e, "Valor crudo:", containerDiv.data('original-value'));
        // Fallback: tomar el texto actual del span si la decodificación falla
        originalValue = displaySpan.text(); 
    }
    
    // El valor actual para el input es lo que se muestra en el span
    const currentValueForInput = displaySpan.text();

    const inputArea = $('<textarea class="form-control edit-input-area" rows="3"></textarea>');
    inputArea.val(currentValueForInput); // Usar el texto visible actual para iniciar la edición

    displaySpan.hide();
    containerDiv.append(inputArea);
    inputArea.focus().select(); // Enfocar y seleccionar el texto

    // Manejar el evento blur (cuando se pierde el foco)
    inputArea.on('blur', function() {
        const newText = $(this).val().trim();
        const originalTextForComparison = originalValue; // Usar el 'originalValue' capturado al inicio del dblclick

        // Función para restaurar el span y quitar el textarea
        function restoreDisplay(textToDisplay) {
            // Al restaurar el texto en el span, usa .text() si el contenido es solo texto
            // o .html() si el contenido original fue sanitizado y debe renderizarse como HTML (con entidades).
            // Dado que usamos $('<div></div>').text(originalText).html() para sanitizar,
            // es mejor usar .html() aquí para mantener la consistencia.
            const sanitizedText = $('<div></div>').text(textToDisplay).html();
            displaySpan.html(sanitizedText);
            inputArea.remove();
            displaySpan.show();
        }

        if (newText === originalTextForComparison) {
            console.log("Texto sin cambios o revertido al original. Terminando edición.");
            restoreDisplay(originalTextForComparison);
            return;
        }

        // Si el texto cambió, preguntar para guardar
        Swal.fire({
            title: 'Confirmar Cambios',
            html: `¿Deseas guardar la nueva observación?<br><br><b>Nuevo:</b> ${$('<div/>').text(newText).html()}<br><b>Original:</b> ${$('<div/>').text(originalTextForComparison).html()}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Usuario confirmó, enviar a la API
                $.ajax({
                    url: '/api/editar_seguimiento', // Tu endpoint API
                    method: 'POST', // O 'PUT' según tu API
                    contentType: 'application/json',
                    data: JSON.stringify({
                        id: seguimientoId, // El _id del documento Seguimiento
                        observacion: newText
                    }),
                    success: function(response) {
                        Swal.fire('¡Guardado!', response.message || 'La observación ha sido actualizada.', 'success');
                        // Actualizar el span y el data-original-value con el nuevo texto
                        restoreDisplay(newText);
                        containerDiv.data('original-value', encodeURIComponent(newText)); // Actualizar el valor de referencia
                        console.log("Cambios guardados en el servidor.");
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error("Error guardando seguimiento:", jqXHR.responseJSON || jqXHR.responseText);
                        Swal.fire('Error', jqXHR.responseJSON?.message || 'No se pudo guardar la observación.', 'error');
                        // Revertir al texto original si falla el guardado
                        restoreDisplay(originalTextForComparison);
                        console.log("Error al guardar, UI revertida al original.");
                    }
                });
            } else {
                // Usuario canceló, revertir al texto original
                restoreDisplay(originalTextForComparison);
                console.log("Edición cancelada, UI revertida al original.");
            }
        });
    });

    // Opcional: Manejar la tecla Enter para simular un blur
    inputArea.on('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            $(this).blur();     
        }
    });
    // Opcional: Manejar la tecla Escape para cancelar y simular un blur
    inputArea.on('keydown', function(e) {
        if (e.key === 'Escape') {
            $(this).val(originalValue); // Revertir el valor del input al original antes de blur
            $(this).blur(); 
        }
    });
});


function mostrarListadoGuias(guiasFiltradas, fechaSeleccionada1, fechaSeleccionada2, textoRutaExterna) {
  // const rutaSeleccionada = document.getElementById('kt_datatable_search_type_geo').value; // Ya no se usa directamente aquí para filtrar
  
  const guiasFiltradasPorRutaYFecha = guiasFiltradas || []; // Asegurar que sea un array
  const guiasParaMostrar = guiasFiltradasPorRutaYFecha;


  

  const listado = document.getElementById('listadoGuias');
  listado.innerHTML = ''; 

  const divFechaConsulta = document.createElement('div');
  divFechaConsulta.className = 'consulta-fecha';
  const h5Fecha = document.createElement('label');
  h5Fecha.innerText = `Fecha de consulta: ${fechaSeleccionada1} al ${fechaSeleccionada2}`;
  divFechaConsulta.appendChild(h5Fecha);
  listado.appendChild(divFechaConsulta);

  const divRutaConsulta = document.createElement('div');
  divRutaConsulta.className = 'consulta-ruta';
  const h5Ruta = document.createElement('label');

  const selectRuta = document.getElementById('kt_datatable_search_type_geo');
  const textoRutaActualSeleccionada = selectRuta.options[selectRuta.selectedIndex]?.text || 'Sin seleccionar';
  // Usar textoRutaExterna si se provee (cuando se carga una ruta guardada), sino el del select actual.
  h5Ruta.innerText = `Ruta de consulta: ${textoRutaExterna || textoRutaActualSeleccionada}`;
  divRutaConsulta.appendChild(h5Ruta);
  listado.appendChild(divRutaConsulta);

  const divCantidadGuias = document.createElement('div');
  divCantidadGuias.className = 'consulta-cantidad-guias';
  const h5Cantidad = document.createElement('label');
  h5Cantidad.innerText = `Cantidad de guías disponibles: ${guiasFiltradasPorRutaYFecha.length}`;
  divCantidadGuias.appendChild(h5Cantidad);
  listado.appendChild(divCantidadGuias);

  console.log("Mostrando listado para:", guiasFiltradasPorRutaYFecha);
  
  const table = document.createElement('table');
  table.className = 'table table-striped';
  table.id = 'contenido_asignado';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  // Añadido 'Acciones' al array de encabezados
  const headers = ['N°', 'Tipo', 'Caja', 'Guía', 'Cliente', 'Telefono', 'Monto', 'Dirección', 'Ciudad - Estado', 'Seguimiento', 'Acciones'];

  headers.forEach(headerText => {
      const th = document.createElement('th');
      th.innerText = headerText;
      headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Asumimos que 'rutasGuardadas', 'guiasFiltradasPorRutaYFecha', y 'tbody'
// están definidos y disponibles en este ámbito.
// También se asume que la función 'manejarQuitarGuia(guiaId, nroGuia)' existe.

// 1. Obtener todos los nroGuia de las rutas guardadas
const todosLosNroGuia = rutasGuardadas.flatMap(ruta => {
  if (ruta && Array.isArray(ruta.puntos)) {
      return ruta.puntos
          .map(punto => punto && punto.nroGuia)
          .filter(nroGuia => nroGuia !== null && typeof nroGuia !== 'undefined');
  }
  return [];
});

console.log("Números de guía actualmente en rutas guardadas:", todosLosNroGuia);

// 2. Crear un Set para búsquedas eficientes de guías en rutas guardadas
const nroGuiasEnRutasGuardadasSet = new Set(todosLosNroGuia);

// 3. Ordenar el array guiasFiltradasPorRutaYFecha por nro_guia (ascendente)
guiasFiltradasPorRutaYFecha.sort((a, b) => {
  const nroGuiaA = a.nro_guia;
  const nroGuiaB = b.nro_guia;

  const strA = (nroGuiaA === null || typeof nroGuiaA === 'undefined') ? '' : String(nroGuiaA);
  const strB = (nroGuiaB === null || typeof nroGuiaB === 'undefined') ? '' : String(nroGuiaB);

  return strA.localeCompare(strB);
});

// 4. Iterar sobre las guías filtradas y ordenadas para construir las filas de la tabla
guiasFiltradasPorRutaYFecha.forEach((row, index) => {
  let observacionCellHtml;
  let seguimientoObjetivo = null;
  const tr = document.createElement('tr'); // Crear el elemento fila (tr)

  // Aplicar clase de resaltado si la nro_guia de esta fila está en el set de guías guardadas
  const nroGuiaDeEstaFila = row.nro_guia;
  if (nroGuiaDeEstaFila && nroGuiasEnRutasGuardadasSet.has(nroGuiaDeEstaFila)) {
      tr.classList.add('fila-guia-en-ruta'); // Asegúrate de tener esta clase definida en tu CSS
                                            // ej: .fila-guia-en-ruta { background-color: #ffebee !important; }
  }

  // Procesar seguimientoEspecial para obtener la observación
  if (Array.isArray(row.seguimientoEspecial) && row.seguimientoEspecial.length > 0) {
      seguimientoObjetivo = row.seguimientoEspecial[row.seguimientoEspecial.length - 1];
  } else if (row.seguimientoEspecial && typeof row.seguimientoEspecial === 'object') {
      // Verificar si es un objeto de seguimiento válido y no un array vacío disfrazado o similar
      if (typeof row.seguimientoEspecial.observacion !== 'undefined' || row.seguimientoEspecial._id) {
          seguimientoObjetivo = row.seguimientoEspecial;
      }
  }

  if (seguimientoObjetivo && seguimientoObjetivo._id) {
      const idDelSeguimiento = seguimientoObjetivo._id;
      const observacionOriginal = seguimientoObjetivo.observacion || '';
      // Sanitizar para mostrar en HTML, pero guardar el original para edición
      const observacionSanitizadaParaDisplay = $('<div></div>').text(observacionOriginal).html();
      observacionCellHtml = `
          <div class="editable-observacion" 
               data-id="${idDelSeguimiento}" 
               data-original-value="${encodeURIComponent(observacionOriginal)}">
              <span class="text-display">${observacionSanitizadaParaDisplay}</span>
          </div>`;
  } else {
      let textoObservacionPlano = 'N/A'; // Valor por defecto
      if (seguimientoObjetivo && typeof seguimientoObjetivo.observacion !== 'undefined') {
          textoObservacionPlano = seguimientoObjetivo.observacion || 'N/A'; // Si es string vacío, mostrar N/A
      } else if (typeof row.seguimientoEspecial === 'string') { // Si seguimientoEspecial es directamente un string
          textoObservacionPlano = row.seguimientoEspecial || 'N/A';
      }
      // Sanitizar texto plano también por si acaso
      observacionCellHtml = $('<div></div>').text(textoObservacionPlano).html();
  }

  // Definir los datos para cada celda de la fila
  const rowData = [
    index + 1, // Número de fila basado en el índice después de ordenar
    row.tipo_contenido || '',
    (row.detallesGuia && row.detallesGuia.length > 0)
        ? `${row.detallesGuia[0].alto}x${row.detallesGuia[0].ancho}x${row.detallesGuia[0].largo}`
        : 'N/A',
    row.nro_guia ? `<a href='/factura_guia/${row.nro_guia}' target='_blank' rel='noopener noreferrer'>${row.nro_guia}</a>` : '',
    row.nom_cliente_remite || '',
    `+${row.celular_remite || ''} / +${row.telefono_remite || ''}`,
    Number(parseFloat(row.total_fac || 0)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'), // Formato de moneda
    `${(row.direccion_recogida && row.direccion_recogida.trim() !== '' ? row.direccion_recogida : row.direccion_remite || '')}, Zip ${row.zip_remite || ''}`,
    `${(row.ciudad_remite?.[0]?.name || '')}${(row.ciudad_remite?.[0]?.name && row.estado_remite?.[0]?.name) ? ' - ' : ''}${(row.estado_remite?.[0]?.name || '')}`,
    observacionCellHtml // HTML para la celda de observación
  ];
  // Crear cada celda (td) y añadirla a la fila (tr)
  rowData.forEach(cellData => {
      const td = document.createElement('td');
      td.innerHTML = cellData;
      tr.appendChild(td);
  });

  // Crear y añadir la celda de Acciones con el botón "Quitar"
  const tdAcciones = document.createElement('td');
  const btnQuitar = document.createElement('button');
  btnQuitar.className = 'quitar_lista btn btn-danger btn-sm p-1'; // Clases para estilo y selección
  btnQuitar.innerHTML = '<i class="fas fa-times"></i> Quitar';
  btnQuitar.title = 'Quitar esta guía de la lista actual';

  // Añadir data-attributes al botón para identificar la guía a quitar
  if (row && typeof row._id !== 'undefined' && typeof row.nro_guia !== 'undefined') {
      btnQuitar.dataset.guiaId = row._id;
      btnQuitar.dataset.nroGuia = row.nro_guia;
  } else {
      console.warn("La guía actual no tiene _id o nro_guia y no se puede identificar para el botón Quitar:", row);
      btnQuitar.disabled = true; // Deshabilitar el botón si no hay identificadores
  }

  btnQuitar.onclick = function() {
      const guiaIdParaQuitar = this.dataset.guiaId;
      const nroGuiaParaQuitar = this.dataset.nroGuia;
      if (guiaIdParaQuitar || nroGuiaParaQuitar) { // Verificar si al menos uno de los identificadores está presente
           manejarQuitarGuia(guiaIdParaQuitar, nroGuiaParaQuitar); // Llama a la función que maneja la lógica de quitar
      } else {
          Swal.fire('Error', 'No se pudo identificar la guía para quitar (faltan ID o Nro Guía).', 'error');
      }
  };
  tdAcciones.appendChild(btnQuitar);
  tr.appendChild(tdAcciones);

  // Añadir la fila completa al cuerpo de la tabla (tbody)
  tbody.appendChild(tr);
});


  

  table.appendChild(tbody);
  listado.appendChild(table);
  
if (esrutaprevia === true) {
  
  const btnVerMapaGuardado = document.createElement('button');
  btnVerMapaGuardado.className = 'btn btn-info mr-2'; // Puedes usar un color diferente, ej: btn-info
  btnVerMapaGuardado.innerText = 'Ver Mapa de Ruta Guardada';
  btnVerMapaGuardado.onclick = function () {
      
      const rutaGuardadaOriginal = rutasGuardadas.find(r => r._id === id_Ruta_predefinida);

      if (rutaGuardadaOriginal && rutaGuardadaOriginal.rutaCoords && rutaGuardadaOriginal.puntos) {
          // Preparamos un objeto similar a 'rutaOptimizadaActual' pero con los datos originales
          const datosRutaOriginalParaMapa = {
            optimizedRoutePoints: rutaGuardadaOriginal.puntos.map(p => ({
              _id: p.idGuia, // Suponiendo que guardaste idGuia
              nro_guia: p.nroGuia,
              coordenadas: { lat: p.lat, lng: p.lng },
              direccion_remite: p.direccion_recogida && p.direccion_recogida.trim() !== ''
                  ? p.direccion_recogida
                  : (p.direccion_remite || p.direccion || ''),
              nom_cliente_remite: p.nom_cliente_remite || '' // Añadir otros campos si los tienes
          })),
              decodedCoords: rutaGuardadaOriginal.rutaCoords,
              bounds: rutaGuardadaOriginal.bounds, // Si guardaste bounds (necesitarás adaptarlo)
                                                  // o recalcular bounds desde los puntos si no los guardaste.
              totalDistance: rutaGuardadaOriginal.distanciaMetros,
              totalDuration: rutaGuardadaOriginal.duracionSegundos,
              instructions: rutaGuardadaOriginal.directions
          };

          // Si no guardaste 'bounds', puedes recalcularlos antes de llamar a dibujarRutaManualEnMapa
          if (!datosRutaOriginalParaMapa.bounds && datosRutaOriginalParaMapa.optimizedRoutePoints && datosRutaOriginalParaMapa.optimizedRoutePoints.length > 0) {
              const bounds = new google.maps.LatLngBounds();
              datosRutaOriginalParaMapa.optimizedRoutePoints.forEach(punto => {
                  if (punto.coordenadas) {
                      try {
                          bounds.extend(new google.maps.LatLng(punto.coordenadas.lat, punto.coordenadas.lng));
                      } catch (e) {
                          console.error("Error extendiendo bounds con punto:", punto, e);
                      }
                  }
              });
              // Convertir a formato { northeast: {lat, lng}, southwest: {lat, lng} } si dibujarRutaManualEnMapa lo espera así
              if (!bounds.isEmpty()) {
                  try {
                      datosRutaOriginalParaMapa.bounds = {
                          northeast: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() },
                          southwest: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() }
                      };
                  } catch (e) {
                       console.error("Error creando objeto bounds a partir de LatLngBounds:", e);
                  }
              }
          }

          console.log("Mostrando ruta guardada original en mapa:", datosRutaOriginalParaMapa);
          if (typeof dibujarRutaManualEnMapa === "function") {
              dibujarRutaManualEnMapa(datosRutaOriginalParaMapa); // Dibuja la ruta original
          } else {
              console.error("La función dibujarRutaManualEnMapa no está definida.");
          }
          
          // Mostrar información de la ruta original
          const infoDiv = document.getElementById('rutaInfoAdicional');
          if (infoDiv) {
              if (datosRutaOriginalParaMapa.totalDistance != null && datosRutaOriginalParaMapa.totalDuration != null) {
                  const distanciaKm = (datosRutaOriginalParaMapa.totalDistance / 1000).toFixed(1);
                  const duracionMin = Math.round(datosRutaOriginalParaMapa.totalDuration / 60);
                  infoDiv.innerHTML = `<p class="text-muted">Ruta Guardada - Distancia: ${distanciaKm} km, Duración: ${duracionMin} min.</p>`;
              } else {
                  infoDiv.innerHTML = '<p class="text-muted">Ruta Guardada - Información de distancia/duración no disponible.</p>';
              }
          }

          const guardarSection = document.getElementById("guardarRutaSection");
          if (guardarSection) guardarSection.style.display = "none"; // No se guarda nada al solo ver
          
          if (typeof $ === 'function' && $('#modalMostrarRuta').modal) {
              $('#modalMostrarRuta').modal('show');
          } else {
              console.error("jQuery o Bootstrap modal no está disponible para mostrar #modalMostrarRuta.");
          }

      } else {
          console.error("Error al cargar ruta guardada original:", { rutaGuardadaOriginal });
          Swal.fire('Error', 'No se pudieron cargar los datos completos de la ruta guardada para visualización. Verifique la consola.', 'error');
      }
  };
  listado.appendChild(btnVerMapaGuardado);

  const btnEditarGuiasRuta = document.createElement('button');
  btnEditarGuiasRuta.className = 'btn btn-warning mr-2';
  btnEditarGuiasRuta.innerText = 'Editar Guías de Ruta';
  btnEditarGuiasRuta.onclick = async function () {
      if (!guiasCompletasOrdenadas || !guiasFiltradasActuales || !rutasGuardadas || !id_Ruta_predefinida) {
          Swal.fire('Error de Datos', 'Faltan datos esenciales para la modificación (ruta actual, filtro general, rutas guardadas o ID de ruta actual).', 'error');
          console.error("Datos faltantes para Editar Guías de Ruta: ", {
              guiasCompletasOrdenadas_exists: !!guiasCompletasOrdenadas,
              guiasFiltradasActuales_exists: !!guiasFiltradasActuales,
              rutasGuardadas_exists: !!rutasGuardadas,
              id_Ruta_predefinida_exists: !!id_Ruta_predefinida
          });
          return;
      }

      Swal.fire({
          title: 'Preparando editor...',
          text: 'Verificando coordenadas y disponibilidad de guías.',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
      });

      try {
          // Paso 1: Asegurar coordenadas para todas las guías relevantes
          console.log("[Editar OnClick] Asegurando coordenadas en guiasFiltradasActuales antes de editar...");
          if (typeof asegurarCoordenadasEnGuias === "function") {
              await asegurarCoordenadasEnGuias(guiasFiltradasActuales);
          } else {
              console.error("La función asegurarCoordenadasEnGuias no está definida.");
              Swal.fire('Error de Configuración', 'Función de geocodificación no encontrada.', 'error');
              return;
          }
          
          // Paso 2: Identificar identificadores (nroGuia o idGuia) de guías asignadas a OTRAS rutas guardadas
          const identificadoresEnOtrasRutas = new Set();
          
          if (Array.isArray(rutasGuardadas)) {
              rutasGuardadas.forEach((rutaGuardada) => { // No necesitas 'index' aquí
                  if (!rutaGuardada || !rutaGuardada._id) {
                       console.log("[Editar OnClick] Ruta guardada inválida o sin _id, saltando:", rutaGuardada);
                      return;
                  }

                  if (rutaGuardada._id !== id_Ruta_predefinida) {
                       // console.log(`[Editar OnClick] Procesando OTRA ruta (ID: ${rutaGuardada._id}) para encontrar guías asignadas.`);
                      if (rutaGuardada.puntos && Array.isArray(rutaGuardada.puntos)) {
                          rutaGuardada.puntos.forEach((punto) => { // No necesitas 'puntoIndex' aquí
                              let identificadorGuiaEnPunto = null;
                              if (punto && punto.idGuia) { // Priorizar idGuia si existe
                                  identificadorGuiaEnPunto = String(punto.idGuia).toUpperCase().trim();
                              } else if (punto && punto.nroGuia && punto.nroGuia !== 'Punto de Partida' && punto.nroGuia !== 'Punto de Llegada') {
                                  identificadorGuiaEnPunto = String(punto.nroGuia).toUpperCase().trim();
                                  // console.log(`[Editar OnClick] Usando nroGuia '${punto.nroGuia}' como identificador para punto en OTRA ruta (ID: ${rutaGuardada._id}) porque idGuia no estaba.`);
                              }

                              if (identificadorGuiaEnPunto) {
                                  identificadoresEnOtrasRutas.add(identificadorGuiaEnPunto);
                              }
                          });
                      }
                  }
              });
          }
          console.log("[Editar Ruta OnClick] Identificadores de guías en OTRAS rutas (FINAL del cálculo):", Array.from(identificadoresEnOtrasRutas));

          // Paso 3: Crear la lista de guías que se mostrarán en el modal
          const guiasParaElModal = [];
          const idsGuiasYaEnModal = new Set(); 

          // Primero, agregar todas las de la ruta actual (serán pre-seleccionadas)
          guiasCompletasOrdenadas.forEach(guia => {
              if (!guia || typeof guia._id === 'undefined') return;
              const lat = Number(guia.lat);
              const lon = Number(guia.lon);
              const tieneCoordsValidas = guia.lat != null && guia.lon != null && String(guia.lat).trim() !== "" && String(guia.lon).trim() !== "" && !isNaN(lat) && !isNaN(lon);

              if (tieneCoordsValidas) {
                  if (!idsGuiasYaEnModal.has(guia._id)) {
                      guiasParaElModal.push(guia);
                      idsGuiasYaEnModal.add(guia._id);
                  }
              } else {
                  console.warn(`[Editar OnClick] Guía ${guia.nro_guia} de ruta actual ('guiasCompletasOrdenadas') excluida de modal por coords inválidas.`);
              }
          });
          console.log("[Editar Ruta OnClick] Guías de la ruta actual añadidas a guiasParaElModal (NroGuias):", guiasParaElModal.map(g=>g.nro_guia));

          // Luego, agregar las disponibles de guiasFiltradasActuales
          guiasFiltradasActuales.forEach(guia => {
              if (!guia || typeof guia._id === 'undefined' || typeof guia.nro_guia === 'undefined') return; 

              const lat = Number(guia.lat);
              const lon = Number(guia.lon);
              const tieneCoordsValidas = guia.lat != null && guia.lon != null && String(guia.lat).trim() !== "" && String(guia.lon).trim() !== "" && !isNaN(lat) && !isNaN(lon);
              
              const identificadorUnicoGuia = String(guia.idGuia || guia.nro_guia).toUpperCase().trim(); // Usar idGuia si existe, sino nro_guia
                                                                                                      // O mejor, ser consistente: si el Set tiene nroGuias, compara con nro_guia
              const nroGuiaNormalizadoEstaGuia = String(guia.nro_guia).toUpperCase().trim();
              const idGuiaEstaGuia = String(guia._id).toUpperCase().trim(); // Asumimos que _id es el ID de referencia

              // Condición para añadir:
              // 1. Tiene coordenadas válidas
              // 2. NO ha sido ya añadida desde guiasCompletasOrdenadas (verificación por _id)
              // 3. Su identificador (nroGuia normalizado O su _id) NO está en el Set de identificadoresEnOtrasRutas
              let estaEnOtraRuta = identificadoresEnOtrasRutas.has(nroGuiaNormalizadoEstaGuia) || identificadoresEnOtrasRutas.has(idGuiaEstaGuia);


              if (tieneCoordsValidas && 
                  !idsGuiasYaEnModal.has(guia._id) && 
                  !estaEnOtraRuta
              ) {
                  guiasParaElModal.push(guia);
                  // idsGuiasYaEnModal.add(guia._id); // No es necesario agregar a idsGuiasYaEnModal aquí, ya que solo previene duplicados de la primera carga.
              } else {
                  if (tieneCoordsValidas && !idsGuiasYaEnModal.has(guia._id) && estaEnOtraRuta) {
                      console.log(`[Editar OnClick] Guía ${guia.nro_guia} (${guia._id}) de guiasFiltradasActuales FUE EXCLUIDA porque su NROGUIA (${nroGuiaNormalizadoEstaGuia}) o ID (${idGuiaEstaGuia}) está en identificadoresEnOtrasRutas.`);
                  }
              }
          });
          
          console.log("[Editar Ruta OnClick] Guías totales FINALES para el modal (NroGuias):", guiasParaElModal.map(g=>g.nro_guia));
          console.log("[Editar Ruta OnClick] Total de guías FINALES para el modal:", guiasParaElModal.length);

          Swal.close();

          if (guiasParaElModal.length === 0 && guiasCompletasOrdenadas.length > 0 && guiasCompletasOrdenadas.every(g => { const la = Number(g.lat), lo = Number(g.lon); return !(g.lat != null && g.lon != null && String(g.lat).trim() !== "" && String(g.lon).trim() !== "" && !isNaN(la) && !isNaN(lo))}) ){
               Swal.fire('Información', 'Las guías de la ruta actual no tienen coordenadas válidas y no hay otras guías disponibles para agregar.', 'info');
               return;
          } else if (guiasParaElModal.length === 0){
               Swal.fire('Información', 'No hay guías disponibles (con coordenadas válidas y no asignadas a otras rutas) para añadir o modificar en esta ruta.', 'info');
               return;
          }

          abrirModalParaEditarRutaGuardada(guiasParaElModal, guiasCompletasOrdenadas);
          
          const guardarSection = document.getElementById("guardarRutaSection");
          if(guardarSection) guardarSection.style.display = "block";

      } catch (error) {
          Swal.close();
          console.error("Error al preparar guías para editar ruta:", error);
          Swal.fire('Error de Preparación', 'No se pudieron preparar las guías para la edición.', 'error');
      }
  };
  listado.appendChild(btnEditarGuiasRuta);

} else if (esrutaprevia === false) {
  const btnDividirRutas = document.createElement('button');
  btnDividirRutas.className = 'btn btn-dark mr-2';
  btnDividirRutas.innerText = 'Optimizar y Ver Mapa';
  btnDividirRutas.onclick = function () {
      // guiasParaMostrar es una referencia a guiasFiltradasPorRutaYFecha, que es guiasFiltradas
      // que a su vez es guiasFiltradasActuales.
      if (typeof abrirModalSeleccionGuias === "function") {
          abrirModalSeleccionGuias(guiasParaMostrar); 
      } else {
          console.error("La función abrirModalSeleccionGuias no está definida.");
      }
      const guardarSection = document.getElementById("guardarRutaSection");
      if (guardarSection) guardarSection.style.display = "block";
  };
  listado.appendChild(btnDividirRutas);
}








  const btnExportar = document.createElement('button');
  btnExportar.className = 'btn btn-success mr-2';
  btnExportar.innerText = 'Exportar a PDF';
  btnExportar.onclick = function () { exportToPDF(guiasParaMostrar); };
  listado.appendChild(btnExportar);

  const btnExportarE = document.createElement('button');
  btnExportarE.className = 'btn btn-primary mr-2'; // Añadido margen
  btnExportarE.innerText = 'Exportar a Excel';
  btnExportarE.onclick = function () {
      exportToExcel(guiasFiltradasPorRutaYFecha);
  };
  listado.appendChild(btnExportarE);

  const btnExportarCircuit = document.createElement('button');
  btnExportarCircuit.className = 'btn btn-warning mr-2'; // Añadido margen
  btnExportarCircuit.innerText = 'Exportar a Excel para Circuit';
  btnExportarCircuit.onclick = function () {
      exportToExcel_circuit(guiasFiltradasPorRutaYFecha);
  };
  listado.appendChild(btnExportarCircuit);

  const btnImprimirGuias = document.createElement('button');
  btnImprimirGuias.className = 'btn btn-info mr-2'; // Cambiado color y añadido margen
  btnImprimirGuias.innerText = 'Imprimir todas las guías';
  btnImprimirGuias.onclick = function () {
      imprimir_todas_guias(guiasFiltradasPorRutaYFecha);
  };
  listado.appendChild(btnImprimirGuias);

  const btnNotificarVisita = document.createElement('button');
  btnNotificarVisita.className = 'btn btn-secondary mr-2'; // Cambiado color y añadido margen
  btnNotificarVisita.innerText = 'Notificar Visita a Clientes';
  btnNotificarVisita.onclick = function () {
      window.guiasParaNotificar = guiasFiltradasPorRutaYFecha;
      llenarSelectChoferes(); // Asegúrate que llenarSelectChoferes esté definida
      $("#modalNotificacionVisita").modal("show");
  };
  listado.appendChild(btnNotificarVisita);

  const btnasigna_chofer = document.createElement('button');
  btnasigna_chofer.className = 'btn my-button-cyan'; 
  btnasigna_chofer.innerText = 'Asignar Chofer';
  btnasigna_chofer.onclick = function () {
      const infoDropElement = document.getElementById('info_drop');
      if (infoDropElement) {
          infoDropElement.style.display = (infoDropElement.style.display === 'none' || !infoDropElement.style.display) ? 'block' : 'none';
      } else {
          console.error("El elemento con ID 'info_drop' no fue encontrado en el DOM.");
      }
  };
  listado.appendChild(btnasigna_chofer);

  $('#mapaContainer').hide(); // Ocultar el mapa principal inicialmente
  if (typeof llenarSelectChoferParaGuardar2 === "function") llenarSelectChoferParaGuardar2();
  // $('#guardarRutaSection').hide(); // Se maneja según esrutaprevia o al abrir modal
}


async function manejarQuitarGuia(guiaId, nroGuia) {
  const confirmacion = await Swal.fire({
      title: '¿Quitar Guía?',
      html: `¿Deseas quitar la guía <strong>${nroGuia}</strong> de la lista actual?` +
            (esrutaprevia ? "<br><br>Si esta es una ruta guardada, tendrás la opción de <strong>actualizarla en la base de datos</strong>." : ""),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
  });

  if (!confirmacion.isConfirmed) {
      return;
  }

  let listaGuiasActualizada;
  let seModificoRutaGuardada = false;
  // Obtener los valores de los filtros principales en caso de que los necesitemos más tarde
  let nombreRutaBaseParaRecarga = $("#kt_datatable_search_type_geo option:selected").text();
  let fechaDesdeParaRecarga = $("#kt_datetimepicker_1").val();
  let fechaHastaParaRecarga = $("#kt_datetimepicker_1_2").val();
  let idRutaBaseParaRecarga = $("#kt_datatable_search_type_geo").val();


  if (esrutaprevia && guiasCompletasOrdenadas && typeof id_Ruta_predefinida !== 'undefined' && id_Ruta_predefinida) {
      const indice = guiasCompletasOrdenadas.findIndex(g => g._id === guiaId || (g.nro_guia === nroGuia && !guiaId));
      if (indice > -1) {
          guiasCompletasOrdenadas.splice(indice, 1);
          listaGuiasActualizada = [...guiasCompletasOrdenadas];
          seModificoRutaGuardada = true;
          console.log(`Guía ${nroGuia} quitada de 'guiasCompletasOrdenadas'. Restantes: ${listaGuiasActualizada.length}`);
          const rutaInfo = rutasGuardadas.find(r => r._id === id_Ruta_predefinida);
          if (rutaInfo) { // Actualizar los valores para mostrarListadoGuias si la ruta sigue existiendo
              nombreRutaBaseParaRecarga = rutaInfo.routeID?.Rutas || nombreRutaBaseParaRecarga;
              fechaDesdeParaRecarga = rutaInfo.fecha || fechaDesdeParaRecarga;
              fechaHastaParaRecarga = rutaInfo.fecha || fechaHastaParaRecarga;
              idRutaBaseParaRecarga = rutaInfo.routeID?._id || rutaInfo.routeID || idRutaBaseParaRecarga; // Si routeID es objeto o string
          }
      } else {
          console.warn(`No se encontró la guía ${nroGuia} en 'guiasCompletasOrdenadas' para quitar.`);
          Swal.fire('Error', 'No se encontró la guía especificada en la lista de la ruta guardada.', 'error');
          return;
      }
  } else if (!esrutaprevia && guiasFiltradasActuales) {
      const indice = guiasFiltradasActuales.findIndex(g => g._id === guiaId || (g.nro_guia === nroGuia && !guiaId));
      if (indice > -1) {
          guiasFiltradasActuales.splice(indice, 1);
          listaGuiasActualizada = [...guiasFiltradasActuales];
          console.log(`Guía ${nroGuia} quitada de 'guiasFiltradasActuales'. Restantes: ${listaGuiasActualizada.length}`);
      } else {
          console.warn(`No se encontró la guía ${nroGuia} en 'guiasFiltradasActuales' para quitar.`);
          Swal.fire('Error', 'No se encontró la guía especificada en la lista filtrada.', 'error');
          return;
      }
  } else {
      Swal.fire('Error Interno', 'No se pudo determinar la lista de guías a modificar.', 'error');
      return;
  }

  if (seModificoRutaGuardada) {
      const recalcularConfirm = await Swal.fire({
          title: 'Ruta Guardada Modificada',
          text: 'La guía ha sido quitada. ¿Deseas recalcular la ruta y actualizarla en la base de datos?',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Sí, recalcular y guardar',
          cancelButtonText: 'No, solo quitar de vista'
      });

      if (recalcularConfirm.isConfirmed) {
          if (listaGuiasActualizada.length < 1 && puntoPartida && puntoLlegada) {
              const deleteRouteConfirm = await Swal.fire({
                  title: 'Ruta Guardada Vacía',
                  text: 'Has quitado todas las guías intermedias. ¿Deseas eliminar esta ruta guardada de la base de datos por completo?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, eliminar ruta guardada',
                  cancelButtonText: 'No, mantener (no se guardarán cambios)',
                  confirmButtonColor: '#d33'
              });
              if (deleteRouteConfirm.isConfirmed) {
                  try {
                      const responseDel = await fetch('/api/eliminar_ruta_previa', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id_Ruta_predefinida: id_Ruta_predefinida })
                      });
                      const resultDel = await responseDel.json();
                      if (resultDel.success) {
                          Swal.fire('Eliminada la Guia de la', resultDel.message, 'success').then(() => {
                              // *** INICIO DE LA MODIFICACIÓN PARA REDIRIGIR ***
                              // Usamos los valores de los filtros que estaban activos o los de la rutaInfo
                             
                             
                                 const params = new URLSearchParams({
                                      ruta: idRutaBaseParaRecarga, // ID de la ruta base (tipo de ruta)
                                      desde: fechaDesdeParaRecarga,
                                      hasta: fechaHastaParaRecarga
                                  });
                                  // Asumiendo que '/lista_rutas_list/' es la página correcta.
                                  // Si tu página actual ya es '/lista_rutas_list/', puedes omitir el path.
                                  const newUrl = `/lista_rutas_list/?${params.toString()}`;
                                  console.log("Redirigiendo a:", newUrl);
                                  window.location.href = newUrl;
                             
                              // *** FIN DE LA MODIFICACIÓN PARA REDIRIGIR ***
                          });
                      } else {
                          Swal.fire('Error', resultDel.message || 'No se pudo eliminar la ruta.', 'error');
                      }
                  } catch (error) {
                      Swal.fire('Error de Conexión', 'Error al conectar con el servidor para eliminar ruta.', 'error');
                  }
              } else { // El usuario decidió no eliminar la ruta vacía
                  mostrarListadoGuias(listaGuiasActualizada, fechaDesdeParaRecarga, fechaHastaParaRecarga, nombreRutaBaseParaRecarga);
              }
              return;
          }

          if (!puntoPartida || !puntoLlegada) {
              Swal.fire('Error de Configuración', 'Punto de partida o llegada no definido. Verifica la configuración de direcciones.', 'error');
              return;
          }
          const puntosParaOptimizarBackend = [
            puntoPartida,
            ...listaGuiasActualizada.map(g => ({
                _id: g._id,
                coordenadas: { lat: Number(g.lat), lng: Number(g.lon) },
                nro_guia: g.nro_guia,
                tipo_contenido: g.tipo_contenido,
                visitado: false,
                celular: g.celular_remite,
                direccion_remite: g.direccion_recogida && g.direccion_recogida.trim() !== ''
                    ? g.direccion_recogida
                    : (g.direccion_remite || ''),
                nom_cliente_remite: g.nom_cliente_remite
            })),
            puntoLlegada
        ];
        

          Swal.fire({ title: 'Recalculando Ruta...', imageUrl: '/assets/media/spinner.gif', imageWidth: 80, imageHeight: 80, allowOutsideClick: false, showConfirmButton: false, didOpen: () => { Swal.showLoading(); } });

         // Esto es dentro del try {} catch {} de la sección if (recalcularConfirm.isConfirmed)
// en tu función manejarQuitarGuia

try {
  const responseOpt = await fetch('/optimizar-ruta-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puntos: puntosParaOptimizarBackend })
  });
  const resultadoBackend = await responseOpt.json();
  Swal.close(); // Cierra el Swal de "Recalculando Ruta..."

  if (!responseOpt.ok || !resultadoBackend.success) {
      throw new Error(resultadoBackend.message || `Error del servidor (${responseOpt.status}) al optimizar`);
  }

  rutaOptimizadaActual = resultadoBackend.data; 
  
  // 1. Actualiza la lista de guías en la vista principal (esto es bueno para feedback inmediato)
      mostrarListadoGuias(listaGuiasActualizada, fechaDesdeParaRecarga, fechaHastaParaRecarga, nombreRutaBaseParaRecarga);
  
        // 2. Guarda la ruta adaptada. Esta función ahora debe devolver una promesa.
        //    Mostrará su propio Swal de éxito/error para la operación de guardado.
        await funcionGuardarRutaOptimizadaAdaptada(id_Ruta_predefinida); 
        console.log("Ruta guardada/actualizada exitosamente.");

        
        setTimeout(() => {
            const params = new URLSearchParams({
                ruta: idRutaBaseParaRecarga, // ID de la ruta base (tipo de ruta general)
                desde: fechaDesdeParaRecarga,
                hasta: fechaHastaParaRecarga
            });
      
     
      const newUrl = `/lista_rutas_list/?${params.toString()}`; 

      console.log("Redirigiendo a:", newUrl);
      window.location.href = newUrl;
          }, 2100); // Ajusta este tiempo (ej. 2100ms es un poco más que el timer del Swal de guardado)

         

        } catch (error) {
          Swal.close(); // Asegúrate de cerrar cualquier Swal de "cargando"
          console.error("Error al recalcular y guardar la ruta:", error);
          Swal.fire('Error en Proceso', `No se pudo actualizar la ruta guardada: ${error.message}`, 'error');
        }
      } else { // El usuario decidió no recalcular y guardar, solo quitar de la vista
          mostrarListadoGuias(listaGuiasActualizada, fechaDesdeParaRecarga, fechaHastaParaRecarga, nombreRutaBaseParaRecarga);
          Swal.fire('Cancelado', 'La ruta guardada no fue modificada en la base de datos.', 'info');
      }
  } else { // Se quitó de una lista filtrada normal (no era ruta previa)
      mostrarListadoGuias(listaGuiasActualizada, fechaDesdeParaRecarga, fechaHastaParaRecarga, nombreRutaBaseParaRecarga);
      Swal.fire('Guía Quitada', 'La guía ha sido quitada de la lista actual (no se han guardado cambios en el servidor).', 'success');
  }
}


/**
 * Abre el modal de selección de guías, mostrando todas las guías disponibles
 * y preseleccionando aquellas que pertenecen a la ruta guardada actual que se está editando.
/**
 * Abre el modal de selección de guías para EDITAR una ruta guardada existente.
 * Muestra todas las guías disponibles del filtro general, preselecciona las de la ruta actual,
 * y EXCLUYE las guías que ya están asignadas a OTRAS rutas guardadas.
 * @param {Array<Object>} guiasAMostrarEnModal - Array de guías que deben aparecer en el modal (ya pre-filtradas).
 * @param {Array<Object>} guiasDeLaRutaQueSeEdita - Array de las guías que ya están en la ruta guardada que se está editando (para pre-selección).
 */
function abrirModalParaEditarRutaGuardada(guiasAMostrarEnModal, guiasDeLaRutaQueSeEdita) {
  console.log("[abrirModalParaEditarRutaGuardada] Iniciando...");
  console.log("[abrirModalParaEditarRutaGuardada] Guías A MOSTRAR en modal (pre-filtradas, primeras 5):", guiasAMostrarEnModal.slice(0,5));
  console.log("[abrirModalParaEditarRutaGuardada] Guías EN RUTA ACTUAL a editar (para preselección, primeras 5):", guiasDeLaRutaQueSeEdita.slice(0,5));

  const container = document.getElementById('tablaSeleccionGuiasContainer');
  if (!container) {
      console.error("[abrirModalParaEditarRutaGuardada] Error: Contenedor 'tablaSeleccionGuiasContainer' no encontrado.");
      Swal.fire('Error de Interfaz', 'No se encontró el contenedor para la lista de guías.', 'error');
      return;
  }
  container.innerHTML = ''; // Limpiar contenido previo

  if (!guiasAMostrarEnModal || !Array.isArray(guiasAMostrarEnModal)) {
      console.warn("[abrirModalParaEditarRutaGuardada] 'guiasAMostrarEnModal' no es un array válido.");
      guiasAMostrarEnModal = [];
  }
  if (!guiasDeLaRutaQueSeEdita || !Array.isArray(guiasDeLaRutaQueSeEdita)) {
      console.warn("[abrirModalParaEditarRutaGuardada] 'guiasDeLaRutaQueSeEdita' no es un array válido.");
      guiasDeLaRutaQueSeEdita = [];
  }

  if (guiasAMostrarEnModal.length === 0) {
      // Esto podría significar que la ruta actual no tiene guías (o no válidas) Y no hay guías disponibles para añadir.
      let mensajeAlerta = "No hay guías disponibles con coordenadas válidas para mostrar en esta lista.";
      if (guiasDeLaRutaQueSeEdita.length > 0 && guiasAMostrarEnModal.filter(g => guiasDeLaRutaQueSeEdita.find(gActual => gActual._id === g._id)).length === 0) {
          // Hay guías en la ruta actual, pero ninguna tiene coordenadas válidas para mostrarse aquí
          mensajeAlerta = "Las guías de la ruta actual no tienen coordenadas válidas o no hay otras guías disponibles para agregar.";
      } else if (guiasDeLaRutaQueSeEdita.length === 0) {
           mensajeAlerta = "No hay guías en la ruta actual y no hay otras guías disponibles con coordenadas válidas para agregar.";
      }
      container.innerHTML = `<div class="alert alert-info mt-3" role="alert">${mensajeAlerta}</div>`;
      $('#modalSeleccionarGuias').modal('show');
      return;
  }

  // Crear un Set de IDs de las guías que ya están en la ruta actual para una búsqueda eficiente durante la pre-selección
  const idsGuiasEnRutaActual = new Set(
      guiasDeLaRutaQueSeEdita.filter(g => g && typeof g._id !== 'undefined').map(g => g._id)
  );
  console.log("[abrirModalParaEditarRutaGuardada] IDs para pre-seleccionar (de ruta actual que se edita):", Array.from(idsGuiasEnRutaActual));

  const table = document.createElement('table');
  table.className = 'table table-sm table-hover table-bordered';
  table.innerHTML = `
      <thead class="thead-light">
          <tr>
              <th style="width: 5%;"><input type="checkbox" id="selectAllGuiasCheckbox" title="Seleccionar/Deseleccionar todas las visibles" style="transform: scale(1.2);"></th>
              <th style="width: 5%;">#</th>
              <th style="width: 15%;">Guía Nro</th>
              <th style="width: 25%;">Cliente</th>
              <th style="width: 35%;">Dirección</th>
              <th style="width: 15%;">Ciudad</th>
          </tr>
      </thead>
      <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  let contadorFilas = 0;

  // Iterar sobre 'guiasAMostrarEnModal', que ya es la lista pre-filtrada
  // (contiene las guías de la ruta actual + las "libres" con coordenadas válidas)
  guiasAMostrarEnModal.forEach((guia) => {
      if (!guia || typeof guia._id === 'undefined') {
          console.warn("[abrirModalParaEditarRutaGuardada] Guía inválida o sin _id en 'guiasAMostrarEnModal'.", guia);
          return; // Saltar esta guía si es inválida
      }

      // Se asume que guiasAMostrarEnModal ya solo contiene guías con coordenadas válidas
      // porque el filtrado se hizo antes de llamar a esta función.
      contadorFilas++;
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';

      const tdCheckbox = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'guia-checkbox';
      checkbox.value = guia._id;
      checkbox.style.transform = 'scale(1.2)';

      // Pre-seleccionar el checkbox si la guía está en la ruta actual que se edita
      if (idsGuiasEnRutaActual.has(guia._id)) {
          checkbox.checked = true;
          tr.classList.add('table-info'); // Resaltar visualmente
      }

      tdCheckbox.appendChild(checkbox);
      tdCheckbox.addEventListener('click', (e) => e.stopPropagation());
      checkbox.addEventListener('change', () => {
          if (typeof actualizarContadorSeleccionados === "function") actualizarContadorSeleccionados();
          tr.classList.toggle('table-info', checkbox.checked);
      });

      const tdIndex = document.createElement('td'); tdIndex.textContent = contadorFilas;
      const tdGuiaNum = document.createElement('td'); tdGuiaNum.textContent = guia.nro_guia || 'N/D';
      const tdCliente = document.createElement('td'); tdCliente.textContent = guia.nom_cliente_remite || 'N/D';
      const direccion = guia.direccion_recogida && guia.direccion_recogida.trim() !== ''
      ? guia.direccion_recogida
      : (guia.direccion_remite || 'N/D');
  
          const tdDireccion = document.createElement('td');
          tdDireccion.textContent = direccion;
          tdDireccion.title = direccion;
      const tdCiudad = document.createElement('td'); tdCiudad.textContent = (guia.ciudad_remite && guia.ciudad_remite[0] && guia.ciudad_remite[0].name) || 'N/D';

      tr.appendChild(tdCheckbox);
      tr.appendChild(tdIndex);
      tr.appendChild(tdGuiaNum);
      tr.appendChild(tdCliente);
      tr.appendChild(tdDireccion);
      tr.appendChild(tdCiudad);

      tr.addEventListener('click', () => {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
      });
      tbody.appendChild(tr);
  });

  container.appendChild(table);

  // Este mensaje ahora sería menos común si el filtrado previo es efectivo.
  if (contadorFilas === 0) {
      container.innerHTML = '<div class="alert alert-warning mt-3" role="alert">No hay guías válidas para mostrar o agregar a esta ruta. Verifique los filtros o si las guías tienen coordenadas.</div>';
  }

  const selectAllCheckbox = document.getElementById('selectAllGuiasCheckbox');
  if (selectAllCheckbox) {
      selectAllCheckbox.onchange = function(e) {
          container.querySelectorAll('.guia-checkbox').forEach(cb => {
              const fila = cb.closest('tr');
              if (fila && fila.style.display !== 'none') { 
                  if (cb.checked !== e.target.checked) {
                      cb.checked = e.target.checked;
                      cb.dispatchEvent(new Event('change'));
                  }
              }
          });
      };
  }

  if (typeof actualizarContadorSeleccionados === "function") {
      actualizarContadorSeleccionados(); // Llamada inicial para el contador y estado de "Select All"
  }

  $('#btnConfirmarSeleccionGuias').off('click').on('click', function() {
      console.log("[abrirModalParaEditarRutaGuardada] Botón Confirmar Selección presionado.");
      // 'guiasAMostrarEnModal' es la lista completa de guías que se presentaron en el modal.
      // confirmarSeleccionYOptimizar tomará esta lista y filtrará internamente las que estén marcadas.
      
      console.log('usuario guia', usuario_chofer)
      document.getElementById('selectChoferParaGuardar2').value = usuario_chofer 
      confirmarSeleccionYOptimizar(guiasAMostrarEnModal);
  });

  if (typeof configurarBusquedaEnTiempoReal === "function") {
       setTimeout(configurarBusquedaEnTiempoReal, 150);
  }

  $('#modalSeleccionarGuias').modal('show');
  console.log("[abrirModalParaEditarRutaGuardada] Modal mostrado con", contadorFilas, "filas.");
}



async function funcionGuardarRutaOptimizadaAdaptada(idDeRutaParaActualizar = null) {
  console.log("Iniciando guardado/actualización de ruta optimizada...");
  if (idDeRutaParaActualizar) {
      console.log("Modo: Actualizar ruta con ID:", idDeRutaParaActualizar);
  } else {
      console.log("Modo: Guardar nueva ruta");
  }

  const selectChofer = document.getElementById('selectChoferParaGuardar');
  let choferIdSeleccionado;

  if (selectChofer && selectChofer.value) {
      choferIdSeleccionado = selectChofer.value;
  } else if (idDeRutaParaActualizar && rutasGuardadas) { // Si estamos actualizando, intentar obtener el chofer de la ruta guardada
      const rutaExistente = rutasGuardadas.find(r => r._id === idDeRutaParaActualizar);
      if (rutaExistente && rutaExistente.idUsuario && rutaExistente.idUsuario._id) {
          choferIdSeleccionado = rutaExistente.idUsuario._id;
          console.log("Usando chofer existente de la ruta guardada:", choferIdSeleccionado);
      } else if (rutaExistente && rutaExistente.idUsuario && typeof rutaExistente.idUsuario === 'string') { // Si idUsuario es solo un ID
          choferIdSeleccionado = rutaExistente.idUsuario;
           console.log("Usando chofer (ID string) existente de la ruta guardada:", choferIdSeleccionado);
      }
  }
  
  if (!choferIdSeleccionado) {
       Swal.fire('Falta Chofer', 'No se pudo determinar el chofer. Por favor, selecciona uno si el campo está disponible o asegúrate de que la ruta guardada tenga uno asignado.', 'warning');
       return Promise.reject('Falta Chofer'); // Devolver una promesa rechazada
  }

  // Obtener rutaBaseId y fechaDesde. Si es una actualización, podrían venir de la ruta existente.
  let rutaBaseIdOriginal;
  let fechaDeLaRuta;

  if (idDeRutaParaActualizar && rutasGuardadas) {
      const rutaExistente = rutasGuardadas.find(r => r._id === idDeRutaParaActualizar);
      if (rutaExistente) {
          rutaBaseIdOriginal = rutaExistente.routeID?._id || rutaExistente.routeID; // Si routeID es objeto o solo ID
          fechaDeLaRuta = rutaExistente.fecha;
      }
  }
  // Fallback a los valores del formulario si no se encontraron en la ruta existente o si es una nueva ruta
  rutaBaseIdOriginal = rutaBaseIdOriginal || $("#kt_datatable_search_type_geo").val();
  fechaDeLaRuta = fechaDeLaRuta || $("#kt_datetimepicker_1").val();


  if (!rutaBaseIdOriginal) {
      Swal.fire('Falta Ruta Base', 'No se pudo identificar la ruta original seleccionada.', 'warning');
      return Promise.reject('Falta Ruta Base');
  }
  if (!fechaDeLaRuta) {
      Swal.fire('Falta Fecha', 'No se pudo obtener la fecha de la ruta.', 'warning');
      return Promise.reject('Falta Fecha');
  }

  if (!rutaOptimizadaActual || !Array.isArray(rutaOptimizadaActual.optimizedRoutePoints) || rutaOptimizadaActual.optimizedRoutePoints.length === 0 ||
      !Array.isArray(rutaOptimizadaActual.decodedCoords) || !Array.isArray(rutaOptimizadaActual.instructions)) {
      Swal.fire('Error de Datos', 'Faltan datos de la ruta optimizada (puntos, coordenadas o instrucciones). Vuelve a calcular la ruta.', 'error');
      return Promise.reject('Error de Datos en rutaOptimizadaActual');
  }

  const payload = {
      idUsuario: choferIdSeleccionado,
      fecha: fechaDeLaRuta,
      routeID: rutaBaseIdOriginal,
      puntos: rutaOptimizadaActual.optimizedRoutePoints.map((punto, index) => ({
        posicion: index,
        idGuia: (punto.nro_guia !== 'Punto de Partida' && punto.nro_guia !== 'Punto de Llegada') ? punto._id : null,
        nroGuia: punto.nro_guia || `Punto ${index}`,
        lat: punto.coordenadas?.lat,
        lng: punto.coordenadas?.lng,
        visitado: false ,
        celular: punto.celular,
        telefono:punto.telefono,
        nom_cliente_remite: punto.nom_cliente_remite,
        direccion:
            (punto.direccion_recogida && punto.direccion_recogida.trim() !== '')
                ? punto.direccion_recogida
                : (punto.direccion_remite || punto.direccion || 'N/D'),
    })),
    
      rutaCoords: rutaOptimizadaActual.decodedCoords,
      directions: rutaOptimizadaActual.instructions,
      timestamp: new Date().toISOString(),
      // Datos adicionales de la optimización (opcional, pero útil)
      distanciaMetros: rutaOptimizadaActual.totalDistance,
      duracionSegundos: rutaOptimizadaActual.totalDuration
  };

  if (idDeRutaParaActualizar) {
      payload._id = idDeRutaParaActualizar;
  }

  console.log("Payload a enviar a /api/guardar_ruta_previa:", JSON.stringify(payload, null, 2));

  Swal.fire({ title: 'Guardando Ruta...', text: 'Enviando ruta al servidor.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

  try {
      const response = await fetch('/api/guardar_ruta_previa', {
          method: 'POST', // El backend debe manejar POST para crear o actualizar si _id está presente
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      const responseText = await response.text(); // Obtener texto para depuración
      let result;
      try {
          result = JSON.parse(responseText); // Intentar parsear como JSON
      } catch (e) {
          console.error("Respuesta del servidor no es JSON válido:", responseText);
          Swal.close();
          Swal.fire('Error de Respuesta', 'El servidor envió una respuesta inesperada.', 'error');
          return Promise.reject('Respuesta no JSON');
      }

      Swal.close();
      return Promise.resolve(result);
      // Adaptar la condición de éxito según la estructura real de 'result'
      // La función original tenía: if (result.ok) { ... }
      // Pero 'result' es el JSON parseado. 'response.ok' es el booleano del status HTTP.
     
  } catch (error) {
      Swal.close();
      console.error('Error en fetch al guardar/actualizar ruta:', error);
      Swal.fire({
          icon: 'error',
          title: 'Error de Comunicación',
          text: `No se pudo ${idDeRutaParaActualizar ? 'actualizar' : 'guardar'} la ruta. ${error.message || 'Verifica la conexión.'}`,
      });
      return Promise.reject(error.message || 'Error de comunicación');
  }
}




  function mostrarRutaEnMapa(directionsResult) {
    if (!mapaGoogle || !directionsRenderer) {
        console.error("El mapa o el DirectionsRenderer no están inicializados.");
        // Intentar inicializar de nuevo si es posible
         if (!mapaGoogle) initMap();
         else if (!directionsRenderer) {
            directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(mapaGoogle);
         } else {
             return; // No se puede hacer nada más
         }
    }
    // Limpiar ruta anterior (importante si se optimiza varias veces)
    // directionsRenderer.setDirections({ routes: [] }); // Comentado si prefieres no limpiar

    // Mostrar la nueva ruta
    directionsRenderer.setDirections(directionsResult);

    // Mostrar el contenedor del mapa (por si estaba oculto)
    $('#mapaContainer').show();

     // Ajustar el zoom y centro del mapa para que se vea toda la ruta
     if (directionsResult.routes && directionsResult.routes[0] && directionsResult.routes[0].bounds) {
        mapaGoogle.fitBounds(directionsResult.routes[0].bounds);
     }
}

    
    // Exportar a Excel para Circuit
    document.getElementById('btnEnviarNotificacion').addEventListener('click', function () {
      const fecha = document.getElementById('fechaVisita').value;
      const selectChoferEl = document.getElementById('selectChofer');
      const choferIndex = selectChoferEl.value;
    
      if (!fecha) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha requerida',
          text: 'Por favor, seleccione la fecha de visita.',
        });
        return;
      }
    
      if (choferIndex === "") {
        Swal.fire({
          icon: 'warning',
          title: 'Chofer requerido',
          text: 'Por favor, seleccione un chofer.',
        });
        return;
      }
    
      const choferSeleccionado = choferes[choferIndex]; // { nombre, telefono }
    
      // Construir la data para enviar
      const payload = {
        info_clientes: window.guiasParaNotificar.map(g => ({
          telefono: g.celular_remite || g.telefono_remite || '',
          nombre: g.nom_cliente_remite || '',
          guia: g.nro_guia || ''
        })),
        nombre_chofer: choferSeleccionado.nombre,
        telefono_chofer: choferSeleccionado.usuario.celular,
        dia_visita: fecha
      };
    
      fetch('/enviar-mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Los mensajes están siendo enviados.',
              timer: 3000,
              showConfirmButton: false
            }).then(() => {
              // Cerrar el modal tras la notificación
              $("#modalNotificacionVisita").modal("hide");
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un problema al intentar enviar los mensajes.',
            });
          }
        })
        .catch(error => {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error inesperado',
            text: 'Ocurrió un error al procesar la solicitud.',
          });
        });
    });
    
    $("#btn_cerrar_notificacion").on("click",function() {
    
      $("#modalNotificacionVisita").modal("hide");

    })  

   
function exportToExcel_circuit(guias) {
    // Crear array de objetos, cada objeto representa una fila en el Excel
    const pasar_excel_array = guias.map(guia => ({
     "Address line 1": guia.direccion_recogida?.trim() || guia.direccion_remite || "",      // Dirección principal
      "Address line 2": "",                                // Opcional, vacío
      "City": guia.ciudad_remite?.[0]?.name || "",         // Ciudad
      "State": guia.estado_remite?.[0]?.name || "",        // Estado
      "Zip": guia.zip_remite || "",                        // Código postal
      "Country": guia.pais_remite?.[0]?.name || "",        // País
      "Latitude": guia.lat || null,                        // Coordenada de latitud
      "Longitude": guia.lon || null,                       // Coordenada de longitud
      "Earliest Time": "",
      "Latest Time": "",
      "Time At Stop": "",
      "Notes": guia.nro_guia || "",                        // Insertar nro_guia a modo de nota
      "Type": "",
      "Order": guia.nro_guia || "",                        // Orden también con nro_guia
      "Proof of delivery": "",
      "Package Size": "",
      "Recipient Email Address": "",
      "Recipient Phone Number": "",
      "Tracking Visibility": "",
      "Recipient Name": "",
      "External ID": "",
      "Order Count": "",
      "Package Count": "",
      "Products": "",
      "Seller Order ID": "",
      "Seller Name": "",
      "Seller Website": "",
      "Address/Company Name": "",
      "Circuit Client ID": ""
    }));
  
    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(pasar_excel_array);
  
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guías");
  
    // Exportar a archivo Excel
    XLSX.writeFile(workbook, 'guias.xlsx');
  }
  
  function exportToPDF(data) {
    // Obtener el texto seleccionado de los selectores (Ruta y Fecha)
    const rutaSelect = document.getElementById('kt_datatable_search_type_geo');
    const ruta_text = rutaSelect.options[rutaSelect.selectedIndex]?.text || '';
  
    const agencia_Select = document.getElementById('kt_datetimepicker_1').value + ' al ' +  document.getElementById('kt_datetimepicker_1_2').value;  
    
    const agencia_text = agencia_Select;
  


    let chofer = usuario_chofer
    
    if(chofer ==="" && usuario_nivel===3){
      chofer = buscarConductorPorRuta(ruta_text, choferes)
    }
    console.log(chofer)
    // Importar jsPDF desde la ventana global (si ya está incluida la librería)
    const { jsPDF } = window.jspdf;
  
    // Crear un nuevo documento PDF
    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' = landscape (horizontal)
  
    // Agregar un encabezado en la parte superior
    doc.setFontSize(18);
    doc.text('Paquetes por Recoger por Ruta', 14, 22);  // Texto en posición (x=14, y=22)
  
    // Agregar un subtítulo debajo del encabezado
    doc.setFontSize(12);
    doc.text('Lista Guías Por Recoger', 14, 30);
    doc.setFontSize(10);
    doc.text('Pendientes Retirada', 14, 34);
    doc.text(`Ruta: ${ruta_text}`, 100, 30);
    doc.text(`Chofer: ${chofer}`, 100, 34);

    doc.text(`Fecha: ${agencia_text}`, 100, 26);

    doc.setFontSize(8);       
  
    const head = [
      ['N°', 'Tipo',  'Guía', 'Caja', 'Cliente', 'Teléfono', 'Monto', 'Dirección', 'Ciudad - Estado', 'Seguimientos']
    ];
    
    const filteredData = data;
    const body = filteredData.map((row, index) => {
      // Construir medidas de cada caja
      let medidas = '';
      if (Array.isArray(row.detallesGuia)) {
        medidas = row.detallesGuia.map(detallesCaja => {
          return `${detallesCaja.alto  || ''}x${detallesCaja.ancho  || ''}x${detallesCaja.largo || ''}`;
        }).join('\n'); // salto de línea entre medidas
      }
    
      return [
        index + 1,
        row.tipo_contenido,
        row.nro_guia,
        medidas,
        row.nom_cliente_remite,
        '  +' + (row.celular_remite || '') + ' / +' + (row.telefono_remite || ''),
        `$${Number(parseFloat(row.total_fac || 0))
          .toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
        // Aquí la lógica para la dirección
        (row.direccion_recogida?.trim() || row.direccion_remite || '') + ', Zip:' + (row.zip_remite || ''),
        `${row.ciudad_remite?.[0]?.name || ''} - ${row.estado_remite?.[0]?.name || ''}`,
        Array.isArray(row.seguimientoEspecial)
          ? row.seguimientoEspecial.map(seg => seg.observacion || '').join(' - ')
          : row.seguimientoEspecial?.observacion || ''
    ];
    
    });
  
    // Ajustar la posición de la tabla para no sobreponerla con el encabezado
   
    doc.autoTable({
      startY: 40,
      head: head,
      body: body,
      styles: {
        fontSize: 8
      },
      // Ajustes clave:
      margin: { left: 15, right: 15 }, // Márgenes izquierdo y derecho
      tableWidth: 267, // 297mm (ancho A4 landscape) - 15mm (izq) - 15mm (der) = 267mm
      columnStyles: {
        0: { cellWidth: 10 }, // Ancho de cada columna (ajusta según necesidad)
        1: { cellWidth: 15 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 40 },
        8: { cellWidth: 20 },
        9: { cellWidth: 60 },
       
      }
    });
  
    // Calcular el total de guías
    const totalGuias = filteredData.length;
  
    // Calcular la sumatoria de los montos
    const totalMonto = filteredData.reduce(
      (sum, row) => sum + parseFloat(row.total_fac || 0), 
      0
    );
  
    // Agregar un resumen al final del documento
    const finalY = doc.lastAutoTable.finalY || 40; // Obtener la posición Y después de la tabla
    doc.setFontSize(10);
    doc.text(`Total de Guías: ${totalGuias}`, 14, finalY + 10);
    doc.text(
      `Total Monto: $${totalMonto.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 
      14, 
      finalY + 16
    );
  
    // Mostrar el PDF en una nueva ventana/pestaña
    doc.output('dataurlnewwindow');
  }
  
  function exportToExcel(data) {
    // Obtener el texto seleccionado de los selectores
    const rutaSelect = document.getElementById('kt_datatable_search_type_geo');
    const ruta_text = rutaSelect.options[rutaSelect.selectedIndex]?.text || '';
  
    const agencia_Select = document.getElementById('kt_datetimepicker_1').value + ' al ' +  document.getElementById('kt_datetimepicker_1_2').value;  
    
    const agencia_text = agencia_Select;
    let chofer = usuario_chofer
    
    if(chofer ==="" && usuario_nivel===3){
      chofer = buscarConductorPorRuta(ruta_text, choferes)
    }
    console.log(chofer)
    // Definir encabezados de la tabla
    const header = ['Tipo','Guía', 'Caja', 'Cliente', 'Teléfono', 'Monto', 'Dirección', 'Ciudad - Estado', 'Seguimientos'];

// Construir las filas
const rows = data.map(row => {
  // Construir medidas de las cajas
  let medidas = '';
  if (Array.isArray(row.detallesGuia)) {
    medidas = row.detallesGuia.map(caja => {
      return `${caja.alto || ''} x ${caja.ancho || ''} x ${caja.largo || ''}`;
    }).join('\n'); // salto de línea entre cajas
  }

  return [
    row.tipo_contenido,
    row.nro_guia,
    medidas,
    row.nom_cliente_remite,
    ' +' + (row.celular_remite || '') + ' / +' + (row.telefono_remite || ''),
    `$${Number(parseFloat(row.total_fac || 0))
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
    (row.direccion_recogida?.trim() || row.direccion_remite || '') + ', Zip: ' + (row.zip_remite || ''),
    `${row.ciudad_remite?.[0]?.name || ''} - ${row.estado_remite?.[0]?.name || ''}`,
    Array.isArray(row.seguimientoEspecial)
      ? row.seguimientoEspecial.map(seg => seg.observacion || '').join(' - ')
      : row.seguimientoEspecial?.observacion || ''
];

});

  
    // Crear una nueva hoja de trabajo con encabezado y filas
    const wsData = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
  
    // Crear y configurar el libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Guias');
  
    // Guardar el archivo
    XLSX.writeFile(wb, `Guias_por_Ruta_${ruta_text}_Fecha_${agencia_text}.xlsx`);
  }
  
  
  // Imprimir todas las guías (por PDF multipágina, etc.)
  function imprimir_todas_guias(guiasFiltradas) {
    const chunkSize = 20; // El tamaño de cada grupo
    console.log(`Se imprimirán ${guiasFiltradas.length} guías en grupos de ${chunkSize}.`);
  
    if (guiasFiltradas.length === 0) {
      alert('No hay guías seleccionadas para imprimir.');
      return;
    }
  
    // Usamos un bucle para recorrer el array en trozos
    for (let i = 0; i < guiasFiltradas.length; i += chunkSize) {
      // Cortamos el trozo correspondiente del array
      const chunk = guiasFiltradas.slice(i, i + chunkSize);
      
      // Hacemos lo mismo que antes, pero solo con el trozo
      const nro_guias = chunk.map(guia => guia.nro_guia);
      const guiasParam = nro_guias.join(',');
      
      console.log(`Abriendo pestaña para el grupo #${(i / chunkSize) + 1} con ${chunk.length} guías.`);
      
      // Abrimos la nueva pestaña para este grupo
      window.open(`/generate-multiplepdfs/${guiasParam}`, '_blank');
    }
  }
  
  // Geocodificación y apertura en Google Maps
  async function obtenerCoordenadas2(direccion) {
    console.log(direccion);
    try {
      const response = await fetch('/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direccion })
      });
      
  
      const data = await response.json();
      if (data.success) {
        const googleMapsLink = `https://www.google.com/maps?q=${data.coordenadas.lat},${data.coordenadas.lng}`;
        window.open(googleMapsLink, '_blank');
      }
    } catch (error) {
      console.error('Error en la solicitud de geocodificación:', error);
    }
  }
  $("#btnGuardarRuta").on("click", function(){

    guardarRutaOptimizada()
  })


  $("#btnGuardarRuta2").on("click", function(){
    guardar_asignacion_chofer()
    //guardarRutaOptimizada()
  })



$("#informacion_comi").on("click", function() {
  console.log("Botón #informacion_comi presionado.");
  // Leer las fechas "Desde" y "Hasta" del DOM
  esrutaprevia = false; // Resetear estado
  // document.getElementById('btnFiltrar').style.display ='block'; // Esta línea se ajusta más adelante
  // document.getElementById('btnEliminarruta').style.display ='none'; // Esta línea se ajusta más adelante

  rutasGuardadas = []; // Resetear rutas guardadas cacheadas
  guiasCompletasOrdenadas = []; // Resetear guías de la ruta seleccionada
  
  const fechaDesde = $("#kt_datetimepicker_1").val();
  const fechaHasta = $("#kt_datetimepicker_1_2").val();
  const rutaSeleccionada = $("#kt_datatable_search_type_geo").val(); // ID de la ruta base

  const contenedorBotones = document.getElementById('contenedorBotonesRutas');
  if (contenedorBotones) contenedorBotones.innerHTML = ''; // Limpiar botones de rutas guardadas previas
  
  const listado = document.getElementById('listadoGuias');
  if (listado) listado.innerHTML = ''; // Limpiar listado de guías previo
  
  // --- Validación de Entradas ---
  if (!fechaDesde || !fechaHasta || !rutaSeleccionada) {
      Swal.fire({
          title: "Campos Requeridos",
          text: "Por favor, asegúrate de ingresar la Fecha Desde, Fecha Hasta y seleccionar una Ruta antes de consultar.",
          icon: "warning",
          confirmButtonText: 'Entendido'
      });
      return; 
  }

  // --- Mostrar Indicador de Carga ---
  Swal.fire({
      title: "Consultando Guías...",
      text: "Obteniendo la información de la ruta seleccionada, por favor espera un momento.",
      imageUrl: '/assets/media/spinner.gif', // Asegúrate que esta ruta es correcta
      imageWidth: 80,
      imageHeight: 80,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
          Swal.showLoading();
      }
  });

  // --- Llamada AJAX para Obtener Guías y Direcciones ---
  fetchGuias(fechaDesde, fechaHasta, rutaSeleccionada)
      .done(function(guiasData) {
          Swal.close(); // Ocultar el SweetAlert de carga inmediatamente
          
          const lasguias = guiasData.guiasConRutaInfo || []; 
          rutasGuardadas = guiasData.rutasPopulated || []; // Actualizar la variable global/scope
          console.log('las rutas guardadas1111', rutasGuardadas)
         
          // Determinar visibilidad del botón de filtro general
          const btnFiltrarGeneral = document.getElementById('btnFiltrar');
          const btnFiltrarGeneral_autoasignar = document.getElementById('btnFiltrar2');
          if(btnFiltrarGeneral){
              if (usuario_nivel === 3) { // Asumiendo que 'usuario_nivel' está definido
                  btnFiltrarGeneral.style.display = 'none';
                  btnFiltrarGeneral_autoasignar.style.display = 'block';
                  
              } else {
                  btnFiltrarGeneral.style.display = 'block';
                  btnFiltrarGeneral_autoasignar.style.display = 'none';
              }
          }
          const btnEliminarRutaGlobal = document.getElementById('btnEliminarruta');
          if(btnEliminarRutaGlobal) btnEliminarRutaGlobal.style.display = 'none'; // Ocultar inicialmente


          if (!contenedorBotones) {
              console.error("El elemento 'contenedorBotonesRutas' no existe en el DOM.");
          } else if (rutasGuardadas.length === 0) {
              contenedorBotones.innerHTML = `<p class="text-info mt-3">No hay rutas predefinidas guardadas para esta selección.</p>`;
          } else {
              // --- Crear la estructura del Dropdown Bootstrap para Rutas Guardadas ---
              const dropdownContainer = document.createElement('div');
              dropdownContainer.className = 'dropdown mt-3';

              const dropdownButton = document.createElement('button');
              dropdownButton.className = 'btn btn-primary dropdown-toggle';
              dropdownButton.type = 'button';
              dropdownButton.id = 'dropdownRutasGuardadasToggle';
              dropdownButton.setAttribute('data-toggle', 'dropdown'); // Para Bootstrap 4 con jQuery
              // Si usas Bootstrap 5 nativo: dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
              dropdownButton.setAttribute('aria-haspopup', 'true');
              dropdownButton.setAttribute('aria-expanded', 'false');
              dropdownButton.textContent = `Seleccionar Ruta Guardada (${rutasGuardadas.length} encontradas)`;

              const dropdownMenu = document.createElement('div');
              dropdownMenu.className = 'dropdown-menu';
              dropdownMenu.setAttribute('aria-labelledby', 'dropdownRutasGuardadasToggle');
              
              // Crear un mapa de las guías originales por nro_guia para fácil acceso
              const mapaGuiasOriginales = new Map();
              if (Array.isArray(lasguias)) {
                  lasguias.forEach(guiaOriginal => {
                      if (guiaOriginal && guiaOriginal.nro_guia) { // Asegurarse que guiaOriginal y nro_guia existan
                          mapaGuiasOriginales.set(guiaOriginal.nro_guia, guiaOriginal);
                      }
                  });
              }
            
              rutasGuardadas.forEach((rutaGuardada) => { // No necesitas 'index' aquí
                  if (!rutaGuardada || !rutaGuardada._id) {
                      console.warn("[#informacion_comi] Se encontró una ruta guardada inválida o sin _id:", rutaGuardada);
                      return; // Saltar esta ruta guardada inválida
                  }

                  const nombreChofer = rutaGuardada.idUsuario?.name || 'Chofer N/D';
                  const nombreRutaBase = rutaGuardada.routeID?.Rutas || 'Ruta Base N/D'; // Asumiendo que routeID es un objeto poblado con 'Rutas'
                  const fechaRuta = rutaGuardada.fecha || 'Fecha N/D';
                  
                  const puntosReales = Array.isArray(rutaGuardada.puntos) ? rutaGuardada.puntos : [];
                  const cantidadParadas = puntosReales.filter(p => p && p.idGuia !== null).length; // Contar solo puntos que son guías reales

                  const dropdownItem = document.createElement('a');
                  dropdownItem.className = 'dropdown-item';
                  dropdownItem.href = '#';
                  dropdownItem.dataset.id = rutaGuardada._id; // ID de la RutaPrevia para usar en edición/eliminación
                  
                  dropdownItem.innerHTML = `
                      <span class="font-weight-bold">${nombreChofer} - ${fechaRuta} (${cantidadParadas} paradas)</span><br>
                      <small class="text-muted">Ruta Base: ${nombreRutaBase}</small>
                  `;

                  dropdownItem.onclick = function(event) {
                      event.preventDefault();
                      
                      if (usuario_nivel !== 3) { // Asumiendo que 'usuario_nivel' está definido
                          const btnEliminar = document.getElementById('btnEliminarruta');
                          if (btnEliminar) btnEliminar.style.display = 'block';
                      }
                      const btnFiltrar = document.getElementById('btnFiltrar');
                      if(btnFiltrar) btnFiltrar.style.display = 'none';

                      id_Ruta_predefinida = this.dataset.id; // 'this' es dropdownItem, this.dataset.id es rutaGuardada._id
                      console.log('[DropdownClick] Ruta Predefinida seleccionada. ID:', id_Ruta_predefinida, "Data de la ruta:", rutaGuardada);

                      usuario_chofer = rutaGuardada.idUsuario?.name || 'Chofer N/D'; 
                      id_usuario_chofer= rutaGuardada.idUsuario?._id
                      // !!! CORRECCIÓN IMPORTANTE: Vaciar guiasCompletasOrdenadas ANTES de llenarla de nuevo !!!
                      guiasCompletasOrdenadas = [];
                      console.log("[DropdownClick] guiasCompletasOrdenadas ha sido reseteada.");

                      const puntosDeEstaRutaGuardada = Array.isArray(rutaGuardada.puntos) ? rutaGuardada.puntos : [];
                      
                      if (puntosDeEstaRutaGuardada.length > 0) {
                          puntosDeEstaRutaGuardada.forEach(punto => {
                              if (punto && punto.nroGuia && punto.nroGuia !== 'Punto de Partida' && punto.nroGuia !== 'Punto de Llegada') {
                                  const guiaOriginalCompleta = mapaGuiasOriginales.get(punto.nroGuia);
                                  if (guiaOriginalCompleta) {
                                      guiasCompletasOrdenadas.push(guiaOriginalCompleta);
                                  } else {
                                      console.warn(`[DropdownClick] Guía con Nro: ${punto.nroGuia} (de la ruta guardada ${id_Ruta_predefinida}) no fue encontrada en mapaGuiasOriginales.`);
                                  }
                              }
                          });
                      }
                      console.log("[DropdownClick] Guías para la ruta seleccionada (solo Nros):", guiasCompletasOrdenadas.map(g => g.nro_guia));
                      // console.log("[DropdownClick] Guías completas para la ruta seleccionada:", JSON.parse(JSON.stringify(guiasCompletasOrdenadas)));

                      esrutaprevia = true; 

                      mostrarListadoGuias(
                          guiasCompletasOrdenadas,
                          fechaRuta, // Usar la fecha de la ruta guardada
                          fechaRuta, // Usar la misma para el rango
                          nombreRutaBase // Usar el nombre de la ruta base de la ruta guardada
                      );

                      const detalleCard = document.getElementById('detalleRutaSeleccionadaCard');
                      const contBotonesRutas = document.getElementById('contenedorBotonesRutas');
                      const tituloDetalle = document.getElementById('tituloDetalleRuta');
                      const modalFechaElement = document.getElementById('fechaModal');

                      if(detalleCard) detalleCard.style.display = 'block';
                      if(contBotonesRutas) $(contBotonesRutas).hide(); // O contBotonesRutas.style.display = 'none';
                      if(tituloDetalle) tituloDetalle.innerText = `Detalle Ruta: ${nombreRutaBase} - ${fechaRuta} (${nombreChofer})`;
                      
                      if (modalFechaElement) {
                        if (typeof $ !== 'undefined' && $.fn.modal) {
                            // Estás usando Bootstrap 4 o 3 (o una configuración de BS5 que depende de jQuery para modales)
                            console.log("[DropdownClick] Usando API de jQuery de Bootstrap (3/4/compatible) para modal 'fechaModal'");
                            $(modalFechaElement).modal('show');
                        } else {
                            console.warn("[DropdownClick] No se pudo mostrar el modal 'fechaModal'. jQuery o el plugin modal de Bootstrap no están disponibles.");
                        }
                    } else {
                        console.warn("[DropdownClick] Elemento modal con ID 'fechaModal' no encontrado en el DOM.");
                    }
                  }; // Fin de dropdownItem.onclick
                  
                  // Lógica para añadir el item al menú desplegable según el nivel de usuario
                  if (usuario_nivel === 0 || usuario_nivel === 1 || usuario_nivel === 2 ) { // Asumiendo que 'usuario_nivel' y 'mi_usuario' están definidos
                      dropdownMenu.appendChild(dropdownItem); 
                  } else if (usuario_nivel === 3 && mi_usuario === rutaGuardada.idUsuario?._id) {
                      console.log("[#informacion_comi] Usuario nivel 3 y es su ruta. Mostrando item:", rutaGuardada._id);
                      dropdownMenu.appendChild(dropdownItem); 
                  } else {
                      // console.log("[#informacion_comi] Usuario nivel 3 pero no es su ruta, o nivel desconocido. Ocultando item:", rutaGuardada._id, "Mi Usuario:", mi_usuario, "Ruta Usuario:", rutaGuardada.idUsuario?._id);
                  }
              }); // Fin de rutasGuardadas.forEach

              if (dropdownMenu.children.length > 0) { // Solo añadir el dropdown si tiene items
                  dropdownContainer.appendChild(dropdownButton);
                  dropdownContainer.appendChild(dropdownMenu);
                  contenedorBotones.appendChild(dropdownContainer);
                  $(contenedorBotones).show(); // O contenedorBotones.style.display = 'block';
              } else {
                   contenedorBotones.innerHTML = `<p class="text-info mt-3">No hay rutas predefinidas guardadas para mostrar según tu usuario.</p>`;
              }
          } // Fin de else (si rutasGuardadas.length > 0)

          // --- Procesamiento de Direcciones de Partida/Llegada ---
          let direccionesConfig = guiasData.direccionesconfi || [];
          direcciones = direccionesConfig; // Guardar globalmente

          const partidaData = direcciones.find(d => d && d.predeterminado1 === 1);
          const llegadaData = direcciones.find(d => d && d.predeterminado2 === 1);

          if (!partidaData || !llegadaData) {
              console.warn(`Configuración de Direcciones Incompleta: Falta punto de ${!partidaData ? 'Partida (predeterminado1=1)' : ''} ${!llegadaData ? 'o Llegada (predeterminado2=1)' : ''}.`);
              Swal.fire({ /* ... advertencia de configuración ... */ });
              puntoPartida = null;
              puntoLlegada = null;
          } else {
              const latPartida = Number(partidaData.lat);
              const lonPartida = Number(partidaData.lon);
              const latLlegada = Number(llegadaData.lat);
              const lonLlegada = Number(llegadaData.lon);

              if (isNaN(latPartida) || isNaN(lonPartida) || isNaN(latLlegada) || isNaN(lonLlegada)) {
                  Swal.fire({ /* ... error de coordenadas inválidas ... */ });
                  puntoPartida = null;
                  puntoLlegada = null;
              } else {
                  puntoPartida = {
                      coordenadas: { lat: latPartida, lng: lonPartida },
                      nro_guia: 'Punto de Partida',
                      direccion: partidaData.direccion || 'N/D',
                  };
                  puntoLlegada = {
                      coordenadas: { lat: latLlegada, lng: lonLlegada },
                      nro_guia: 'Punto de Llegada',
                      direccion: llegadaData.direccion || 'N/D',
                  };
                  console.log("[#informacion_comi] Punto de Partida establecido:", puntoPartida);
                  console.log("[#informacion_comi] Punto de Llegada establecido:", puntoLlegada);
              }
          }

          // --- Procesamiento Final de Guías ---
          guias = guiasData.guiasConRutaInfo || [];
          guiasFiltradasActuales = [...guias]; // Usar una copia para guiasFiltradasActuales

          console.log("[#informacion_comi] Total de guías recibidas (guias / guiasFiltradasActuales):", guias.length);

          defaultDate = fechaHasta; 

          if (usuario_nivel !== 3 && typeof renderCalendar === "function") { // Asumiendo que 'usuario_nivel' está definido
              renderCalendar(guias); // Renderizar calendario con todas las guías del filtro
          }
          
          // Asegurar coordenadas ANTES de cualquier acción que dependa de ellas (como mostrar listas para editar)
          if (typeof asegurarCoordenadasEnGuias === "function") {
              asegurarCoordenadasEnGuias(guias) // 'guias' es el array original, se modifica in-place
                  .then(() => {
                      console.log("[#informacion_comi] Proceso de asegurar/obtener coordenadas completado para 'guias'.");
                      // 'guiasFiltradasActuales' y 'guiasCompletasOrdenadas' (si se poblaron con refs de 'guias')
                      // ahora deberían tener las coordenadas actualizadas.

                      if (!mapaGoogle && typeof initMap === "function") {
                          console.log("[#informacion_comi] Inicializando mapa de Google...");
                          initMap();
                      } else if (mapaGoogle && directionsRenderer) {
                          console.log("[#informacion_comi] El mapa de Google ya estaba inicializado. Limpiando DirectionsRenderer.");
                          directionsRenderer.setDirections({ routes: [] });
                      }
                      
                      const mapContainer = document.getElementById('mapaContainer');
                      if (mapContainer) mapContainer.style.display = 'none';
                      
                      // const guardarRutaSect = document.getElementById('guardarRutaSection');
                      // if (guardarRutaSect) guardarRutaSect.style.display = 'none';

                      const butomImprimirCont = document.getElementById("butom_imprimir");
                      if (butomImprimirCont) {
                          butomImprimirCont.style.display = "block";
                      } else {
                          console.error("[#informacion_comi] Contenedor #butom_imprimir no encontrado.");
                      }
                  })
                  .catch(error => {
                      console.error("[#informacion_comi] Error durante asegurarCoordenadasEnGuias:", error);
                      Swal.fire('Error de Coordenadas', 'Hubo un problema al verificar/obtener las coordenadas de las guías.', 'error');
                  });
          } else {
              console.warn("[#informacion_comi] La función 'asegurarCoordenadasEnGuias' no está definida.");
          }

      }) // Fin de .done()
      .fail(function(jqXHR, textStatus, errorThrown) {
          Swal.close();
          console.error("Error en la solicitud AJAX para obtener guías:", textStatus, errorThrown, jqXHR.responseText);
          Swal.fire({
              title: "Error de Comunicación",
              text: "No se pudieron cargar las guías desde el servidor. Verifica tu conexión o contacta al administrador.",
              icon: "error",
              confirmButtonText: 'Aceptar'
          });
      });
}); // Fin de $("#informacion_comi").on("click", ...)



/**
 * Confirma la selección de guías del modal, las optimiza y procede a guardarlas/actualizarlas.
 * @param {Array<Object>} guiasQueSeMostraronEnModal - El array completo de guías que se mostró en el modal,
 * del cual se hizo la selección (ej: la variable 'guiasParaElModal' que se le pasó a abrirModalParaEditarRutaGuardada).
 */
async function confirmarSeleccionYOptimizar(guiasQueSeMostraronEnModal) {
  console.log("[confirmarSeleccionYOptimizar] Iniciando con guías del modal:", guiasQueSeMostraronEnModal.length);

  const checkboxes = document.querySelectorAll('#tablaSeleccionGuiasContainer .guia-checkbox:checked');
  const idsSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  console.log("[confirmarSeleccionYOptimizar] IDs seleccionados en el modal:", idsSeleccionados);

  if (idsSeleccionados.length === 0 && !(puntoPartida && puntoLlegada)) {
      Swal.fire({
          icon: 'warning',
          title: 'Selección Inválida',
          text: 'Debes seleccionar al menos una guía o tener configurados puntos de partida y llegada para optimizar.',
          confirmButtonText: 'Entendido'
      });
      return;
  }
  
  // Filtrar 'guiasQueSeMostraronEnModal' para obtener solo los objetos guía completos que fueron seleccionados
  // y que tengan coordenadas válidas (aunque ya deberían tenerlas si se mostraron en el modal).
  const guiasSeleccionadas = guiasQueSeMostraronEnModal.filter(guia => {
      if (!guia || typeof guia._id === 'undefined') return false;
      const esSeleccionada = idsSeleccionados.includes(guia._id);
      if (!esSeleccionada) return false;

      const lat = Number(guia.lat);
      const lon = Number(guia.lon);
      const tieneCoordenadas = guia.lat != null && guia.lon != null && String(guia.lat).trim() !== "" && String(guia.lon).trim() !== "" && !isNaN(lat) && !isNaN(lon);
      
      if (!tieneCoordenadas) {
          console.warn(`[confirmarSeleccionYOptimizar] Guía seleccionada (ID: ${guia._id}) fue excluida por coordenadas inválidas en este punto.`);
      }
      return tieneCoordenadas;
  });

  if (guiasSeleccionadas.length !== idsSeleccionados.length && idsSeleccionados.length > 0) {
      console.warn("[confirmarSeleccionYOptimizar] Advertencia: Algunas guías marcadas fueron excluidas por no tener _id o coordenadas válidas al momento de confirmar.");
      Swal.fire({
          icon: 'warning',
          title: 'Guías Excluidas',
          text: 'Algunas de las guías seleccionadas no pudieron ser procesadas por falta de datos (ID o coordenadas). Se continuará con las válidas.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3500
      });
  }
  
  if (guiasSeleccionadas.length === 0 && idsSeleccionados.length > 0) {
      Swal.fire('Error de Datos', 'Ninguna de las guías seleccionadas tiene la información necesaria (ID y coordenadas válidas) para la optimización.', 'error');
      return;
  }

  if (!puntoPartida || !puntoPartida.coordenadas || typeof puntoPartida.coordenadas.lat !== 'number' || typeof puntoPartida.coordenadas.lng !== 'number' ||
      !puntoLlegada || !puntoLlegada.coordenadas || typeof puntoLlegada.coordenadas.lat !== 'number' || typeof puntoLlegada.coordenadas.lng !== 'number') {
      Swal.fire({
          icon: 'error',
          title: 'Configuración Incompleta',
          text: `Faltan puntos o coordenadas válidas para Partida y/o Llegada. Verifica la configuración de direcciones (predeterminado1 y predeterminado2).`,
          confirmButtonText: 'Entendido'
      });
      return;
  }

 
  const puntosParaOptimizarBackend = [
    puntoPartida,
    ...guiasSeleccionadas.map(g => ({
        _id: g._id,
        coordenadas: { lat: Number(g.lat), lng: Number(g.lon) },
        nro_guia: g.nro_guia,
        celular: g.celular_remite,
        telefono: g.telefono_remite,
        tipo_contenido: g.tipo_contenido,
        direccion_remite: (g.direccion_recogida?.trim() || g.direccion_remite || ''),
        nom_cliente_remite: g.nom_cliente_remite
    })),
    puntoLlegada
  ];

  console.log("[confirmarSeleccionYOptimizar] Puntos a enviar al backend para optimizar:", puntosParaOptimizarBackend);

  $('#modalSeleccionarGuias').modal('hide');
  Swal.fire({
      title: 'Optimizando Ruta...',
      text: 'Calculando la mejor secuencia con el servicio de mapas...',
      imageUrl: '/assets/media/spinner.gif',
      imageWidth: 80, imageHeight: 80,
      allowOutsideClick: false, allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); }
  });

  try {
      const response = await fetch('/optimizar-ruta-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puntos: puntosParaOptimizarBackend })
      });

      const resultadoBackend = await response.json();
      console.error("[confirmarSeleccionYOptimizar] recibido recibido desde el backend en optimización:", resultadoBackend);
      Swal.close(); 

      if (!resultadoBackend.success) {
          console.error("[confirmarSeleccionYOptimizar] Error recibido desde el backend en optimización:", resultadoBackend);
          throw new Error(resultadoBackend.message || `Error del servidor al optimizar (${response.status})`);
      }

      rutaOptimizadaActual = resultadoBackend.data;
      console.log("[confirmarSeleccionYOptimizar] Respuesta de optimización recibida del Backend:", rutaOptimizadaActual);

      if (!rutaOptimizadaActual || !Array.isArray(rutaOptimizadaActual.optimizedRoutePoints) || !Array.isArray(rutaOptimizadaActual.decodedCoords)) {
          console.error("[confirmarSeleccionYOptimizar] Datos de optimización recibidos del backend incompletos:", rutaOptimizadaActual);
          throw new Error("La respuesta del backend no contenía los datos esperados para dibujar la ruta optimizada.");
      }

      if (typeof dibujarRutaManualEnMapa === "function") {
          dibujarRutaManualEnMapa(rutaOptimizadaActual);
      } else {
          console.error("[confirmarSeleccionYOptimizar] Función dibujarRutaManualEnMapa no está definida.");
      }

      if (typeof llenarSelectChoferParaGuardar === "function") {
          llenarSelectChoferParaGuardar();
      }

      const infoDiv = document.getElementById('rutaInfoAdicional');
      if (infoDiv && rutaOptimizadaActual.totalDistance && typeof rutaOptimizadaActual.totalDuration !== 'undefined') {
          const distanciaKm = (rutaOptimizadaActual.totalDistance / 1000).toFixed(1);
          const duracionMin = Math.round(rutaOptimizadaActual.totalDuration / 60);
          infoDiv.innerHTML = `<p class="text-muted">Distancia estimada: ${distanciaKm} km, Duración estimada: ${duracionMin} min.</p>`;
      } else if (infoDiv) {
          infoDiv.innerHTML = '';
      }

      if (typeof funcionGuardarRutaOptimizadaAdaptada === "function") {
          // El valor de 'esrutaprevia' y 'id_Ruta_predefinida' debe ser el del contexto
          // en el que se inició el flujo de "Editar Guías de Ruta".
          if (esrutaprevia && id_Ruta_predefinida) {
              console.log("[confirmarSeleccionYOptimizar] Se procederá a ACTUALIZAR la ruta guardada con ID:", id_Ruta_predefinida);
              await funcionGuardarRutaOptimizadaAdaptada(id_Ruta_predefinida);
              console.log('usuario guia', id_usuario_chofer)
              
          } else {
              console.log("[confirmarSeleccionYOptimizar] Se procederá a GUARDAR COMO NUEVA ruta optimizada.");
              await funcionGuardarRutaOptimizadaAdaptada(null);
              console.log('usuario guia', id_usuario_chofer)
          }
      } else {

           console.log('usuario guia', id_usuario_chofer)
          Swal.fire('Advertencia', 'La ruta fue optimizada pero no se pudo procesar el guardado (función no encontrada).', 'warning');
      }
      
      $('#modalMostrarRuta').modal('show');
     
      const guardarSection = document.getElementById("guardarRutaSection");
      if (guardarSection) { // Buena práctica añadir esta verificación
          guardarSection.style.setProperty('display', 'none', 'important');
          console.log("Intentando ocultar #guardarRutaSection con !important", guardarSection);
      } else {
          console.error("#guardarRutaSection no encontrado");
      }
          
  } catch (error) {
      Swal.close();
      console.error("Error detallado durante confirmarSeleccionYOptimizar:", error);
      Swal.fire({
          icon: 'error',
          title: 'Error al Calcular o Procesar Ruta',
          text: `No se pudo obtener ni procesar la ruta optimizada: ${error.message}`,
          confirmButtonText: 'Aceptar'
      });
      const mapaCont = document.getElementById('mapaContainer');
      if(mapaCont) mapaCont.style.display = 'none';
      const guardarSection = document.getElementById('guardarRutaSection');
      if(guardarSection) guardarSection.style.display = 'none';
  }
}



function guardar_asignacion_chofer(){


  let lista_rutas = []
 

  const chofer = document.getElementById('selectChoferParaGuardar2');
  const chofer_select = chofer.options[chofer.selectedIndex]?.text || '';
console.log(chofer_select)

  rutasGuardadas.forEach((data, index) =>{
 
      if(data.puntos.length>0){
      
        for (let index = 0; index < data.puntos.length; index++) {
          const element =  data.puntos[index];

          lista_rutas.push(element.nroGuia)

        }
       
      }

  })
  console.log(lista_rutas)
  var  guias_actualizar_chofer = []

  console.log(guiasFiltradasActuales)
  // Iterar sobre las guías y añadir filas a la tabla
  guiasFiltradasActuales.forEach((guia, index) => {
    
    if(!lista_rutas.includes(guia.nro_guia)){ 
      guias_actualizar_chofer.push(guia.nro_guia)
    }

  })  

  const data ={
    guias_actualizar_chofer, chofer : chofer_select
  }


    const response =  fetch('/api/actualizar_chofer', {
      method: 'put',
      headers:{
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(data)


    })

    if(!response.data){
      Swal.fire({
        icon:'success',
        title:'Exito',
        text:'Guias actualizadas y asignas con este'
      })
    }


}

function guardarRutaOptimizada() {
  console.log("Iniciando guardado de ruta optimizada...", rutaOptimizadaActual);
   
  // 1. Obtener Datos de la UI y Globales
  const selectChofer = document.getElementById('selectChoferParaGuardar');
  const choferIdSeleccionado = selectChofer.value; // Este será nuestro 'idUsuario' para el backend
  const rutaBaseId = $("#kt_datatable_search_type_geo").val(); // ID de la ruta base original
  const fechaDesde = $("#kt_datetimepicker_1").val(); // Usaremos esta como la 'fecha' para el backend
  // const fechaHasta = $(x"#kt_datetimepicker_1_2").val(); // No parece ser requerida por el backend

  // 2. Validaciones Esenciales
  if (!choferIdSeleccionado) {
      Swal.fire('Falta Chofer', 'Por favor, selecciona un chofer.', 'warning');
      return;
  }
  if (!rutaBaseId) {
      Swal.fire('Falta Ruta Base', 'No se pudo identificar la ruta original seleccionada.', 'warning');
      return;
  }
   if (!fechaDesde) {
       Swal.fire('Falta Fecha', 'No se pudo obtener la fecha de inicio del filtro.', 'warning');
       return;
   }

  if (!rutaOptimizadaActual || !Array.isArray(rutaOptimizadaActual.optimizedRoutePoints) || rutaOptimizadaActual.optimizedRoutePoints.length < 2 ||
      !Array.isArray(rutaOptimizadaActual.decodedCoords) || !Array.isArray(rutaOptimizadaActual.instructions)) {
      Swal.fire('Error de Datos', 'Faltan datos de la ruta optimizada (puntos, coordenadas o instrucciones). Vuelve a calcular la ruta.', 'error');
      return;
  }

  // 3. Preparar el Payload para el endpoint

  const payload = {
      idUsuario: choferIdSeleccionado,          // ID del chofer asignado
      fecha: fechaDesde,                        // Fecha principal de la ruta
      routeID: rutaBaseId,                      // ID de la ruta base
      // 'puntos': La secuencia detallada de paradas
      puntos: rutaOptimizadaActual.optimizedRoutePoints.map((punto, index) => ({
        posicion: index,
        idGuia: (punto.nro_guia !== 'Punto de Partida' && punto.nro_guia !== 'Punto de Llegada') ? punto._id : null,
        nroGuia: punto.nro_guia || `Punto ${index}`,
        lat: punto.coordenadas?.lat,
        lng: punto.coordenadas?.lng,
        visitado: false ,
        celular: punto.celular,
        telefono: punto.telefono,
        nom_cliente_remite: punto.nom_cliente_remite,
        direccion: (punto.direccion_recogida?.trim() || punto.direccion_remite || punto.direccion || 'N/D'),
        // Añade aquí otros campos si necesitas...
    })),
    
      // 'rutaCoords': El array de coordenadas {lat, lng} de la polilínea
      rutaCoords: rutaOptimizadaActual.decodedCoords,
      // 'directions': El array de strings de instrucciones
      directions: rutaOptimizadaActual.instructions,
      timestamp: new Date().toISOString() // Añadir timestamp actual (opcional)
      // Los campos de distancia/duración no los pide este backend, pero podrías añadirlos
      // al Schema y aquí si quieres:
      // distanciaMetros: rutaOptimizadaActual.totalDistance,
      // duracionSegundos: rutaOptimizadaActual.totalDuration
  };

  console.log("Payload a enviar a /api/guardar_ruta_previa:", JSON.stringify(payload, null, 2));

  // 4. Mostrar Swal de Carga
  Swal.fire({
      title: 'Guardando Ruta...',
      text: 'Enviando ruta al servidor.',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
  });

  // 5. Realizar la Petición POST al Backend
  fetch('/api/guardar_ruta_previa', { // <-- URL del Backend actualizada
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + tuTokenJWT // Si necesitas autenticación
      },
      body: JSON.stringify(payload)
  })
  .then(response => {
      // Guardar el status code para logs
      const statusCode = response.status;
      // Intentar parsear JSON independientemente del status code
      return response.json().then(data => ({ // Devolver un objeto con status y data
           ok: response.ok, // true si status code es 2xx
           status: statusCode,
           data: data
      }));




  })
  .then(result => {
      Swal.close(); // Cerrar loading
      console.log("Respuesta del backend:", result);

      // Usar result.ok (basado en status code) y result.data (el JSON parseado)
      if (result.ok) { // Éxito (status 200-299)
          Swal.fire({
              icon: 'success',
              title: '¡Ruta Guardada!',
               // Usar el mensaje del backend si existe, o uno genérico
              text: result.data.mensaje || 'La ruta optimizada ha sido guardada/actualizada correctamente.',
              timer: 2500,
              showConfirmButton: false
          });
          $('#modalMostrarRuta').modal('hide');


        let fechaDesdeParaRecarga = $("#kt_datetimepicker_1").val();
        let fechaHastaParaRecarga = $("#kt_datetimepicker_1_2").val();
        let idRutaBaseParaRecarga = $("#kt_datatable_search_type_geo").val();

          const params = new URLSearchParams({
            ruta: idRutaBaseParaRecarga, // ID de la ruta base (tipo de ruta)
            desde: fechaDesdeParaRecarga,
            hasta: fechaHastaParaRecarga
        });
        const newUrl = `/lista_rutas_list/?${params.toString()}`;
        console.log("Redirigiendo a:", newUrl);
        window.location.href = newUrl;
          
          // Resetear estado si se desea
          // rutaOptimizadaActual = null;
          // $('#mapaContainer').hide();
          // $('#guardarRutaSection').hide();
      } else {
          // Error (status code 4xx, 5xx)
           Swal.fire({
               icon: 'error',
               title: `Error ${result.status} al Guardar`,
               // Usar mensaje del backend o uno genérico
               text: result.data.mensaje || 'No se pudo guardar la ruta en el servidor.',
           });
      }
  })
  .catch(error => {
      // Error de red o error al parsear JSON (si la respuesta no era JSON válido)
      Swal.close();
      console.error('Error en fetch al guardar ruta:', error);
      Swal.fire({
          icon: 'error',
          title: 'Error de Comunicación',
          text: `No se pudo guardar la ruta. ${error.message || 'Verifica la conexión.'}`,
      });
  });

} // Fin de guardarRutaOptimizada

  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function ordenarPorDistancia(array) {
    if (array.length < 2) return array;
  
    const ordenado = [array[0]];
    let resto = array.slice(1);
  
    while (resto.length > 0) {
      let indiceMasCercano = 0;
      let latInicio = Number(ordenado[ordenado.length - 1].lat);
      let lonInicio = Number(ordenado[ordenado.length - 1].lon);
      let distanciaMinima = calcularDistancia(
        latInicio,
        lonInicio,
        Number(resto[0].lat),
        Number(resto[0].lon)
      );
  
      for (let i = 1; i < resto.length; i++) {
        const distancia = calcularDistancia(
          latInicio,
          lonInicio,
          Number(resto[i].lat),
          Number(resto[i].lon)
        );
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          indiceMasCercano = i;
        }
      }
      ordenado.push(resto[indiceMasCercano]);
      resto.splice(indiceMasCercano, 1);
    }
    return ordenado;
  }
  
  function ordenarPorDistanciaConPuntoDePartida(array) {
    if (array.length < 2) return array;
    
    // Buscar el punto de partida: el primer elemento con predeterminado1 === 1
    const puntoPartida = array.find(item => item.predeterminado1 === 1);
    
    if (!puntoPartida) {
      console.log("No se encontró punto de partida (predeterminado1 === 1).");
      return array;
    }
    
    console.log("Punto de partida encontrado:", puntoPartida);
    
    // Crear el array "resto" sin el punto de partida
    let resto = array.filter(item => item !== puntoPartida);
    const ordenado = [puntoPartida];
    
    while (resto.length > 0) {
      let indiceMasCercano = 0;
      let latInicio = Number(ordenado[ordenado.length - 1].lat);
      let lonInicio = Number(ordenado[ordenado.length - 1].lon);
      let distanciaMinima = calcularDistancia(
        latInicio,
        lonInicio,
        Number(resto[0].lat),
        Number(resto[0].lon)
      );
      
      for (let i = 1; i < resto.length; i++) {
        const distancia = calcularDistancia(
          latInicio,
          lonInicio,
          Number(resto[i].lat),
          Number(resto[i].lon)
        );
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          indiceMasCercano = i;
        }
      }
      
      console.log("El siguiente punto más cercano es:", resto[indiceMasCercano], "a distancia:", distanciaMinima);
      ordenado.push(resto[indiceMasCercano]);
      resto.splice(indiceMasCercano, 1);
    }
    return ordenado;
  }
  



  
  function llenarSelectChoferes() {
    const selectChofer = document.getElementById('selectChofer');
    selectChofer.innerHTML = ''; // Limpia por si había algo
  
    choferes.forEach((chofer, index) => {
      const option = document.createElement('option');
      option.value = index; // o chofer.nombre, si prefieres
      option.textContent = `${chofer.nombre} - ${chofer.usuario.telefono}`;
      selectChofer.appendChild(option);
    });
  }
  
});



// Asegúrate que esta función está definida en tu archivo
function dibujarRutaManualEnMapa(mapData) {
  console.log("ENTERING dibujarRutaManualEnMapa with data:", mapData); // DEBUG LOG
  if (!mapaGoogle) {
      console.error("Mapa no inicializado en dibujarRutaManualEnMapa.");
      initMap();
      if (!mapaGoogle) return;
  }

  // 1. Limpiar elementos previos
  if (rutaPolyline) {
      rutaPolyline.setMap(null);
      rutaPolyline = null;
  }
  rutaMarkers.forEach(marker => marker.setMap(null));
  rutaMarkers = [];

  // 2. Dibujar Polilínea
  if (mapData.decodedCoords && mapData.decodedCoords.length > 0) {
      // *** Verifica que mapData.decodedCoords sea un array de {lat, lng} ***
      console.log("Dibujando polilínea con coords:", mapData.decodedCoords);
      try {
           rutaPolyline = new google.maps.Polyline({
               path: mapData.decodedCoords, // Debe ser [{lat: number, lng: number}, ...]
               geodesic: true,
               strokeColor: '#4285F4',
               strokeOpacity: 0.8,
               strokeWeight: 5
           });
           rutaPolyline.setMap(mapaGoogle);
       } catch (polyError) {
           console.error("Error al crear/dibujar Polyline:", polyError, mapData.decodedCoords);
           Swal.fire('Error de Mapa', 'No se pudo dibujar la línea de la ruta.', 'error');
       }

  } else {
      console.warn("No hay coordenadas decodificadas para dibujar la polilínea.");
  }

  // 3. Dibujar Marcadores
  if (mapData.optimizedRoutePoints && mapData.optimizedRoutePoints.length > 0) {
       console.log("Dibujando marcadores para:", mapData.optimizedRoutePoints);
      mapData.optimizedRoutePoints.forEach((punto, index) => {
          if (punto.coordenadas) {
              // ... (lógica para label e icon como antes) ...
               const isStart = index === 0;
               const isEnd = index === mapData.optimizedRoutePoints.length - 1;
               let labelText = `${index + 1}`;
               let iconUrl = null;
               if (isStart && punto.nro_guia === 'Punto de Partida') labelText = 'A';
               else if (isEnd && punto.nro_guia === 'Punto de Llegada') labelText = 'B';
               else labelText = `${index}`;

               try {
                   const marker = new google.maps.Marker({
                       position: punto.coordenadas, // Debe ser {lat: number, lng: number}
                       map: mapaGoogle,
                       label: labelText,
                       title: `${punto.nro_guia || `Punto ${index}`}\n${punto.direccion || ''}`,
                       // icon: iconUrl // Puedes añadir iconos si quieres
                   });
                   rutaMarkers.push(marker);
               } catch (markerError) {
                    console.error("Error al crear marker para punto:", punto, markerError);
               }

          } else {
               console.warn("Punto optimizado sin coordenadas:", punto);
          }
      });
  }

  // 4. Ajustar Bounds
  const routeBoundsData = mapData.bounds; // Recibido del backend
  if (routeBoundsData && routeBoundsData.northeast && routeBoundsData.southwest) {
       console.log("Ajustando bounds desde datos NE/SW recibidos:", routeBoundsData);
       try {
          // *** CREAR MANUALMENTE el objeto LatLngBounds ***
           const bounds = new google.maps.LatLngBounds(
               new google.maps.LatLng(routeBoundsData.southwest.lat, routeBoundsData.southwest.lng),
               new google.maps.LatLng(routeBoundsData.northeast.lat, routeBoundsData.northeast.lng)
           );
           mapaGoogle.fitBounds(bounds);
       } catch (boundsError) {
            console.error("Error al crear o ajustar LatLngBounds:", boundsError, routeBoundsData);
            Swal.fire('Error de Mapa', 'No se pudo ajustar el zoom del mapa.', 'error');
       }

  } else if (mapData.optimizedRoutePoints && mapData.optimizedRoutePoints.length > 0) {
      // Fallback si no vienen bounds del backend
       console.warn("Bounds NE/SW no disponibles. Calculando bounds desde puntos optimizados.");
       const bounds = new google.maps.LatLngBounds();
       let boundsExtended = false;
       mapData.optimizedRoutePoints.forEach(punto => {
           if (punto.coordenadas) {
               try {
                    bounds.extend(new google.maps.LatLng(punto.coordenadas.lat, punto.coordenadas.lng));
                    boundsExtended = true;
                } catch(extendError) {
                    console.error("Error extendiendo bounds para punto:", punto, extendError);
                }
           }
       });
       if (boundsExtended && !bounds.isEmpty()) {
           mapaGoogle.fitBounds(bounds);
       } else {
           console.error("No se pudieron calcular bounds para centrar el mapa.");
           // Centrar en el primer punto como último recurso
           if (mapData.optimizedRoutePoints[0]?.coordenadas) {
               mapaGoogle.setCenter(mapData.optimizedRoutePoints[0].coordenadas);
               mapaGoogle.setZoom(12);
           }
       }
  } else {
       console.error("No hay bounds ni puntos para centrar el mapa.");
  }

  $('#mapaContainer').show();
}


function initMap() {
  // Centrar inicialmente (puedes usar lat/lon de la agencia o el punto de partida si ya lo tienes)
  const initialCoords = { lat: 40.7128, lng: -74.0060 }; // Ejemplo: NYC
  mapaGoogle = new google.maps.Map(document.getElementById('mapaRutaOptimizada'), {
      zoom: 10,
      center: initialCoords,
      mapTypeControl: false
  });
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(mapaGoogle); // Asocia el renderer al mapa
   // Opcional: Limpiar rutas previas si se reusa
   // directionsRenderer.setDirections({ routes: [] });
}



function guardarRutaOptimizada() {
  const selectChofer = document.getElementById('selectChoferParaGuardar');
  const choferIdSeleccionado = selectChofer.value;
  const rutaSeleccionadaId = $("#kt_datatable_search_type_geo").val(); // ID de la ruta general
  const fechaDesde = $("#kt_datetimepicker_1").val();
  const fechaHasta = $("#kt_datetimepicker_1_2").val();

  if (!choferIdSeleccionado) {
      Swal.fire('Falta Chofer', 'Por favor, selecciona un chofer para asignar la ruta.', 'warning');
      return;
  }

  if (!rutaOptimizadaActual || !rutaOptimizadaActual.optimizedRoute) {
      Swal.fire('Error', 'No hay una ruta optimizada para guardar.', 'error');
      return;
  }

  // Preparar el payload para enviar al backend
  const payload = {
      choferId: choferIdSeleccionado,
      rutaBaseId: rutaSeleccionadaId, // La ruta seleccionada en el dropdown inicial
      fechaInicio: fechaDesde,       // O la fecha específica para la que se generó
      fechaFin: fechaHasta,
      distanciaTotalMetros: rutaOptimizadaActual.totalDistance,
      duracionTotalSegundos: rutaOptimizadaActual.totalDuration,
      // Enviar solo los IDs de las guías en el orden optimizado,
      // excluyendo los puntos de partida/llegada si no son guías reales
      ordenGuias: rutaOptimizadaActual.optimizedRoute
                    .filter(punto => punto.nro_guia !== 'Punto de Partida' && punto.nro_guia !== 'Punto de Llegada') // Excluir inicio/fin
                    .map(punto => punto._id), // Asume que guardaste el _id de la guía en 'puntosParaOptimizar'
      // Opcional: puedes enviar la secuencia completa de coordenadas si el backend lo necesita
       // secuenciaCompleta: rutaOptimizadaActual.optimizedRoute.map(p => ({ coords: p.coordenadas, id: p._id, nro_guia: p.nro_guia }))
  };

  console.log("Payload para guardar ruta:", payload);

  // AQUÍ VA TU LLAMADA AJAX (fetch o $.ajax) al backend
  // Ejemplo con fetch:
  Swal.fire({ title: 'Guardando...', text: 'Enviando ruta al servidor.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

  fetch('/guardar-ruta-optimizada', { // <-- DEFINE ESTE ENDPOINT EN TU BACKEND
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
      Swal.close();
      if (data.success) {
          Swal.fire('¡Guardado!', 'La ruta optimizada ha sido guardada con éxito.', 'success');
          // Opcional: Limpiar/resetear la UI después de guardar
          // $('#mapaContainer').hide();
          // $('#guardarRutaSection').hide();
          // rutaOptimizadaActual = null;
      } else {
          Swal.fire('Error', `No se pudo guardar la ruta: ${data.message || 'Error desconocido.'}`, 'error');
      }
  })
  .catch(error => {
      Swal.close();
      console.error('Error al guardar ruta:', error);
      Swal.fire('Error de Red', 'No se pudo comunicar con el servidor para guardar la ruta.', 'error');
  });
}function limpiarBusqueda() {
  const inputBusqueda = document.getElementById('text_busqueda');
  inputBusqueda.value = ''; // Limpiar el input
  
  // Disparar evento de input manualmente
  const event = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  inputBusqueda.dispatchEvent(event);
}
function configurarBusquedaEnTiempoReal() {
  const inputBusqueda = document.getElementById('text_busqueda');
  const tabla = document.querySelector('#tablaSeleccionGuiasContainer table');
  const modalBody = document.querySelector('#modalSeleccionarGuias .modal-body');

  inputBusqueda.addEventListener('input', function(e) {
    const termino = e.target.value.toLowerCase().trim();
    const filas = tabla.querySelectorAll('tbody tr');
    let primeraCoincidencia = null;

    // Limpiar resaltados anteriores
    filas.forEach(fila => {
      fila.classList.remove('resaltado-busqueda');
      fila.style.display = ''; // Mostrar todas las filas
    });

    if (termino) {
      filas.forEach((fila, index) => {
        const celdas = fila.querySelectorAll('td');
        const textoFila = Array.from(celdas)
          .map(celda => celda.textContent.toLowerCase())
          .join(' ');

        if (textoFila.includes(termino)) {
          fila.classList.add('resaltado-busqueda');
          fila.style.display = ''; // Mostrar coincidencias
          
          if (!primeraCoincidencia) {
            primeraCoincidencia = fila;
            // Scroll a la posición
            const offsetTop = fila.offsetTop - 100; // Ajuste de posición
            modalBody.scrollTop = offsetTop;
          }
        } else {
          fila.style.display = 'none'; // Ocultar no coincidencias
        }
      });
    }
  });
}



function abrirModalSeleccionGuias(guiasParaSeleccionar) {
  setTimeout(configurarBusquedaEnTiempoReal, 100);
  const container = document.getElementById('tablaSeleccionGuiasContainer');
  container.innerHTML = ''; // Limpiar
  console.log('la entrada0')
  if (!guiasParaSeleccionar || guiasParaSeleccionar.length === 0) {
      container.innerHTML = '<div class="alert alert-warning" role="alert">No hay guías disponibles para seleccionar.</div>';
      $('#modalSeleccionarGuias').modal('show');
      return;
  }

  // Crear la estructura de la tabla
  const table = document.createElement('table');
  table.className = 'table table-sm table-hover table-bordered';
  table.innerHTML = `
      <thead class="thead-light">
          <tr>
              <th style="width: 5%;">
                  <input type="checkbox" id="selectAllGuiasCheckbox" title="Seleccionar/Deseleccionar todas" style="transform: scale(1.2);">
              </th>
              <th style="width: 5%;">#</th>
              <th style="width: 15%;">Guía</th>
              <th style="width: 25%;">Cliente</th>
              <th style="width: 35%;">Dirección</th>
              <th style="width: 15%;">Ciudad</th>
          </tr>
      </thead>
      <tbody>
      </tbody>  
  `;
  const tbody = table.querySelector('tbody');
  let guiasValidasCount = 0;
 
  let lista_rutas = []
 
  rutasGuardadas.forEach((data, index) =>{
 
      if(data.puntos.length>0){
      
        for (let index = 0; index < data.puntos.length; index++) {
          const element =  data.puntos[index];

          lista_rutas.push(element.nroGuia)

        }
       
      }

  })
  console.log(lista_rutas)
  var  contador = 0
  // Iterar sobre las guías y añadir filas a la tabla
  guiasParaSeleccionar.forEach((guia, index) => {
      const lat = Number(guia.lat);
      const lon = Number(guia.lon);
      // Incluir solo guías con coordenadas válidas
    
    if(!lista_rutas.includes(guia.nro_guia)){ 
      contador++
        if (guia.lat && guia.lon && !isNaN(lat) && !isNaN(lon)) {
        
          
            guiasValidasCount++;
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            
            // Crear celdas y checkbox
            const tdCheckbox = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'guia-checkbox';
            checkbox.value = guia._id;
            checkbox.style.transform = 'scale(1.2)';
            // *** El estado inicial se definirá después del bucle ***
            tdCheckbox.appendChild(checkbox);
            tdCheckbox.onclick = (e) => e.stopPropagation();
            checkbox.addEventListener('change', actualizarContadorSeleccionados);

            
            const tdIndex = document.createElement('td'); tdIndex.textContent = contador;
            const tdGuia = document.createElement('td'); tdGuia.textContent = guia.nro_guia || 'N/D';
            const tdCliente = document.createElement('td'); tdCliente.textContent = guia.nom_cliente_remite || 'N/D';
            const direccionFinal = guia.direccion_recogida?.trim() || guia.direccion_remite || 'N/D';
              const tdDireccion = document.createElement('td');
              tdDireccion.textContent = direccionFinal;
              tdDireccion.title = direccionFinal;
            const tdCiudad = document.createElement('td'); tdCiudad.textContent = guia.ciudad_remite?.[0]?.name || 'N/D';

            // Ensamblar fila
            tr.appendChild(tdCheckbox);
            tr.appendChild(tdIndex);
            tr.appendChild(tdGuia);
            tr.appendChild(tdCliente);
            tr.appendChild(tdDireccion);
            tr.appendChild(tdCiudad);

            // Click en fila marca/desmarca checkbox
            tr.onclick = function() {
                checkbox.checked = !checkbox.checked;
                // Actualizar estado de "Select All" si se desmarca uno manualmente
                const selectAllCheckbox = document.getElementById('selectAllGuiasCheckbox');
                if (!checkbox.checked && selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                } else if (selectAllCheckbox) {
                    // Verificar si ahora todos están marcados
                    const allChecked = Array.from(container.querySelectorAll('.guia-checkbox')).every(item => item.checked);
                    selectAllCheckbox.checked = allChecked;
                }
                actualizarContadorSeleccionados()


            };

            

            tbody.appendChild(tr);




        } else {
            console.warn(`Guía ${guia.nro_guia || guia._id} excluida de selección por falta de coordenadas.`);
        }


    }
  });
  

  function actualizarContadorSeleccionados() {
    const contadorElement = document.getElementById('contadorSeleccionados');
    const checkboxesSeleccionados = document.querySelectorAll('#tablaSeleccionGuiasContainer .guia-checkbox:checked');
    if (contadorElement) {
        contadorElement.textContent = `Seleccionados: ${checkboxesSeleccionados.length}`;
    }

    const selectAllCheckbox = document.getElementById('selectAllGuiasCheckbox');
    if (selectAllCheckbox) {
        const todosLosCheckboxesVisibles = Array.from(document.querySelectorAll('#tablaSeleccionGuiasContainer .guia-checkbox'))
                                           .filter(cb => cb.closest('tr') && cb.closest('tr').style.display !== 'none');
        
        if (todosLosCheckboxesVisibles.length > 0) {
            selectAllCheckbox.checked = todosLosCheckboxesVisibles.every(cb => cb.checked);
        } else {
            // Si no hay checkboxes visibles (o ninguno en absoluto), desmarcar "Seleccionar todo"
            selectAllCheckbox.checked = false;
        }
    }
}

  // Añadir tabla al contenedor
  container.appendChild(table);

  // Mensaje si no hay guías válidas
   if (guiasValidasCount === 0) {
      container.innerHTML = '<div class="alert alert-danger" role="alert">Ninguna de las guías tiene coordenadas válidas para optimizar.</div>';
   }

  // --- INICIO: Lógica para marcar/desmarcar según 'esrutaprevia' ---
  const selectAllCheckbox = document.getElementById('selectAllGuiasCheckbox');
  const todosLosCheckboxes = container.querySelectorAll('.guia-checkbox');

  // Asegurarse de que la variable global exista (puedes ajustar el nombre)
  // Si no existe, asumimos 'false' por seguridad.
  const estadoInicialChecked = typeof esrutaprevia !== 'undefined' ? esrutaprevia : false;

  console.log(`Estado inicial 'esrutaprevia': ${estadoInicialChecked}. Aplicando a checkboxes.`);

  // Establecer estado inicial de todos los checkboxes de guía
  todosLosCheckboxes.forEach(cb => {
      cb.checked = estadoInicialChecked;
  });

  // Establecer estado inicial del checkbox "Select All"
  if (selectAllCheckbox) {
      // Marcar solo si hay checkboxes individuales Y el estado inicial es true
      selectAllCheckbox.checked = (todosLosCheckboxes.length > 0) && estadoInicialChecked;
  }
  // --- FIN: Lógica para marcar/desmarcar ---


  // Configurar la lógica del checkbox "Seleccionar todas" (para cambios posteriores)
  if (selectAllCheckbox) {
      selectAllCheckbox.onchange = function(e) {
          // Al cambiar "Select All", actualizar todos los checkboxes individuales
          todosLosCheckboxes.forEach(cb => {
              cb.checked = e.target.checked;
          });
      };
       // Listener individual ya actualiza "Select All" (añadido en tr.onclick)
  }


  // Asignar el evento al botón de confirmar
  $('#btnConfirmarSeleccionGuias').off('click').on('click', function() {
    
   
   // document.getElementById('selectChoferParaGuardar2').value = usuario_chofer 
       confirmarSeleccionYOptimizar(guiasParaSeleccionar);
  });

  // Mostrar el modal
  $('#modalSeleccionarGuias').modal('show');
}






async function confirmarSeleccionYOptimizar(guiasOriginales) {
  console.log("Ejecutando confirmarSeleccionYOptimizar..."); // Log inicial

  // 1. Obtener IDs de checkboxes marcados en el modal
  const checkboxes = document.querySelectorAll('#tablaSeleccionGuiasContainer .guia-checkbox:checked');
  const idsSeleccionados = Array.from(checkboxes).map(cb => cb.value);

  // 2. Validar que se haya seleccionado al menos una guía
  if (idsSeleccionados.length === 0) {
      Swal.fire({
          icon: 'warning',
          title: 'Selección Vacía',
          text: 'Debes seleccionar al menos una guía para incluir en la ruta.',
          confirmButtonText: 'Entendido'
      });
      return; // Detener si no hay selección
  }

  // 3. Filtrar los objetos completos de las guías seleccionadas y validar coordenadas
  const guiasSeleccionadas = guiasOriginales.filter(guia =>
      idsSeleccionados.includes(guia._id) &&
      guia.lat && guia.lon &&
      !isNaN(Number(guia.lat)) && !isNaN(Number(guia.lon))
  );

  if (guiasSeleccionadas.length !== idsSeleccionados.length) {
       console.warn("Advertencia: Algunas guías marcadas fueron excluidas por no tener coordenadas válidas.");
       // Opcional: Mostrar un Swal.fire de advertencia aquí
  }
  if (guiasSeleccionadas.length === 0) {
      Swal.fire('Error', 'Ninguna de las guías seleccionadas tiene coordenadas válidas para la optimización.', 'error');
      return;
  }

  // 4. Validar Puntos de Partida y Llegada Globales y sus coordenadas
  if (!puntoPartida || !puntoLlegada || !puntoPartida.coordenadas || !puntoLlegada.coordenadas ||
      typeof puntoPartida.coordenadas.lat !== 'number' || typeof puntoPartida.coordenadas.lng !== 'number' ||
      typeof puntoLlegada.coordenadas.lat !== 'number' || typeof puntoLlegada.coordenadas.lng !== 'number') {
      Swal.fire({
           icon: 'error',
           title: 'Configuración Incompleta',
           text: `Faltan puntos o coordenadas válidas para Partida/Llegada. Verifica la configuración de direcciones (predeterminado1 y predeterminado2).`,
           confirmButtonText: 'Entendido'
       });
      return;
  }

  console.log(`Guias válidas seleccionadas:`, guiasSeleccionadas);
  console.log("Punto Partida:", puntoPartida);
  console.log("Punto Llegada:", puntoLlegada);

  // 5. Preparar el array de puntos para ENVIAR al backend
  const puntosParaOptimizarBackend = [
    puntoPartida,
    ...guiasSeleccionadas.map(g => ({
        _id: g._id,
        coordenadas: { lat: Number(g.lat), lng: Number(g.lon) },
        nro_guia: g.nro_guia,
        celular: g.celular_remite,
        telefono: g.telefono_remite,
        tipo_contenido: g.tipo_contenido,
        direccion_remite: g.direccion_recogida?.trim() || g.direccion_remite, // Aquí el cambio
        nom_cliente_remite: g.nom_cliente_remite
    })),
    puntoLlegada
  ];


  console.log("Enviando al backend para optimizar:", puntosParaOptimizarBackend);

  // 6. Cerrar el modal de selección
  $('#modalSeleccionarGuias').modal('hide');

  // 7. Mostrar indicador de carga
  Swal.fire({
      title: 'Optimizando Ruta...',
      text: 'Calculando la mejor secuencia con Google Maps...',
      imageUrl: '/assets/media/spinner.gif',
      imageWidth: 80, imageHeight: 80,
      allowOutsideClick: false, allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); }
  });

  // 8. Llamar al endpoint del backend
  try {
      const response = await fetch('/optimizar-ruta-google', { // URL de tu API
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puntos: puntosParaOptimizarBackend })
      });

      const resultadoBackend = await response.json();
      Swal.close(); // Cerrar loading

      // 9. Procesar la respuesta
      if (!response.ok || !resultadoBackend.success) {
          console.error("Error recibido desde el backend:", resultadoBackend);
          throw new Error(resultadoBackend.message || `Error del servidor (${response.status})`);
      }

      // --- Éxito ---
      rutaOptimizadaActual = resultadoBackend.data; // Guardar { optimizedRoutePoints, decodedCoords, bounds, ... }
      console.log("Respuesta de optimización recibida del Backend:", rutaOptimizadaActual);

      // Validar datos recibidos (especialmente los necesarios para dibujar)
      if (!rutaOptimizadaActual || !Array.isArray(rutaOptimizadaActual.optimizedRoutePoints) || !Array.isArray(rutaOptimizadaActual.decodedCoords)) {
           console.error("Datos recibidos del backend incompletos:", rutaOptimizadaActual);
           throw new Error("La respuesta del backend no contenía los datos esperados para dibujar la ruta.");
      }

      // ***** PASO 10 CORREGIDO: Llamar SIEMPRE a la función de dibujo manual *****
      console.log("Llamando a dibujarRutaManualEnMapa...");
      dibujarRutaManualEnMapa(rutaOptimizadaActual); // Pasar el objeto completo con los datos procesados

      // 11. Llenar dropdown de choferes
      llenarSelectChoferParaGuardar();

      const infoDiv = document.getElementById('rutaInfoAdicional');
      if (infoDiv && rutaOptimizadaActual.totalDistance && rutaOptimizadaActual.totalDuration) {
          const distanciaKm = (rutaOptimizadaActual.totalDistance / 1000).toFixed(1);
          const duracionMin = Math.round(rutaOptimizadaActual.totalDuration / 60);
          infoDiv.innerHTML = `<p class="text-muted">Distancia estimada: ${distanciaKm} km, Duración estimada: ${duracionMin} min.</p>`;
      } else if (infoDiv) {
           infoDiv.innerHTML = ''; // Limpiar si no hay datos
       }

      console.log("Mostrando modal con mapa y opciones de guardado...");
        $('#modalMostrarRuta').modal('show');



  } catch (error) {
      // 14. Manejo de errores
      Swal.close(); // Asegurar cerrar loading en caso de error
      console.error("Error durante confirmarSeleccionYOptimizar:", error);
      Swal.fire({
          icon: 'error',
          title: 'Error al Calcular Ruta',
          text: `No se pudo obtener ni mostrar la ruta optimizada: ${error.message}`,
          confirmButtonText: 'Aceptar'
      });
      // Ocultar secciones si falla


      $('#mapaContainer').hide();
     // $('#guardarRutaSection').hide();
  }
} 


function llenarSelectChoferParaGuardar() {
  const selectChofer = document.getElementById('selectChoferParaGuardar');
  selectChofer.innerHTML = '<option value="">-- Seleccione un Chofer --</option>'; // Opción por defecto
  console.log(choferes)
  if (typeof choferes !== 'undefined' && Array.isArray(choferes)) {
       choferes.forEach((chofer, index) => {
          const option = document.createElement('option');
          // Guardar el ID del conductor o un índice, lo que uses para identificarlo
          option.value = chofer.usuario._id; // Usa _id si está disponible
          option.textContent = `${chofer.nombre || (chofer.usuario?.name)} - ${chofer.usuario?.telefono || chofer.usuario?.celular || ''}`;
          selectChofer.appendChild(option);
      });
  } else {
      console.error("La variable 'conductores' (o 'choferes') no está definida o no es un array.");
  }
}


function llenarSelectChoferParaGuardar2() {
  const selectChofer = document.getElementById('selectChoferParaGuardar2');
  selectChofer.innerHTML = '<option value="">-- Seleccione un Chofer --</option>'; // Opción por defecto
  console.log(choferes)
  if (typeof choferes !== 'undefined' && Array.isArray(choferes)) {
       choferes.forEach((chofer, index) => {
          const option = document.createElement('option');
          // Guardar el ID del conductor o un índice, lo que uses para identificarlo
          option.value = chofer.usuario._id; // Usa _id si está disponible
          option.textContent = `${chofer.nombre || (chofer.usuario?.name)}`;
          selectChofer.appendChild(option);
      });
  } else {
      console.error("La variable 'conductores' (o 'choferes') no está definida o no es un array.");
  }
}

function mostrarContenedorMapaYCentrar(puntosRuta) {
  if (!mapaGoogle) initMap();
  if (!mapaGoogle) return; // Salir si aún no se inicializó

  // Limpiar marcadores/polilíneas anteriores si es necesario

  // Crear bounds para centrar
  const bounds = new google.maps.LatLngBounds();
  if (puntosRuta && puntosRuta.length > 0) {
     puntosRuta.forEach(punto => {
          if(punto.coordenadas) {
             bounds.extend(new google.maps.LatLng(punto.coordenadas.lat, punto.coordenadas.lng));
          }
      });
      mapaGoogle.fitBounds(bounds);
  }
  // Aquí podrías añadir lógica para dibujar marcadores para cada punto
  // y una polilínea conectándolos usando puntosRuta[i].coordenadas

  $('#mapaContainer').show(); // Mostrar el contenedor
}
