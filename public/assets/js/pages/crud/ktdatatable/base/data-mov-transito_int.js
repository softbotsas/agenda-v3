
var data = movTransitoInte;   
var paises = origenes;  
var globalPayload = {};
var listado_guia = []
let selectedGuias = [];
function agruparPorPais(data) {
  const paises = {};
  data.forEach(item => {
      const clave = item.pais_destina || '';  
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
    var datatable = $('#kt_datatable_chofer_destino').KTDatatable({
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
            return `
              <div class="d-flex align-items-center">
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
                Imprimir Guia de Entrega Masivo
                <i class="icon-xl la la-print"></i>
              </button>
                   <button class="btn btn-sm btn-primary cambiar-container"
                            data-index="${row.i}"
                            data-toggle="modal"
                            data-target="#containerModal">
                      Cambiar de Chofer
                       <i class="icon-xl  fas fa-exchange-alt"></i>
                    </button>


               <button class="btn btn-sm btn-success cambiar-status"
                        data-index="${row.i}">
                  Notificar a Clientes
                 <i class="fas fa-phone icon-xl"></i>

                </button>

                

                 <button class="btn btn-sm btn-warning regresar"
                            data-index="${row.i}"
                            data-toggle="modal"
                            data-target="#containerModal2">
                     Regresar a Desposito
                        <i class="fas  fa-chevron-left icon-xl"></i>
                    </button>
                
              </div>
              <div id="guia-${row.i}" class="guide-details" style="display: none;"></div>
            `;
          }
        },
        
        
      ],
    });
// <button class="btn btn-sm btn-success enviar-notif"
//data-index="${row.i}">
//Notificar a todos
//<i class="icon-xl la fab la-whatsapp"></i>
//</button>


$('#kt_datatable_chofer_destino').on('click', '.cambiar-status', function() {
  const i = $(this).data('index'); // Obtiene el índice único de la fila/grupo
  alert('hola')
  // Validar que entriesConIndices y la entrada específica existan
  if (!window.entriesConIndices || !entriesConIndices[i] || !Array.isArray(entriesConIndices[i].guias)) {
      console.error("Error: No se pudo encontrar la información de las guías para el índice:", i, entriesConIndices);
      Swal.fire('Error Interno', 'No se pudo obtener la información de las guías. Por favor, recarga la página.', 'error');
      return;
  }

  const guiasParaNotificar = entriesConIndices[i].guias;
  const pais = entriesConIndices[i].pais; // Para el mensaje de Swal
  const statusTextoEstatico = 'En Camion para Repartir a Cliente'; // Estado fijo

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




$(document).on('click', '.cambiar-container', function() {
  // Obtén el índice de la fila desde data-index
  var index = $(this).data('index');
  console.log(index)
  console.log('hello', entriesConIndices)
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
      url: '/api/cambiar_chofer_destino',
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


$(document).on('click', '.regresar', function() {
  // Obtén el índice de la fila desde data-index
  var index = $(this).data('index');
  console.log(index)
  console.log('hello', entriesConIndices)
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
        <button class="btn btn-primary" id="trasladarContainerBtn2">
          Regresar Cajas
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
  $('#modalContainerContent2').html(html);
  








  // Evento para el checkbox global: marcar/desmarcar todas las filas
  $('#selectAllContainer').on('change', function(){
    var checked = $(this).is(':checked');
    $('.modal-guide-check').prop('checked', checked);
  });
  
  // Evento para el botón "Trasladar"
  $('#trasladarContainerBtn2').on('click', function(){
    // Captura el id del container desde el select
    var containerId = $('#kt_datatable_search_type2').val();
    
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
      url: '/api/regresar_chofer_destino',
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
  $('#containerModal2').modal('show');
});

    function llenarSelectsTipoEtiqueta() {
      const uniqueTipos = [...new Set(etiquetas.map(e => e.tipo))];
      const tipoOptions = `<option value=""></option>` + uniqueTipos
        .map(tipo => `<option value="${tipo}">${tipo}</option>`)
        .join('');
      $('#tipoSelect1').html(tipoOptions);
    
      // Al cambiar el select "tipo", llenamos "etiqueta"
      $('#tipoSelect1').on('change', function() {
        const tipoSel = $(this).val();
        const etiquetasFiltradas = etiquetas.filter(e => e.tipo === tipoSel);
        const etiquetaOptions = `<option value=""></option>` +
          etiquetasFiltradas
            .map(e => `<option value="${e.id || e.nombre}" data-color="${e.color}">${e.nombre}</option>`)
            .join('');
        $('#etiquetaSelect1').html(etiquetaOptions);
      });
    }
    
  $('#kt_datatable_chofer_destino').on('click', '.cambiar-estado', function() {
      const i = $(this).data('index');
      const row = entriesConIndices[i]; // row = { i, pais, guias }
   
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
    // 3) Input #contenido_bsucar (igual que tu lógica actual)
    // =============================
 
    $('#contenido_bsucar').on('input', function () { // Asegúrate de que este selector sea el correcto para el segundo input si es diferente
      // Cancelar cualquier timer previo
      clearTimeout($(this).data('timer'));
    
      // Crear un nuevo timer
      const wait = setTimeout(() => {
        const valorOriginal = $(this).val(); // Obtener el valor del input
        let nro_guia = ""; // Variable final para el número de guía
        let caja = "1";   // Variable final para la caja, con "1" como valor por defecto
    
        if (valorOriginal && typeof valorOriginal === 'string') {
            const valorProcesar = valorOriginal.trim();
    
            if (valorProcesar !== "") { // Solo procesar si no está vacío después de trim
                let relevantPart = valorProcesar;
    
                // 1. Eliminar prefijos de URL conocidos (insensible a mayúsculas/minúsculas)
                //    Usa la misma lista de prefijos que en tu otra función para consistencia.
                const urlPrefixes = [
                    "https://sistematce.com/factura_chequeo/",
                    "https://sistematce.com/factura_chequeo3/",
                    "HTTPSÑ--SISTEMATCE.COM-FACTURA?CHEQUEO-", // Manteniendo el prefijo que añadiste
                    // Puedes añadir más prefijos aquí si es necesario
                ];
                const lowerRelevantPartForPrefixCheck = relevantPart.toLowerCase();
                for (const p of urlPrefixes) {
                    if (lowerRelevantPartForPrefixCheck.startsWith(p.toLowerCase())) {
                        relevantPart = relevantPart.substring(p.length); // Quita el prefijo de la cadena original
                        console.log('Prefijo URL encontrado y eliminado. Parte relevante:', relevantPart);
                        break; // Asumimos que solo un prefijo coincidirá
                    }
                }
                // Ahora, relevantPart contiene algo como "GTM245000014/1-1", "GTM245000014-1'2", o "GTM245000014"
    
                // 2. Intentar extraer nro_guia y la parte de la caja
                let nro_guia_candidate = "";
                let caja_string_candidate = "";
    
                const partsRegex = /^([a-zA-Z0-9]+)[/-](.+)$/; // Captura (guia)(separador / o -)(caja_string)
                const generalMatch = relevantPart.match(partsRegex);
    
                if (generalMatch) {
                    nro_guia_candidate = generalMatch[1];
                    caja_string_candidate = generalMatch[2];
                } else {
                    // No se encontró el patrón GUIA/CAJA.
                    // Si es puramente alfanumérico, asumimos que es la guía.
                    if (/^[a-zA-Z0-9]+$/.test(relevantPart)) {
                        nro_guia_candidate = relevantPart;
                        // caja_string_candidate permanece vacía, 'caja' usará el default "1".
                    } else {
                        console.warn("Formato de entrada no reconocido después de quitar URL (para /mov_chofer_destino):", relevantPart);
                    }
                }
                
                // 3. Finalizar nro_guia: asegurarse de que exista y convertir a mayúsculas
                if (nro_guia_candidate && nro_guia_candidate.trim() !== "") {
                    nro_guia = nro_guia_candidate.trim().toUpperCase();
                }
    
                // 4. Finalizar caja: normalizar (' a -), tomar la primera parte antes de un guion,
                //    extraer solo la parte numérica inicial, y si no, usar el default "1".
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
    
        // ---- Lógica AJAX específica para /mov_chofer_destino/carga ----
        console.log('Parseado (para chofer) -> nro_guia:', nro_guia, '| caja:', caja);
        // La variable 'chofer' debe estar definida en este scope.
        // Ejemplo: const chofer = obtenerChoferSeleccionado(); 
        // Si 'chofer' no está definida, la llamada AJAX fallará o enviará undefined.
        console.log('Usando chofer:', (typeof chofer !== 'undefined' ? chofer : 'NO DEFINIDO'));
    
    
        // Si no se pudo determinar un nro_guia, no continuar.
        // El código original también verificaba !caja, pero nuestra nueva lógica asegura que 'caja' sea al menos "1".
        if (!nro_guia) {
          alert('El formato esperado es EJEMPLO: GTM123/1 o una URL completa. No se pudo determinar la guía.');
          return; // Salir del callback del setTimeout
        }
    
        // Realizamos la petición AJAX
        $.ajax({
          url: '/mov_chofer_destino/carga', // URL específica para este handler
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ 
            guia: nro_guia,
            cant_caja: caja,
            chofer : chofer, // Asegúrate que la variable 'chofer' esté disponible y tenga el valor correcto aquí
          }),
          success: function (response) {
            Swal.fire({
              title: '¡Éxito!',
              text: response.message || 'Operación realizada con éxito.',
              icon: 'success',
              timer: 3000,           // Cierra automáticamente después de 3 segundos
              timerProgressBar: true, // Muestra barra de progreso
              showConfirmButton: false // Oculta el botón de confirmación
            }).then(() => {
              location.reload(); // Recarga cuando el timer termina
            });
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error AJAX (/mov_chofer_destino):', jqXHR.responseText);
            let errorMessage = jqXHR.responseJSON?.message || 'Ocurrió un problema inesperado.';
        
            // --- INICIO DE LA LÓGICA CORREGIDA ---
        
            if (jqXHR.status === 409) { // Si es un error de Conflicto...
                // Mostramos el diálogo de confirmación para reasignar
                Swal.fire({
                    title: 'Conflicto de Asignación',
                    html: `La guía <strong>${nro_guia}</strong> ya está asignada.<br>¿Deseas forzar la reasignación a este nuevo destino?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, reasignar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Si el usuario confirma, llamamos a la función de reasignación
                        forzarReasignacion(nro_guia, chofer);
                    }
                });
                
                return; // ¡IMPORTANTE! Salimos de la función aquí para no mostrar el otro error.
            }
            
            // Si es otro tipo de error (ej. 404), ajustamos el mensaje
            if (jqXHR.status === 404) {
                errorMessage = jqXHR.responseJSON?.message || 'La guía no existe o el estado es inválido.';
            }
        
            // Y solo si no fue un 409, mostramos el popup de error genérico
            Swal.fire('Error', errorMessage, 'error');
        }
        });
        
      }, 500); // Espera de 500 ms
    
      // Almacenar el timer en el elemento para poder cancelarlo en caso de nuevos inputs
      $(this).data('timer', wait);
    });



    function forzarReasignacion(guia, nuevoChoferId) {
      Swal.fire({
          title: 'Reasignando...',
          text: 'Por favor espera.',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });
  
      $.ajax({
          url: '/api/forzar_reasignacion_chofer', // La nueva ruta que creamos
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              nro_guia: guia,
              nuevoChoferId: nuevoChoferId
          }),
          success: function(response) {
            Swal.fire({
              icon: 'success',
              title: '¡Reasignado!',
              text: response.message,
              timer: 3000, // El popup se cerrará después de 3000 milisegundos (3 segundos)
              timerProgressBar: true, // Muestra una barra de progreso en la parte inferior
              showConfirmButton: false // Oculta el botón de "OK"
          }).then(() => {
              // Esta parte se ejecuta después de que el timer termina
              location.reload();
          });
          },
          error: function(jqXHR) {
              const errorMessage = jqXHR.responseJSON?.message || 'No se pudo completar la reasignación.';
              Swal.fire('Error', errorMessage, 'error');
          }
      });
  }

    // =============================
    // 4) Evento .toggle-guides (usamos data-index en lugar de data-pais)
    // =============================
    $('#kt_datatable_chofer_destino').on('click', '.toggle-guides', function() {
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
            <th>Sel.</th>
            <th>#</th>
            <th>Guía</th>
            <th>Status Destino</th>
            <th>Status Guía</th>
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
              ? `<a href="${guia.seguimiento[0].imagen}" target="_blank">${guia.seguimiento[0].observacion}</a>`
              : 'N/A';
      
            const tgPais = (guia.seguimiento && guia.seguimiento.length > 0)
              ? (() => {
                  const segG = guia.seguimiento.filter(s => s.estado && s.estado.tipo === 'G transporte');
                  return segG.length > 0 ? segG[segG.length - 1].observacion : 'N/A';
                })()
              : 'N/A';
      

              
            // Si la guía tiene status=17, mostramos la checkbox
            const checkEntrega = 
               `<input type="checkbox" class="checkbox-entrega" 
                         data-id_guia="${guia.guia._id}" 
                         data-nro_guia="${guia.guia.nro_guia}" 
                         data-id_mov="${guia._id}" 
                         data-cant_caja="${guia.cant_caja}"
                         style="transform: scale(1.4); margin-top: 2px;" />`
              ;
      
            // Construir las etiquetas (sin evento click en este ejemplo)
            let etiquetasHtml = '';
            if (guia.etiquetasGuia && guia.etiquetasGuia.length > 0) {
              etiquetasHtml = guia.etiquetasGuia.map(et => {
                const match = etiquetas.find(e => e.nombre === et.etiqueta);
                const color = match ? match.color : '#000000';
                return `<span class="label label-inline label-light-success font-weight-bold"
                               style="background-color: ${color}; color: #fff; margin-right: 5px;">
                            ${et.etiqueta}
                        </span>`;
              }).join('');
            }
      
            // Status de la guía
            const status_guia = (guia.guia && guia.guia.status) ? obtenerDescripcionStatus(guia.guia.status) : '';
      
            // Determinar si la fila debe ser roja (status == '17')
            const filaRoja = (guia.guia && guia.guia.status == '17')
              ? "style='background-color: #f8d7da; color: #000;'"
              : "";
      
            return `
              <tr ${filaRoja}>
                <td>${checkEntrega}</td>
                <td>${index + 1}</td>
                <td>${guia.guia.nro_guia}</td>
                <td></td>
                <td>${status_guia}</td>
                <td>${detallesCaja.alto || 0} X ${detallesCaja.ancho || 0} X ${detallesCaja.largo || 0}</td>
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
    
/*
    $('#confirmarEntrega').on('click', function() {
      // Recolectar todas las guías seleccionadas
      let listado_guias = [];
      $('.checkbox-entrega:checked').each(function() {
        let id_guia  = $(this).data('id_guia');
        let nro_guia = $(this).data('nro_guia');
        let mov = $(this).data('id_mov');
        listado_guias.push({
          id_guia,
          nro_guia,
          mov
        });
      });
    
      if (listado_guias.length === 0) {
        Swal.fire({
          title: 'Sin selección',
          text: 'No has seleccionado ninguna guía para confirmar entrega.',
          icon: 'warning'
        });
        return;
      }
    
      // Enviar la solicitud a la API con listado_guias
      fetch('/api/entregar_paquete2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listado_guias })  // <-- Empaquetar en un objeto
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
           
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
            
          } else {
            Swal.fire({
              title: 'Error',
              text: result.message || 'No se pudo entregar el paquete.',
              icon: 'error'
            });
          }
        })
        .catch(error => {
          console.error('Error en API entregar paquete:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al entregar el paquete.',
            icon: 'error'
          });
        });
    });
  */
 
    $('#confirmarEntrega').on('click', function() {
      // Recolectar las guías seleccionadas (checkbox)
      let selectedGuias = [];
      $('.checkbox-entrega:checked').each(function() {
        let id_guia  = $(this).data('id_guia');
        let nro_guia = $(this).data('nro_guia');
        let mov      = $(this).data('id_mov');
        let cant_caja =$(this).data('cant_caja');
        selectedGuias.push({ id_guia, nro_guia, mov, cant_caja });
      });
    
      if (selectedGuias.length === 0) {
        Swal.fire({
          title: 'Sin selección',
          text: 'No has seleccionado ninguna guía.',
          icon: 'warning'
        });
        return;
      }
    
      // Guardamos en el globalPayload
      globalPayload.listado_guias = selectedGuias;
    
      // Abrir el primer modal (con nota, comentario, etc.)
      $('#cambiarEstadoModal1').modal('show');
      llenarSelectsTipoEtiqueta()
    });

    $('#guardarCambioEstado1').on('click', function() {
      // Leer campos del primer modal
      const nota = $('#notaInput1').val() || '';
      const comentario = $('#comentarioEstatus1').val() || '';
      const tipoEtiqueta = $('#tipoSelect1').val() || '';
      const etiqueta = $('#etiquetaSelect1').val() || '';
    
      // Validar
      if (!tipoEtiqueta || !etiqueta) {
        Swal.fire({
          icon: 'warning',
          title: 'Falta completar',
          text: 'Por favor, selecciona Tipo y Etiqueta.'
        });
        return;
      }
    
      // Guardar en globalPayload
      globalPayload.nota = nota;
      globalPayload.tipoEtiqueta = tipoEtiqueta;
      globalPayload.etiqueta = etiqueta;
    
      // Cerrar modal 1
      $('#cambiarEstadoModal1').modal('hide');
    
      // Abrir modal 2
      $('#exampleModalScrollable33a').modal('show');
    });
    
    $('#guardar_seguimiento2a').on('click', function() {
      //e.preventDefault(); // No recargues la página
      // OJO: si tu button es type="submit", tendrás que usar
      // el evento del form: $('#guiaForm3').on('submit', function(e){...})
    
      // 1) Leer los campos del segundo modal
      globalPayload.segui_nro_guia     = $('#segui_nro_guiaA').val() || '';
      globalPayload.segui_fecha       = $('#segui_fechaA').val() || '';
      globalPayload.segui_visual      = $('#segui_visualA').val() || '';
      globalPayload.segui_estado      = $('#segui_estadoA').val() || '';
      globalPayload.segui_observacion = $('#segui_observacionA').val() || '';
      globalPayload.segui_imagen      = $('#imagen_seguiA').val() || '';
    


    
      
      fetch('/api/entregar_paquete2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalPayload)
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            Swal.fire({
              title: '¡Éxito!',
              text: result.message || 'Operación realizada con éxito.',
              icon: 'success',
              timer: 500,
              showConfirmButton: false
            }).then(() => {
              location.reload();
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: result.message || 'No se pudo entregar el paquete.',
              icon: 'error'
            });
          }
        })
        .catch(error => {
          console.error('Error al entregar paquete:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al entregar el paquete.',
            icon: 'error'
          });
        });


        
    });
    



    window.handleFileChange2 = function(event) {
      const file = event.target.files[0];
      if (!file) return;
    
      console.log('Archivo seleccionado:', file);
    
      // Crear FormData (multipart/form-data)
      const formData = new FormData();
      // La clave 'file' es la misma usada en upload.single('file')
      formData.append('file', file);
    
      // Opcional: Mostrar un SweetAlert de "Cargando"
      Swal.fire({
        title: 'Subiendo archivo...',
        text: 'Por favor, espere.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    
      // Enviar al servidor con fetch
      fetch('/guardar-comprobante', {
        method: 'POST',
        body: formData // <-- Importante: no setear content-type manual
      })
        .then(response => response.json())
        .then(data => {
          // Cerrar el SweetAlert de carga
          Swal.close();
    
          if (data.success) {
            // data.fileUrl lo provee el backend como la ubicación del archivo subido
            const imagen_nueva = data.fileUrl;
            console.log('Archivo subido en:', imagen_nueva);
    
            // Asignar al input hidden si lo necesitas
            const inputImagenSegui = document.getElementById('imagen_segui');
            if (inputImagenSegui) {
              inputImagenSegui.value = imagen_nueva;
            }
    
            // Alert de éxito
            Swal.fire({
              title: "Imagen Subida!",
              text: "Continúa registrando tus seguimientos!",
              icon: "success",
            });
          } else {
            console.error("Error al subir la imagen:", data.message);
            Swal.fire({
              title: "Error al subir la imagen",
              text: data.message || "Ocurrió un problema al subir el archivo.",
              icon: "error",
            });
          }
        })
        .catch(error => {
          // Manejo de error en fetch
          console.error('Error en la solicitud de subida:', error);
          Swal.fire({
            title: "Error",
            text: "Ocurrió un problema al subir el archivo.",
            icon: "error",
          });
        });
    };

    function obtenerDescripcionStatus(status) {
      switch(status) {
        case "-1":
          return "Por LLevar a agencia";
        case "1":
          return "Espera de Conductor";
        case "2":
          return "En Transito Local";
        case "2-2":
          return "En Trailer";
        case "3":
          return "En Transito Cedis";
        case "4":
          return "En Cedis";
        case "5":
          return "En Container Fisico";
        case "6":
          return "En Bodega Para Su Distribucion";
        case "7":
          return "En Transito Destino";
        case "8":
          return "Anulada";
        case "10":
          return "1 Transito Aduana De Destino";
        case "11":
          return "1-Recibida En Frontera Mx";
        case "12":
          return "2 Tramites Aduanales";
        case "12-2":
          return "2 Tramites Aduanales Escala HND";
        case "13":
          return "3 Revision Aduanal";
        case "14":
          return "4 En Bodega Para Su Distribucion";
        case "15":
          return "5 En Proceso De Entrega";
        case "16":
          return "6 Entregado";
          case "17":
          return "Entrega Notificada";
        default:
          return "Estado desconocido";  // Para cualquier otro valor no previsto
      }
    }
      

    $('#kt_datatable_chofer_destino').on('click', '.enviar-notif', function() {
      const i = $(this).data('index');
      const row = entriesConIndices[i];
  
      console.log('Notificando a todos en:', row.pais, ' - Guías:', row.guias);
  
      const info_clientes = row.guias.map(g => ({
          telefonoRemite: g.guia?.celular_remite ,
          telefonoDestina: g.guia?.celular_destina , // Obtener celular_destina si está disponible
          nombreRemite: g.guia?.nom_cliente_remite ,
          nombreDestina: g.guia?.nom_cliente_destina, // Puedes ajustar el nombre del destinatario si lo necesitas
          guia: g.guia?.nro_guia || 'N/A'
      }));
  
      const payloadBase = {
          info_clientes
      };
  
      
  
      const firstClient = info_clientes[0] || {}; // Asegúrate de que firstClient esté definido
  
      const mensajeTemplate = `
      Saludos estimado(a) ${firstClient.nombreRemite},
      
      Te informamos que tu envío se encuentra en transito en la ciudad destino.
      
      Recibirás nuevas notificaciones en el transcurso de los días.
      
      ¡Gracias por confiar en nosotros!`;
  
      const mensajeTemplate2 = `
      Saludos estimado(a) ${firstClient.nombreDestina},
      
      Te informamos que tu paquete se encuentra en transito en tu ciudad.
      
      ¡Gracias por confiar en nosotros!`;
  
      $('#mensajeEdicion').val(mensajeTemplate);
      $('#mensajeEdicion2').val(mensajeTemplate2);
  
      window.currentPayload = payloadBase;
      console.log('modal para a enviar:');
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
        url: '/transfer-deposito-containerV4',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
          guias: guiaIds, 
          deposito_destino : conductor_carga,
          chofer : chofer,
          
        }),
        success: function(response) {
          Swal.fire({
            title: '¡Éxito!',
            text: response.message || 'La guía ha sido asignada a este Deposito.',
            icon: 'success',
            timer: 1000,              // 1 segundo
            showConfirmButton: false  // Oculta el botón OK
          }).then((result) => {
            // Si cerró por el temporizador
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
    $('#kt_datatable_search_type2').on('change', function() {
      const userId = $(this).val();
      console.log('Usuario seleccionado:', userId);

      $('#loadingSpinner').show();
      $('#lista_agencias_disponibles').empty();
      
      $.ajax({
        url: '/api/deposito_destino/' + userId,
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

