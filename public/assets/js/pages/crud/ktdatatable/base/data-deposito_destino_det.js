
var data = mov_deposito_destino;   // Asumimos que esto viene de tu backend
var paises = origenes;      // Si lo usas en otro lado, lo mantienes
console.log('la data', data);

/**
 * Función para agrupar las guías por país
 */
function agruparPorPais(data) {
  const paises = {};
  data.forEach(item => {
      const clave = item.pais_destina || '';  // Ajusta según tu modelo
      if (!paises[clave]) {
          paises[clave] = [];
      }
      paises[clave].push(item);
  });
  return paises;
}

// =============================
// 1) Convertir a array con índice
// =============================
var paisesAgrupados = agruparPorPais(data);  // { "Honduras": [...], "El Salvador": [...], ... }
console.log('paisesAgrupados', paisesAgrupados);

// Creamos un array de objetos: { i, pais, guias }
var entriesConIndices = Object.keys(paisesAgrupados).map((pais, index) => ({
  i: index, 
  pais,
  guias: paisesAgrupados[pais],
}));

console.log('entriesConIndices:', entriesConIndices);

// =============================
// 2) Configurar KTDatatable
// =============================
var KTDatatableRemoteAjaxDemo = function() {
  var demo = function() {

    // En vez de "Object.keys(paisesAgrupados)", usamos 'entriesConIndices'
    var datatable = $('#kt_datatable_deposito_destino').KTDatatable({
      data: {
        type: 'local',
        source: entriesConIndices,
        pageSize: 20,
      },

      layout: {
        scroll: true,
        footer: false,
      },

      sortable: true,
      pagination: true,
      search: {
        input: $('#kt_datatable_search_query'),
        key: 'generalSearch'
      },
      
      columns: [
        {
          field: 'acciones',
          title: 'Acciones',
          autoHide: false,
          template: function(row) {
            // row = { i, pais, guias }
            // row.pais => nombre del país
            // row.guias => array de items
            return `
              <div>
                <button class="btn btn-sm btn-primary toggle-guides"
                        data-index="${row.i}"
                        style="width: 200px;">
                  País: ${row.pais} - Cant= ${row.guias.length}
                </button>
                 
                <button class="btn btn-sm btn-secondary cambiar-estado ml-2"
                        data-index="${row.i}">
                  Cambiar Estados de Entrega
                </button>
                 <button class="btn btn-sm btn-dark imprimir-masivo"
                        data-index="${row.i}">
                  Imprimir Masivo
                  <i class="icon-xl la la-print"></i>
                </button>


                <button class="btn btn-sm btn-warning Exportar-Excel ml-1"  {/* Añadido ml-1 para un pequeño margen */}
                data-index="${row.i}">
                  Exportar Excel
                  <i class="icon-xl fas fa-file-excel"></i>
                </button>

                <button class="btn btn-sm btn-secondary Exportar-Excel2 ml-1"
                        data-index="${row.i}">
                  Exportar Excel Manifiesto
                  <i class="icon-xl fas fa-file-excel"></i>
                </button>


                 <button class="btn btn-sm btn-primary cambiar-container"
                            data-index="${row.i}"
                            data-toggle="modal"
                            data-target="#containerModal">
                      Cambiar de Deposito
                       <i class="icon-xl  fas fa-exchange-alt"></i>
                </button>


                  <button class="btn btn-sm btn-success cambiar-status"
                        data-index="${row.i}">
                  Notificar a Clientes
                 <i class="fas fa-phone icon-xl"></i>

                </button>
              </div>
              <div id="guia-${row.i}" class="guide-details" style="display: none;"></div>
            `;
          }
        }
      ],
    });
//  <button class="btn btn-sm btn-success enviar-notif"
//data-index="${row.i}">
//Notificar a todos
//<i class="icon-xl la fab la-whatsapp"></i>
//</button>


$(document).on('click', '.cambiar-container', function() {
  // Obtén el índice de la fila desde data-index
  var index = $(this).data('index');
  console.log(index)
  // Supongamos que entriesConIndices es un array global con la info de cada fila: { i, pais, guias }
  var row = entriesConIndices[index]; // Ejemplo: { i, pais, guias }
  
  // Construir el HTML para el listado de guías dentro del modal.
  // Se añade en cada checkbox un data-row-id extra, asumiendo que cada guía tiene un identificador en guia.guia._id.
  var html = `
    <div>
      <!-- Checkbox global para marcar/desmarcar todos -->
      <div class="mb-3">
        <input type="checkbox" id="selectAllContainer" checked>
        <label for="selectAllContainer">Marcar todos / Desmarcar todos</label>
        <!-- Botón para trasladar, que llama a la función de envío -->
        <button class="btn btn-primary" id="trasladarContainerBtn">
          Trasladar
        </button>
      </div>
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Marcar</th>
            <th>Guía</th>
            <th>Status</th>
            <th>Cant. Caja</th>
            <th>Dimensiones</th>
          </tr>
        </thead>
        <tbody>
          ${row.guias.map((guia, i) => {
           
            var detallesCaja = guia.detalles_caja || {};
            var statusDesc = obtenerDescripcionStatus(guia.guia.status); // Asegúrate de definir esta función
            // Se agrega data-row-id con el id de la guía
            return `
              <tr>
                <td>
                  <input type="checkbox" class="modal-guide-check" data-index="${i}" data-row-id="${guia._id}" checked>
                </td>
                <td>${guia.guia.nro_guia}</td>
                <td>${statusDesc}</td>
                <td>${guia.cant_caja}</td>
                <td>${detallesCaja.alto || ''} X ${detallesCaja.ancho || ''} X ${detallesCaja.largo || ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  // Inserta el HTML en el contenedor del modal
  $('#modalContainerContent').html(html);
  
  // Evento para el checkbox global: marcar/desmarcar todas las filas
  $('#selectAllContainer').on('change', function(){
    var checked = $(this).is(':checked');
    $('.modal-guide-check').prop('checked', checked);
  });
  
  // Evento para el botón "Trasladar"
  $('#trasladarContainerBtn').on('click', function(){
    // Captura el id del container desde el select
    var containerId = $('#kt_datatable_search_type').val();
    
    // Recopila los row IDs de las guías que están seleccionadas
    var selectedRowIds = [];
    $('.modal-guide-check:checked').each(function(){
      var rowId = $(this).data('row-id');
      if(rowId) selectedRowIds.push(rowId);
    });
    console.log(containerId);
    console.log(selectedRowIds);
    
    // Enviar datos a la API "api/cambiar_container_fisico"
    $.ajax({
      url: '/api/cambiar_de_deposito_destino',
      method: 'POST',
      data: {
        containerId: containerId,
        rowIds: selectedRowIds
      },
      success: function(response) {
        // Mostrar SweetAlert de éxito y refrescar la página al confirmar
        Swal.fire({
          icon: 'success',
          title: 'Operación realizada exitosamente',
          text: 'Los cambios se han aplicado correctamente.',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload();
          }
        });
      },
      error: function(err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al enviar datos: ' + err.responseText,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  });
  
  
  // Abre el modal (si no lo abre automáticamente)
  $('#containerModal').modal('show');
});


$('#kt_datatable_deposito_destino').on('click', '.cambiar-status', function() {
  const i = $(this).data('index'); // Obtiene el índice único de la fila/grupo
  
  // Validar que entriesConIndices y la entrada específica existan
  if (!window.entriesConIndices || !entriesConIndices[i] || !Array.isArray(entriesConIndices[i].guias)) {
      console.error("Error: No se pudo encontrar la información de las guías para el índice:", i, entriesConIndices);
      Swal.fire('Error Interno', 'No se pudo obtener la información de las guías. Por favor, recarga la página.', 'error');
      return;
  }

  const guiasParaNotificar = entriesConIndices[i].guias;
  const pais = entriesConIndices[i].pais; // Para el mensaje de Swal
  const statusTextoEstatico = 'En Bodega para Repartir a Cliente'; // Estado fijo

  console.log(`Preparando notificación para ${guiasParaNotificar.length} guías del país ${pais} con estado: "${statusTextoEstatico}"`);

  // 1. Recopilar la información necesaria (teléfono y número de guía) para cada guía
  const datosNotificaciones = guiasParaNotificar.map(item => {
      // Asegurarse de que 'item' y 'item.guia' existan
      if (!item || !item.guia) {
          console.warn("Item de guía inválido o sin propiedad 'guia':", item);
          return null; // Omitir este item si no tiene la estructura esperada
      }
      // Intentar obtener el teléfono del destinatario
      const telefono = item.guia.celular_remite;
      const nroGuia = item.guia.nro_guia;

      if (telefono && nroGuia) {
          return {
              telefonoCliente: telefono,
              nroGuia: nroGuia
              // No necesitamos enviar el statusTexto por cada uno si es el mismo para todos,
              // pero podríamos si la plantilla lo requiriera de forma individual.
          };
      } else {
          console.warn(`Guía ${nroGuia || 'desconocida'} omitida por falta de teléfono.`);
          return null; // Omitir si falta teléfono o número de guía
      }
  }).filter(item => item !== null); // Eliminar los nulos (guías omitidas)

  if (datosNotificaciones.length === 0) {
      Swal.fire('Información', 'No hay guías con información de contacto válida para notificar en este grupo.', 'info');
      return;
  }

  // 2. Confirmación antes de enviar (opcional pero recomendado)
  Swal.fire({
      title: '¿Confirmar Notificaciones?',
      text: `Se enviarán ${datosNotificaciones.length} notificaciones de WhatsApp con el estado: "${statusTextoEstatico}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Notificar a Todos',
      cancelButtonText: 'Cancelar'
  }).then((result) => {
      if (result.isConfirmed) {
          // 3. Enviar los datos al backend
          Swal.fire({ title: 'Procesando...', html: 'Enviando notificaciones...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

          $.ajax({
              url: '/api/notificar-clientes-status-masivo', // NUEVO ENDPOINT EN TU BACKEND
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                  notificaciones: datosNotificaciones, // Array de objetos {telefonoCliente, nroGuia}
                  statusTexto: statusTextoEstatico   // El estado que se aplicará a todos
              }),
              success: function(response) {
                  Swal.fire('¡Éxito!', response.message || 'Notificaciones programadas para envío.', 'success');
                  // No es necesario recargar la página a menos que el backend indique un cambio que lo requiera
              },
              error: function(jqXHR) {
                  Swal.fire('Error', jqXHR.responseJSON?.message || 'Ocurrió un error al procesar las notificaciones.', 'error');
              }
          });
      }
  });
});



    $('#kt_datatable_deposito_destino').on('click', '.enviar-notif', function() {
      const i = $(this).data('index');
      const row = entriesConIndices[i];
  
      console.log('Notificando a todos en:', row.pais, ' - Guías:', row.guias);
  
      const info_clientes = row.guias.map(g => ({
          telefonoRemite: g.guia?.celular_remite || '999999',
          telefonoDestina: g.guia?.celular_destina || '999999', // Obtener celular_destina si está disponible
          nombreRemite: g.guia?.nom_cliente_remite || 'Cliente',
          nombreDestina: g.guia?.nom_cliente_destina || 'Cliente', // Puedes ajustar el nombre del destinatario si lo necesitas
          guia: g.guia?.nro_guia || 'N/A'
      }));
  
      const payloadBase = {
          info_clientes
      };
  
      console.log('Payload a enviar:', payloadBase);
  
      const firstClient = info_clientes[0] || {}; // Asegúrate de que firstClient esté definido
  
      const mensajeTemplate = `
      Saludos estimado(a) ${firstClient.nombreRemite},
      
      Te informamos que tu envío se encuentra en centro de acopio de la ciudad destino.
      
      Recibirás nuevas notificaciones en el transcurso de los días.
      
      ¡Gracias por confiar en nosotros!`;
  
      const mensajeTemplate2 = `
      Saludos estimado(a) ${firstClient.nombreDestina},
      
      Te informamos que tu paquete se encuentra en centro de acopio de tu ciudad.
      
      ¡Gracias por confiar en nosotros!`;
  
      $('#mensajeEdicion').val(mensajeTemplate);
      $('#mensajeEdicion2').val(mensajeTemplate2);
  
      window.currentPayload = payloadBase;
  
      $('#mensajeModal').modal('show');
  });
  
    
    
    
    
    // Manejador para el botón "Enviar Notificación" del modal
    $('#btnEnviarNotificacion').on('click', async function() {
      // Obtenemos el mensaje editado del textarea
      const mensajeEditado = $('#mensajeEdicion').val();
      const mensajeEditado2 = $('#mensajeEdicion2').val();
      // Recuperamos el payload base guardado previamente
      const payload = window.currentPayload;
      // Asignamos el mensaje editado al payload
      payload.mensaje = mensajeEditado;
      payload.mensaje2 = mensajeEditado2;
      console.log('Payload a enviar:', payload);
    
      try {
        console.log('Payload a enviar:', payload);
    
        fetch('/enviar-mensajes3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            Swal.fire('¡Éxito!', data.message || 'Notificación enviada.', 'success');
          } else {
            Swal.fire('Error', data.message || 'No se pudo enviar la notificación.', 'error');
          }
        })
      } catch (error) {
        console.error('Error al enviar la notificación:', err);
            Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
      }
      
      
    
     
    });
    
    // =============================
    // 3) Input #contenido_bsucar (igual que tu lógica actual)
    /*
    $('#contenido_bsucar').on('input', function () {
      // Cancelar cualquier timer previo
      clearTimeout($(this).data('timer'));
    
      // Crear un nuevo timer de 500 ms
      const wait = setTimeout(() => {
        const valor = $(this).val().trim();
    
        // Verifica si hay una barra
        if (valor.includes('/')) {
          const partes = valor.split('/');
          const nro_guia = String(partes[0] || '').toUpperCase();
          let caja = partes[1] || '';
    
          // Si el valor de caja contiene un guion, separamos y tomamos la primera parte
          if (caja.includes('-')) {
            caja = caja.split('-')[0];
          }
    
          console.log('nro_guia:', nro_guia, 'caja:', caja);
          console.log('deposito:', deposito_destino);
    
          // Si no hay nro_guia o caja, avisa
          if (!nro_guia || !caja) {
            alert('El formato esperado es EJEMPLO: ABC123/1. ¡Faltan datos!');
            return;
          }
    
          // Realizamos la petición AJAX
          $.ajax({
            url: '/mov_deposito_destino/carga',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
              guia: nro_guia,
              cant_caja: caja,
              deposito_destino: deposito_destino, 
            }),
            success: function (response) {
              Swal.fire({
                title: '¡Éxito!',
                text: response.message || 'Operación realizada con éxito.',
                icon: 'success',
                timer: 500,                // 0.5 segundos
                showConfirmButton: false   // Oculta el botón de confirmación
              }).then(() => {
                // Una vez transcurrido el timer, recarga la página
                location.reload();
              });
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.error('Error AJAX:', jqXHR, textStatus, errorThrown);
    
              if (jqXHR.status === 404) {
                Swal.fire('Error', jqXHR.responseJSON?.message || 'La guía no existe o estado inválido.', 'error');
              } else if (jqXHR.status === 409) {
                Swal.fire('Error', jqXHR.responseJSON?.message || 'Ya existe un registro con esta info.', 'error');
              } else {
                Swal.fire('Error', jqXHR.responseJSON?.message || 'Ocurrió un problema inesperado.', 'error');
              }
            }
          });


        }
      }, 500); // Espera de 500 ms
    
      // Almacenar el timer en el elemento para poder cancelarlo en caso de nuevos inputs
      $(this).data('timer', wait);
    });
*/
$('#contenido_bsucar').on('input', function() {
  clearTimeout($(this).data('timer'));
  const valor = $(this).val();

  const wait = setTimeout(() => {
      procesarEntradaGuia(valor);
  }, 500);

  $(this).data('timer', wait);
});


/**
     * Orquesta todo el proceso: parseo, validación y ejecución de la carga.
     * @param {string} valorOriginal - El valor del campo de texto.
     */
async function procesarEntradaGuia(valorOriginal) {
  const { nro_guia, caja } = parsearGuiaYCaja(valorOriginal);
  
  console.log('Parseado -> nro_guia:', nro_guia, '| caja:', caja);

  if (!nro_guia) {
      alert('No se pudo determinar un Nro. de Guía válido del texto ingresado.');
      return;
  }

  // Se asume que la variable 'deposito_destino' está disponible globalmente.
  if (typeof deposito_destino === 'undefined') {
      console.error("La variable 'deposito_destino' no está definida.");
      alert("Error de configuración: El depósito de destino no ha sido establecido.");
      return;
  }
  
  console.log('Usando deposito_destino:', deposito_destino);
  
  const requiereFotos = true; // Condición para mostrar el modal de fotos.

  if (requiereFotos) {
      const urlsDeImagenes = await solicitarYSubirImagenes();
      realizarCargaDeposito(nro_guia, caja, deposito_destino, urlsDeImagenes);
  } else {
     const urlsDeImagenes = await solicitarYSubirImagenes();
      realizarCargaDeposito(nro_guia, caja, deposito_destino, []);
  }
}





 /**
     * Analiza el texto de entrada para extraer el número de guía y el número de caja.
     * @param {string} valorInput - El texto original del campo de entrada.
     * @returns {{nro_guia: string, caja: string}} Un objeto con la guía y la caja.
     */
 function parsearGuiaYCaja(valorInput) {
  let nro_guia = "";
  let caja = "1";

  if (valorInput && typeof valorInput === 'string') {
      const valorProcesar = valorInput.trim();
      if (valorProcesar !== "") {
          let relevantPart = valorProcesar;
          const urlPrefixes = [
              "https://sistematce.com/factura_chequeo/",
              "https://sistematce.com/factura_chequeo3/",
              "HTTPSÑ--SISTEMATCE.COM-FACTURA?CHEQUEO-",
          ];
          const lowerRelevantPartForPrefixCheck = relevantPart.toLowerCase();

          console.log("Texto a procesar (después de quitar prefijos):", lowerRelevantPartForPrefixCheck);
          for (const p of urlPrefixes) {
              if (lowerRelevantPartForPrefixCheck.startsWith(p.toLowerCase())) {
                  relevantPart = relevantPart.substring(p.length);
                  console.log('Coincidencia de prefijo encontrada, parte relevante ahora:', relevantPart);
                  break;
              }
          }

          let nro_guia_candidate = "";
          let caja_string_candidate = "";
          const partsRegex = /^([a-zA-Z0-9]+)[/-](.+)$/;
          const generalMatch = relevantPart.match(partsRegex);

          if (generalMatch) {
              nro_guia_candidate = generalMatch[1];
              caja_string_candidate = generalMatch[2];
          } else {
              if (/^[a-zA-Z0-9]+$/.test(relevantPart)) {
                  nro_guia_candidate = relevantPart;
              } else {
                  console.warn("Formato de entrada no reconocido después de quitar URL:", relevantPart);
              }
          }

          if (nro_guia_candidate && nro_guia_candidate.trim() !== "") {
              nro_guia = nro_guia_candidate.trim().toUpperCase();
          }

          if (caja_string_candidate && caja_string_candidate.trim() !== "") {
              let temp_caja_str = String(caja_string_candidate).trim().replace(/'/g, '-');
              const caja_partes = temp_caja_str.split('-');
              if (caja_partes[0] && caja_partes[0].trim() !== "") {
                  const matchNumeric = caja_partes[0].trim().match(/^\d+/);
                  if (matchNumeric) {
                      caja = matchNumeric[0];
                  }
              }
          }
      }
  }
  return { nro_guia, caja };
}






/**
     * Realiza la llamada AJAX final para registrar la carga en el depósito.
     * @param {string} guia - El número de guía.
     * @param {string} cant_caja - El número de caja.
     * @param {object} deposito_destino - El objeto del depósito destino.
     * @param {string[]} imagenes - Array de URLs de las imágenes.
     */


function realizarCargaDeposito(guia, cant_caja, deposito_destino, imagenes) {
  console.log('holaaaa')
  console.log(guia, cant_caja, deposito_destino, imagenes)

  $.ajax({
    url: '/mov_deposito_destino/carga',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      guia,
      cant_caja,
      deposito_destino,
      imagenes
    }),
    success: (response) => {
      // Verificar si es una respuesta de estado 15 (aunque no debería serlo)
      if (response.requiresConfirmation) {
        handleChoferConfirmation(response);
      } else {
        Swal.fire({
          title: '¡Éxito!',
          text: response.message || 'Operación realizada con éxito.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => location.reload());
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Error AJAX:', jqXHR, textStatus, errorThrown);
      
      // 1. Primero verificar el caso de confirmación de chofer
      if (jqXHR.status === 202 && jqXHR.responseJSON?.requiresConfirmation) {
        handleChoferConfirmation(jqXHR.responseJSON);
       return; // Salir inmediatamente
      }
      
      // 2. Manejar otros errores
      let errorMessage = jqXHR.responseJSON?.message || 'Ocurrió un problema inesperado.';
      
      // 3. Manejar caso de duplicados
      if (jqXHR.status === 409 && jqXHR.responseJSON?.data) {
        const fecha = new Date(jqXHR.responseJSON.data.fecha).toLocaleString();
        errorMessage = `<div><p>${errorMessage}</p><p class="mb-0"><strong>Depósito:</strong> ${jqXHR.responseJSON.data.deposito}</p><p><strong>Fecha:</strong> ${fecha}</p></div>`;
      }
    
      // 4. Mostrar error general SOLO si no es el caso 202
      Swal.fire({
        title: 'Error',
        html: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        willClose: () => {
          setTimeout(() => $('#contenido_bsucar').focus().select(), 100);
        }
      });
    }
  });
}



function handleChoferConfirmation(responseData) {
  const { movimientos, deposito_destino } = responseData;
  
  // Verificar si hay movimientos
  if (!movimientos || movimientos.length === 0) {
    Swal.fire('Error', 'No se encontraron movimientos para transferir', 'error');
    return;
  }

  // Crear lista de movimientos
  const movimientosList = movimientos.map(mov => 
    `<li>Guía: ${mov.nro_guia} - Caja: ${mov.cant_caja}</li>`
  ).join('');

  // Mostrar diálogo de confirmación persistente
  Swal.fire({
    title: 'Guía en poder de chofer',
    html: `<p>Las siguientes cajas están asignadas a un chofer:</p>
           <ul>${movimientosList}</ul>
           <p>¿Desea Devolverlas al depósito destino?</p>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, transferir',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,  // Evitar cerrar haciendo clic fuera
    allowEscapeKey: false,     // Evitar cerrar con ESC
    showLoaderOnConfirm: true,
    preConfirm: () => {
      // Preparar datos para la transferencia
      const movimientosIds = movimientos.map(mov => mov._id);
      
      return new Promise((resolve) => {
        $.ajax({
          url: '/api/regresar_chofer_destino',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            containerId: deposito_destino._id,
            rowIds: movimientosIds
          }),
          success: function(response) {
            resolve(response);
          },
          error: function(err) {
            Swal.showValidationMessage(
              `Error: ${err.responseJSON?.message || 'Error desconocido'}`
            );
            resolve(false);
          }
        });
      });
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: '¡Transferencia completada!',
        text: 'Las cajas han sido transferidas desde el chofer',
        icon: 'success'
      }).then(() => location.reload());
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Limpiar y enfocar el campo de búsqueda
      $('#contenido_bsucar').val('').focus();
    }
  });
}

function transferirDesdeChofer(guiaData) {
  $.ajax({
    url: '/api/regresar_chofer_destino',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      containerId: guiaData.deposito_destino._id,
      rowIds: [guiaData._id] // Usamos el ID de la guía como referencia
    }),
    success: function(response) {
      Swal.fire({
        title: '¡Transferencia completada!',
        text: `La guía ${guiaData.nro_guia} ha sido transferida desde el chofer`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => location.reload());
    },
    error: function(err) {
      Swal.fire('Error', 'No se pudo completar la transferencia: ' + err.responseText, 'error');
    }
  });
}

/**
     * Muestra un modal para que el usuario suba imágenes de evidencia.
     * @returns {Promise<string[]>} Una Promise con un array de URLs de las imágenes.
     */
function solicitarYSubirImagenes() {
  return Swal.fire({
      title: 'Agregar Evidencia Fotográfica',
      html: `
          <p>Toma o selecciona las fotos necesarias.</p>
          <button type="button" class="btn btn-primary" id="btnElegirFotos">
              <i class="fas fa-camera"></i> Seleccionar/Tomar Fotos
          </button>
          <input type="file" id="evidencia_files" multiple accept="image/*" style="display: none;">
          <div id="image_previews" class="mt-3" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;"></div>
      `,
      confirmButtonText: 'Confirmar y Enviar',
      showCancelButton: true,
      cancelButtonText: 'Omitir Fotos',
      allowOutsideClick: false,
      didOpen: () => {
          // Trigger botón para abrir file input
          $('#btnElegirFotos').on('click', () => {
              $('#evidencia_files').click();
          });
          // Preview al seleccionar
          $('#evidencia_files').on('change', function () {
              previsualizarImagenes(this);
          });
      },
      preConfirm: async () => {
          const fileInput = document.getElementById('evidencia_files');
          if (!fileInput.files.length) return [];

          Swal.showLoading();
          try {
              // Subir cada imagen secuencialmente (más seguro en móviles)
              let urls = [];
              for (let file of fileInput.files) {
                  // Opcional: Puedes comprimir imagen aquí antes de subir
                  let url = await subirUnaImagen(file);
                  urls.push(url);
              }
              return urls;
          } catch (e) {
              Swal.showValidationMessage("Falló la subida de una imagen. " + e);
              return null;
          }
      }
  }).then(result => {
      return (result.isConfirmed && result.value) ? result.value : [];
  });
}


/**
     * Sube un único archivo al servidor.
     * @param {File} file - El archivo a subir.
     * @returns {Promise<string>} La URL del archivo subido.
     */


function subirUnaImagen(file) {
  return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      fetch('/guardar-comprobante', {
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              resolve(data.fileUrl);
          } else {
              reject(data.message || 'Error en la subida.');
          }
      })
      .catch(err => {
          reject('Error de red al subir imagen');
      });
  });
}


/**
     * Muestra thumbnails de las imágenes seleccionadas en el input.
     * @param {HTMLInputElement} input - El input de tipo 'file'.
     */
function previsualizarImagenes(input) {
  const previewContainer = document.getElementById('image_previews');
  previewContainer.innerHTML = '';
  if (input.files) {
      Array.from(input.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = function(e) {
              const img = document.createElement('img');
              img.src = e.target.result;
              img.style.width = '80px';
              img.style.height = '80px';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '5px';
              previewContainer.appendChild(img);
          }
          reader.readAsDataURL(file);
      });
  }
}






    $(document).on('click', '.imprimir-masivo', function() {
      const index = $(this).data('index');
      const row = entriesConIndices[index];
      if (!row) {
        console.error('No se encontró la información para la fila con índice', index);
        return;
      }
      imprimir_todas_guias(row);
    });






    function imprimir_todas_guias(row) {
      // Generar un array de cadenas "nro_guia-cant_caja"
      const guiaCajaPairs = row.guias.map(guia => {
        const nro_guia = (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '';
        const caja = guia.cant_caja ? guia.cant_caja : '1';
        return `${nro_guia}-${caja}`;
      });
    
      // Filtrar los elementos vacíos
      const allPairs = guiaCajaPairs.filter(pair => pair.trim() !== '');
    
      // Definir el tamaño máximo de cada lote (50 ítems)
      const chunkSize = 50;
      let delay = 0; // Variable para espaciar las aperturas en milisegundos
    
      // Dividir el array en lotes y abrir una pestaña por cada lote
      for (let i = 0; i < allPairs.length; i += chunkSize) {
        const chunk = allPairs.slice(i, i + chunkSize);
        const guiasParam = chunk.join(',');
        const url = `/generate-multiplepdfsguias/${guiasParam}`;
        console.log('URL generada para impresión masiva:', url);
        
        // Espaciar cada apertura para evitar bloqueos del navegador (500ms de diferencia)
        setTimeout(() => {
          window.open(url, '_blank');
        }, delay);
        
        delay += 500;
      }
    }




    $('#kt_datatable_deposito_destino').on('click', '.cambiar-estado', function() {
      const i = $(this).data('index');
      const row = entriesConIndices[i]; // row = { i, pais, guias }
      console.log(row)
      // Construir contenido del modal: listado de nro_guia y selects combinados
      let modalContent = `<h5>Guías para ${row.pais}</h5>`;
      modalContent += `<ul class="list-group">`;
      
      // Declaramos listado_guia como variable modificable
     listado_guia = row.guias.map(guia => ({
        id: guia.guia._id,
        cant_caja: guia.cant_caja
    }));
    
      console.log('listado', listado_guia);
      
      row.guias.forEach((guia) => {
        // Agregamos data-id para identificar la guía
        modalContent += `
          <label class="list-group-item d-flex justify-content-between align-items-center agregar-etiqueta" data-id="${guia._id}">
            ${guia.guia.nro_guia}
          </label>
        `;
      });
      modalContent += `</ul>`;
      
      // Agregar dos selects: uno para los tipos únicos y otro para las etiquetas correspondientes
      modalContent += `
        <div class="form-group mt-3">
          <label for="tipoSelect">Selecciona Tipo</label>
          <select id="tipoSelect" class="form-control">
            <option value=""></option>
          </select>
        </div>
        <div class="form-group mt-3">
          <label for="etiquetaSelect">Selecciona Etiqueta</label>
          <select id="etiquetaSelect" class="form-control">
            <!-- Opción vacía al principio -->
            <option value=""></option>
          </select>
        </div>
      `;
      
      $('#cambiarEstadoModal .modal-body').html(modalContent);
      $('#cambiarEstadoModal').modal('show');
      
      // 1. Obtener los tipos únicos a partir del array "etiquetas"
      const uniqueTipos = [...new Set(etiquetas.map(e => e.tipo))];
      
      // 2. Llenar el select de tipos (una opción por cada tipo)
      const tipoOptions = `<option value=""></option>` + uniqueTipos
      .map(tipo => `<option value="${tipo}">${tipo}</option>`)
      .join('');
     $('#tipoSelect').html(tipoOptions);
      // Función para actualizar el select de etiquetas según el tipo seleccionado
      function actualizarEtiquetasPorTipo(tipoSeleccionado) {
        // Filtrar las etiquetas que coinciden con el tipo seleccionado
        const etiquetasFiltradas = etiquetas.filter(e => e.tipo === tipoSeleccionado);
        
        // Generar las opciones para el select de etiquetas, incluyendo el atributo data-color
        const etiquetaOptions = `<option value=""></option>` +
          etiquetasFiltradas
            .map(e => `<option value="${e.id || e.nombre}" data-color="${e.color}">${e.nombre}</option>`)
            .join('');
        $('#etiquetaSelect').html(etiquetaOptions);
        
        // Actualizar los colores de los labels según la opción inicial
        $('#etiquetaSelect').trigger('change');
      }
      
      // 3. Inicialmente, si existe al menos un tipo, actualizar el select de etiquetas con el primer tipo
      if (uniqueTipos.length > 0) {
        actualizarEtiquetasPorTipo(uniqueTipos[0]);
      }
      
      // 4. Al cambiar la selección de tipo, actualizar el select de etiquetas
      $('#tipoSelect').on('change', function() {
        const tipoSeleccionado = $(this).val();
        actualizarEtiquetasPorTipo(tipoSeleccionado);
      });
      
      // 5. Al cambiar la selección de etiqueta, actualizar el color de los labels (solo los que no están "desactivados")
      $('#etiquetaSelect').on('change', function() {
        const selectedColor = $(this).find(':selected').data('color');
        $('.agregar-etiqueta').not('.desactivado').css({
             'background-color': selectedColor,
             'color': '#fff'
        });
      });
      
      // 6. Manejar el click en cada label para togglear su estado
      $('#cambiarEstadoModal').on('click', '.agregar-etiqueta', function() {
        let $this = $(this);
        const id = $this.data('id');
        
        if ($this.hasClass('desactivado')) {
          // Si ya está en gris, quitar la clase y asignarle el color seleccionado
          $this.removeClass('desactivado');
          const selectedColor = $('#etiquetaSelect').find(':selected').data('color');
          $this.css({
             'background-color': selectedColor,
             'color': '#fff'
          });
          // Agregar el id de nuevo a listado_guia (si no está ya)
          if (!listado_guia.includes(id)) {
            listado_guia.push(id);
          }
        } else {
          // Si no está en gris, se pinta de gris y se remueve su id del listado
          $this.addClass('desactivado');
          $this.css({
             'background-color': '#ccc',
             'color': '#000'
          });
          listado_guia = listado_guia.filter(item => item !== id);
        }
        
        console.log('Actualizado listado_guia:', listado_guia);
      });
    });
    
    
    async function manejarClickAgregarImagen(boton) {
      const nroGuia = $(boton).data('nro-guia');
      const guiaId = $(boton).data('guia-id');
      const depositoNombre = deposito_destino.nombre || 'N/A';
    
      // Deshabilitar botón para evitar múltiples clics
      $(boton).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
      
      try {
        const urlsImagenes = await solicitarYSubirImagenes();
          console.log(urlsImagenes)
        if (urlsImagenes.length > 0) {
          // Solicitar observación
          const { value: observacion } = await Swal.fire({
            title: 'Confirmar Observación',
            input: 'textarea',
            inputLabel: `Observación para Guía Nro: ${nroGuia}`,
            inputPlaceholder: 'Escribe una observación...',
            inputValue: `Imagen(es) agregada(s) para caja en Depósito Destino ${depositoNombre}`,
            showCancelButton: true,
            confirmButtonText: 'Guardar Seguimiento',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => !value.trim() && 'La observación es requerida!'
          });
    
          if (observacion) {
            await enviarSeguimientoSoloImagen(guiaId, nroGuia, observacion, urlsImagenes);
          }
        } else {
          Swal.fire('Información', 'No se subieron imágenes.', 'info');
        }
      } catch (error) {
        console.error('Error en manejarClickAgregarImagen:', error);
        Swal.fire('Error', 'Ocurrió un problema: ' + error.message, 'error');
      } finally {
        // Restaurar botón
        $(boton).prop('disabled', false).html('<i class="icon-xl la la-image"></i>');
      }
    }



$(document).on('click', '.Exportar-Excel', function() {

  const index = $(this).data('index');
  
  exportRowToExcel(index);
  
  });
  
  
  
  $(document).on('click', '.Exportar-Excel2', function() {
  
  const index = $(this).data('index');
  
  exportRowToExcel2(index);
  
  });


  function exportRowToExcel2(index) {
    // Verificar que el índice sea válido
    if (!entriesConIndices || entriesConIndices.length <= index) {
      Swal.fire('Error', 'No hay datos para exportar.', 'error');
      return;
    }
  
    // Obtenemos los datos de la fila a exportar
    const rowData = entriesConIndices[index];
  
    // Mapear cada guía a un objeto con las propiedades requeridas
    const exportData = rowData.guias.map((guia, i) => {
      const detallesCaja = guia.detalles_caja || {}; // Asegurarse de que detallesCaja exista
  
      // Calcular Pie Cubico: suponiendo que las dimensiones están en pulgadas
      // 1 pie cúbico = 1728 in³
      const ancho = parseFloat(detallesCaja.ancho) || 0;
      const alto  = parseFloat(detallesCaja.alto)  || 0;
      const largo = parseFloat(detallesCaja.largo) || 0;
      const pCubico = (ancho && alto && largo)
        ? (ancho * alto * largo / 1728).toFixed(2)
        : '';
  
      return {
        Nro: i + 1,
        guia: (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
        'Nombre Remitente': guia.guia.nom_cliente_remite || '',
        'Nombre Destinatario': guia.guia.nom_cliente_destina || '',
        'Direccion Destinatario': guia.guia.direccion_destina || '',
        'Telefono': guia.guia.telefono_destina || '',
        'Movil': guia.guia.celular_destina || '',
        'Ciudad': (guia.guia.ciudad_destina && guia.guia.ciudad_destina[0])
                    ? (guia.guia.ciudad_destina[0].name || '')
                    : '',
        'Estado': (guia.guia.estado_destina && guia.guia.estado_destina[0])
                    ? (guia.guia.estado_destina[0].name || '')
                    : '',
        'Pais': (guia.guia.pais_destina && guia.guia.pais_destina[0])
                    ? (guia.guia.pais_destina[0].name || '')
                    : '',
        "Tamaño": `${detallesCaja.alto || ''} x ${detallesCaja.ancho || ''} x ${detallesCaja.largo || ''}`,
        // Pie Cubico no estaba en tu exportación original de manifiesto, pero lo calculaste. Lo añado por si acaso.
        // "P Cubico": pCubico, // Puedes descomentar esta línea si quieres incluirlo
        // Asegúrate que los campos que usa esta función 'exportRowToExcel2' (Manifiesto)
        // sean los correctos y estén disponibles en la estructura de 'guia.guia' y 'detallesCaja'
        // para los datos de tu SEGUNDA tabla.
      };
    });
  
    if (exportData.length === 0) {
      Swal.fire('Info', 'No hay guías con datos para exportar en esta fila.', 'info');
      return;
    }
  
    // Exportar a XLSX si la librería XLSX está definida; de lo contrario, exportar a CSV.
    if (typeof XLSX !== 'undefined') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Manifiesto"); // Nombre de hoja "Manifiesto"
      XLSX.writeFile(workbook, "manifiesto_guias_pais_" + rowData.pais.replace(/\s+/g, '_') + ".xlsx"); // Nombre de archivo más descriptivo
    } else {
      // Generar CSV como alternativa
      let csvContent = "data:text/csv;charset=utf-8,";
      const headers = Object.keys(exportData[0]).join(",") + "\n";
      csvContent += headers;
      exportData.forEach(obj => {
        const row = Object.values(obj).map(value => `"${String(value).replace(/"/g, '""')}"`).join(",");
        csvContent += row + "\n";
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "manifiesto_guias_pais_" + rowData.pais.replace(/\s+/g, '_') + ".csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  

    function exportRowToExcel(index) {
      if (!entriesConIndices || entriesConIndices.length <= index) {
        Swal.fire('Error', 'No hay datos para exportar.', 'error');
        return;
      }
    
      const rowData = entriesConIndices[index];
      const exportData = rowData.guias.map((guia, i) => {
        const detallesCaja = guia.detalles_caja || {};
    
        // ----- INICIO CAMBIO PARA COMPATIBILIDAD -----
        // Intenta acceder a seguimientos (plural) primero, luego a seguimiento (singular), o usa un array vacío
        const seguimientosArray = guia.seguimientos || guia.seguimiento || []; 
        // ----- FIN CAMBIO -----
    
        const tgTransporte = (seguimientosArray && seguimientosArray.length > 0)
          ? seguimientosArray[0].observacion // Asume que el primer seguimiento es el relevante
          : 'N/A';
    
        const tgPais = (seguimientosArray && seguimientosArray.length > 0)
          ? (() => {
              // Asegúrate que el filtro 'G transporte' sea correcto para ambas estructuras
              const segG = seguimientosArray.filter(s => s.estado && s.estado.tipo === 'G transporte');
              return segG.length > 0 ? segG[segG.length - 1].observacion : 'N/A'; // Último seguimiento de tipo 'G transporte'
            })()
          : 'N/A';
    
        let ancho = parseFloat(detallesCaja.ancho) || 0;
        let alto  = parseFloat(detallesCaja.alto)  || 0;
        let largo = parseFloat(detallesCaja.largo) || 0;
        let pCubico = (ancho && alto && largo) ? (ancho * alto * largo / 1728).toFixed(2) : '';
          
        return {
          Nro: i + 1,
          guia: (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
          caja: guia.cant_caja || '',
          Estado: guia.guia.status ? obtenerDescripcionStatus(guia.guia.status) : '', // Necesitas la función obtenerDescripcionStatus
          tg_pais: tgPais,
          tg_transporte: tgTransporte,
          Lb: detallesCaja.peso || '', // Añadido || '' por si no existe
          Ancho: detallesCaja.ancho || '',
          Alto: detallesCaja.alto || '',
          Largo: detallesCaja.largo || '',
          "P Cubico": pCubico,
          monto: (guia.guia && guia.guia.total_fac) ? `$${parseFloat(guia.guia.total_fac).toFixed(2)}` : ''
        };
      });
    
      if (exportData.length === 0) {
        Swal.fire('Info', 'No hay guías con datos para exportar en esta fila.', 'info');
        return;
      }
    
      if (typeof XLSX !== 'undefined') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
        XLSX.writeFile(workbook, "reporte_guias_pais_" + rowData.pais.replace(/\s+/g, '_') + ".xlsx"); // Nombre de archivo más descriptivo
      } else {
        // ... (tu código de fallback a CSV) ...
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = Object.keys(exportData[0]).join(",") + "\n";
        csvContent += headers;
        exportData.forEach(obj => {
            const row = Object.values(obj).map(value => `"${String(value).replace(/"/g, '""')}"`).join(","); // Mejor manejo de comas y comillas
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_guias_pais_" + rowData.pais.replace(/\s+/g, '_') + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    // Evento para el botón "Guardar Cambios" en el modal
    $('#guardarCambioEstado').on('click', function() {
      // Obtener la nota desde el input
      const nota = $('#notaInput').val() || '';
      // Obtener el tipo y la etiqueta seleccionados en los selects
      const tipoEtiqueta = $('#tipoSelect').val();
      const etiqueta = $('#etiquetaSelect').val();

      // Validar que se hayan seleccionado tipo y etiqueta, y que haya guías en listado
      if (!tipoEtiqueta || !etiqueta) {
        alert('Por favor, seleccione el tipo y la etiqueta.');
        return;
      }
     
      if ( listado_guia.length === 0) {
        console.log(listado_guia)
        alert('No hay guías seleccionadas.');
        return;
      }
      

      // Construir el payload a enviar
      const payload = {
        listado_guias: listado_guia, // Array de IDs de guías
        nota: nota,
        tipoEtiqueta: tipoEtiqueta,
        etiqueta: etiqueta,
       
      };

      // Llamada AJAX a la API
      $.ajax({
        url: '/api/agregar_etiquetas_guias/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: function(response) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: response.message || 'Se guardaron los movimientos de etiquetas correctamente.'
          }).then(() => {
            // Recarga la página o cierra el modal según tu necesidad
            location.reload();
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error en guardarCambioEstado:', errorThrown);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: jqXHR.responseJSON?.message || 'Error al guardar movimientos de etiquetas.'
          });
        }
      });
    });
    // =============================
    // 4) Evento .toggle-guides (usamos data-index en lugar de data-pais)
    // =============================
    $('#kt_datatable_deposito_destino').on('click', '.toggle-guides', function() {
      const i = $(this).data('index'); // índice
      const row = entriesConIndices[i]; // { i, pais, guias }

      const container = $(`#guia-${i}`);

      if (container.is(':visible')) {
        container.hide();
      } else {
        container.show();

        if (container.is(':empty')) {
          // row.guias => array de guías
          let detallesHTML = `
           <div class="table-responsive"> <span class="grT"> </span>
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guía</th>
                  <th>Referencia</th>
                  <th>Dimensiones (Alto x Ancho x Largo)</th>
                  <th>Caja Nro</th>
                  <th>TG Pais</th>
                  <th>TG Transporte</th>
                    <th>S Recogida</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${row.guias.map((guia, index) => {
                  const detallesCaja = guia.detalles_caja || {};
                  const tgTransporte = (guia.seguimiento && guia.seguimiento.length > 0)
                    ? `<a href="${guia.seguimiento[0].imagen}" target="_blank">
                         ${guia.seguimiento[0].observacion}
                       </a>`
                    : '';

                  const tgPais = (guia.seguimiento && guia.seguimiento.length > 0)
                    ? (() => {
                      const segG = guia.seguimiento.filter(s => s.estado && s.estado.tipo === 'G transporte');
                      return segG.length > 0 ? segG[segG.length - 1].observacion : '';
                    })()
                    : '';

                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${guia.guia.nro_guia}</td>
                      <td>${guia.guia.referencia1 }</td>
                      <td>${detallesCaja.alto } X 
                          ${detallesCaja.ancho} X
                          ${detallesCaja.largo}
                      </td>
                      <td>${guia.cant_caja}</td>
                      <td>${tgPais}</td>
                      <td>${tgTransporte}</td>
                       <td>${guia.guia.tipo_contenido}</td>
                      <td>${
                        guia.guia.total_fac 
                          ? parseFloat(guia.guia.total_fac).toFixed(2) 
                          : 'N/A'
                      }</td>
                      <td>
                        <a class="btn btn-sm btn-primary" title="Editar" 
                           href="/factura_guia/${guia.guia.nro_guia}" target="_blank">
                          <i class="icon-xl la la-file-invoice"></i>
                        </a>
                        <a class="btn btn-sm btn-primary" title="Entregar" 
                           href="/factura_guia_entrega/${guia.guia.nro_guia}/${guia.cant_caja}" target="_blank">
                          <i class="icon-xl la la-file-signature"></i>
                        </a>

                              <button class="btn btn-sm btn-info add-image-btn" 
                            title="Agregar imagen a seguimiento"
                            data-nro-guia="${guia.guia.nro_guia}" 
                            data-guia-id="${guia.guia._id}">
                        <i class="icon-xl la la-image"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            </div>
          `;
          container.html(detallesHTML);
        }
      }
    });


    // =============================
    // 5) #asignarGuiasBtn
    // =============================
    $('#asignarGuiasBtn').on('click', function() {
      const guiaIds = guias_asignar_trailer.map(guia => guia._id);
        console.log(guiaIds)
      if (guiaIds.length === 0) {
        alert('No hay guías para asignar.');
        return;
      }
      console.log('Guía IDs a asignar:', guiaIds);

      $.ajax({
        url: '/transfer-deposito-containerV3',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
          guias: guiaIds, 
          deposito : deposito_destino,
          container_fisico : conductor_carga,
          
        }),
        success: function(response) {
          Swal.fire({
            title: '¡Éxito!',
            text: response.message || 'La guía ha sido asignada a este Deposito.',
            icon: 'success',
            timer: 1000,            // 1 segundo = 1000 ms
            showConfirmButton: false
          }).then((result) => {
            // Si el cierre fue por el temporizador, recargamos
            if (result.dismiss === Swal.DismissReason.timer) {
              location.reload();
            }
          });
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error('Error AJAX:', jqXHR, textStatus, errorThrown);

          if (jqXHR.status === 404) {
            Swal.fire('Error', 'La guía no existe o estado inválido.', 'error');
          } else if (jqXHR.status === 409) {
            Swal.fire('Error', 'La guía ya fue registrada previamente en un tráiler.', 'error');
          } else {
            Swal.fire('Error', 'Ocurrió un problema inesperado.', 'error');
          }
        }
      });
    });


    // =============================
    // 6) #kt_datatable_search_type2
    // =============================
    $('#kt_datatable_search_type2').on('change', function() {
      const userId = $(this).val();
      console.log('Usuario seleccionado:', userId);

      $('#loadingSpinner').show();
      $('#lista_agencias_disponibles').empty();
      
      $.ajax({
        url: '/api/continer_fisico/' + userId,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
          console.log(response);
          const responseGuias = response.guias; 
          conductor_carga = userId; 
          console.log('Guías filtradas:', responseGuias);

          guias_asignar_trailer = responseGuias;
          $('#loadingSpinner').hide();

          if (responseGuias.length === 0) {
            $('#lista_agencias_disponibles').append('<li>No hay guías para este Container.</li>');
          } else {
            responseGuias.forEach((guia) => {
              $('#lista_agencias_disponibles').append(`
                <li data-id="${guia._id}" 
                    style="padding: 10px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
                  <span style="font-weight: bold; color: #333;">Nro Guía:</span> ${guia.nro_guia}<br>
                  <span style="font-weight: bold; color: #555;">Remitente:</span> ${guia.nom_cliente_remite}
                </li>
              `);
            });

            if (responseGuias.length > 0) {
              $('#asignarGuiasBtnContainer').show();
            } else {
              $('#lista_agencias_disponibles').append(`
                <li style="padding: 10px 15px; text-align: center; color: #888;">
                  No hay guías disponibles.
                </li>
              `);
            }
          }
        },
        error: function(err) {
          $('#loadingSpinner').hide();
          console.error('Error al obtener guías:', err);
          $('#lista_agencias_disponibles').append('<li>Error al cargar guías.</li>');
        }
      });
    });


    // Asegúrate de que esta función esté definida en un ámbito global,
// o que sea accesible desde el global (ej. window.manejarClickAgregarImagen = function...)


$('#kt_datatable_deposito_destino').on('click', '.add-image-btn', function() {
  manejarClickAgregarImagen(this);
});

  
  // Nueva función para enviar solo el seguimiento con la imagen
  async function enviarSeguimientoSoloImagen(guiaId, nroGuia, observacion, urlsImagenes) {
      Swal.fire({
          title: 'Guardando Seguimiento...',
          text: 'Enviando los datos al servidor.',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
      });
  
      try {
          const response = await fetch('/api/agregar-seguimiento-imagen', { // NUEVO ENDPOINT
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  guiaId: guiaId,
                  nro_guia: nroGuia,
                  observacion: observacion,
                  imagenes: urlsImagenes
              })
          });
  
          const result = await response.json();
          Swal.close();
  
          if (response.ok && result.success) {
              Swal.fire('¡Éxito!', result.message || 'Imágenes y seguimiento guardados correctamente.', 'success');
              // Puedes recargar la sección o solo el elemento de la guía para mostrar el seguimiento si la UI lo permite
              // For example, trigger a refresh of the main report if desired:
              // $('#generarReporteBtn').trigger('click');
          } else {
              Swal.fire('Error', result.message || 'No se pudo guardar el seguimiento con las imágenes.', 'error');
          }
      } catch (error) {
          Swal.close();
          console.error('Error al enviar seguimiento de imagen:', error);
          Swal.fire('Error de Red', 'No se pudo conectar con el servidor para guardar el seguimiento.', 'error');
      }
  }


  }; // fin demo()

  return {
    init: function() {
      demo();
    },
  };
}(); // fin KTDatatableRemoteAjaxDemo

jQuery(document).ready(function() {
  KTDatatableRemoteAjaxDemo.init();
});

