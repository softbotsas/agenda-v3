
// ========================================
// 1) Preparar las funciones y datos
// ========================================
var data = mov_container; // Asumimos que "mov_container" está definido en tu vista
var rutas = rutas_destino


console.log('la holla',  data);
var container_virtual = container;
var status_es = status_especiales;
console.log('usuario nivel', usuario_nivel)
/** 
 *  agruparPorPais => crea un objeto { pais: [items...] }
 *  Quedará igual a antes, pero lo usaremos para 
 *  generar un array con índice.
 */


let guiasFiltradas = [];

$(document).on('click', '.asignar-ruta', function() {
  const index = $(this).data('index');
  const row = entriesConIndices[index];

  // Genera opciones del select de rutas
  let rutasOptions = '<option value="">-- Seleccione ruta destino --</option>';
  rutas.forEach(ruta => {
    rutasOptions += `<option value="${ruta._id}">${ruta.Destino}</option>`;
  });

  // Modal HTML: el tbody de la tabla está vacío al inicio
  let html = `
    <div class="form-row mb-2">
      <div class="col">
        <label><b>Ruta destino</b></label>
        <select id="selectRutaDestino" class="form-control">
          ${rutasOptions}
        </select>
      </div>
      <div class="col">
        <label><b>Fecha</b></label>
        <input type="date" id="inputFechaRuta" class="form-control" value="">
      </div>
      <div class="col-auto d-flex align-items-end">
        <button class="btn btn-info" id="btnConsultarRecorrido">Consultar / Crear Recorrido</button>
      </div>
    </div>
    <div id="infoRecorridoRuta" class="mb-2"></div>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th><input type="checkbox" id="checkMarcarTodos"></th>
          <th>Guía</th>
          <th>Caja</th>
        </tr>
      </thead>
      <tbody id="tablaGuiasAsignar">
        <!-- Comienza vacío -->
      </tbody>
    </table>
    <button class="btn btn-success float-right mt-2" id="btnAsignarRutaConfirm">Asignar Ruta</button>
  `;

  $('#modalAsignarRutaContent').html(html);
  $('#modalAsignarRuta').modal('show');
  $('#infoRecorridoRuta').html('').data('recorrido-id', '');

  // Al abrir, la tabla de guías está vacía
  renderTablaGuias([]);

  // Función para filtrar guías según la ruta seleccionada
  function filtrarGuiasPorRuta(rutaId) {
    return row.guias.filter(guia => {
      const destino = guia.guia?.ruta_destino;
      if (!rutaId) return false;
      if (!destino) return false;
      if (typeof destino === 'string') return destino === rutaId;
      if (typeof destino === 'object' && destino._id) return destino._id === rutaId;
      return false;
    });
  }

  // Función para renderizar la tabla de guías (según filtro)
  function renderTablaGuias(lista) {
    const tablaGuias = lista.map((guia, i) => `
      <tr>
        <td><input type="checkbox" class="guia-check-asignar" data-mov-id="${guia._id}" checked></td>
        <td>${guia.guia.nro_guia}</td>
        <td>${guia.cant_caja}</td>
      </tr>
    `).join('');
    $('#tablaGuiasAsignar').html(tablaGuias);
  }

  // --- CHECK "MARCAR/DESMARCAR TODOS" ---
  $(document).off('change', '#checkMarcarTodos').on('change', '#checkMarcarTodos', function() {
    $('.guia-check-asignar').prop('checked', this.checked);
  });

  // --- FILTRO POR RUTA DESTINO ---
  $(document).off('change', '#selectRutaDestino').on('change', '#selectRutaDestino', function() {
    const rutaId = $(this).val();
    const guiasFiltradas = filtrarGuiasPorRuta(rutaId);
    renderTablaGuias(guiasFiltradas);
    $('#checkMarcarTodos').prop('checked', true); // marcar todos por defecto
  });

  // --- CONSULTAR/CREAR RECORRIDO ---
  $('#btnConsultarRecorrido').off().on('click', function() {
    const rutaId = $('#selectRutaDestino').val();
    const fecha = $('#inputFechaRuta').val();
    if (!rutaId || !fecha) {
      Swal.fire('Falta información', 'Seleccione ruta y fecha', 'warning');
      return;
    }
    $.ajax({
      url: '/api/recorridos/find-or-create',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ destino: rutaId, fecha }),
      success: function(res) {
        $('#infoRecorridoRuta').html(
          `<span class="badge badge-success">Recorrido ID: ${res.recorrido._id}</span>`
        ).data('recorrido-id', res.recorrido._id);
      },
      error: function(err) {
        Swal.fire('Error', err.responseJSON?.message || 'No se pudo consultar o crear el recorrido', 'error');
      }
    });
  });

  // --- ASIGNAR RUTA CONFIRM ---
  $(document).off('click', '#btnAsignarRutaConfirm').on('click', '#btnAsignarRutaConfirm', function() {
    const recorridoId = $('#infoRecorridoRuta').data('recorrido-id');
    if (!recorridoId) {
      Swal.fire('Debe consultar/crear primero el recorrido', '', 'warning');
      return;
    }
    const selectedMovs = [];
    $('.guia-check-asignar:checked').each(function() {
      selectedMovs.push($(this).data('mov-id'));
    });
    if (!selectedMovs.length) {
      Swal.fire('Seleccione al menos una guía', '', 'warning');
      return;
    }
    $.ajax({
      url: '/api/recorridos/asignar-guias',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ movContainerIds: selectedMovs, recorridoId }),
      success: function(res) {
        Swal.fire('¡Listo!', res.message || 'Asignación realizada', 'success')
          .then(() => location.reload());
      },
      error: function(err) {
        Swal.fire('Error', err.responseJSON?.message || 'No se pudo asignar', 'error');
      }
    });
  });
});



function abrirModalAsignarRuta(index) {
  const row = entriesConIndices[index];
  guiasFiltradas = []; // vacía al inicio

  // ...código para mostrar el modal...

  // Renderiza la tabla vacía
  renderTablaGuias([]);

  // Evento para el select de rutas
  $('#selectRutaDestino').off().on('change', function() {
    const rutaId = $(this).val();
    guiasFiltradas = filtrarGuiasPorRuta(rutaId, row);
    renderTablaGuias(guiasFiltradas);
  });
}

// 1. Listener para el botón .devolver_cedis
$('#kt_datatable_container_fisico').on('click', '.devolver_cedis', function() {
  var index = $(this).data('index');
  var row = entriesConIndices[index]; // Obtenemos { i, pais, guias }

  // Validar que tenemos datos de fila y containers virtuales
  if (!row || !row.guias || !container_virtual) {
      console.error("Faltan datos de la fila o containers virtuales para procesar la devolución.");
      Swal.fire('Error', 'No se pudieron cargar los datos necesarios.', 'error');
      return;
  }

  // 2. Generar las opciones del select con container_virtual
  var selectOptionsHtml = '<option value="">-- Seleccione Destino --</option>'; // Opción por defecto
  selectOptionsHtml += container_virtual.map(cv => {
      // Usamos cv._id como value y cv.nombre como texto
      return `<option value="${cv._id}">${cv.nombre}</option>`;
  }).join('');

  // 3. Generar las filas de la tabla con las guías y checkboxes
  var tablaGuiasHtml = row.guias.map((guia, i) => {
      // Asumimos que cada 'guia' en 'row.guias' tiene una propiedad '_id' que es el ID único
      // y una propiedad 'guia' que contiene 'nro_guia' y 'status'
      const guiaData = guia.guia || {}; // Objeto guía interno
      const statusDesc = obtenerDescripcionStatus(guiaData.status); // Reutilizamos tu función

      return `
          <tr>
            <td>
                <input type="checkbox" class="modal-guide-check-devolucion" data-mov-fisico-id="${guia._id}"  checked>
            </td>
              <td>${guiaData.nro_guia || 'N/A'}</td>
              <td>${statusDesc}</td>
              <td>${guia.cant_caja || 'N/A'}</td>
          </tr>
      `;
  }).join('');

  // 4. Construir el HTML completo para el cuerpo del modal
  var modalBodyHtml = `
      <div class="form-group">
          <label for="selectContainerVirtualDevolucion"><b>Container Virtual de Destino:</b></label>
          <select class="form-control" id="selectContainerVirtualDevolucion">
              ${selectOptionsHtml}
          </select>
      </div>
      <hr>
      <div class="form-group">
           <input type="checkbox" id="selectAllDevolucion" checked>
           <label for="selectAllDevolucion">Marcar / Desmarcar Todos</label>
      </div>
      <table class="table table-bordered table-striped table-sm">
          <thead>
              <tr>
                  <th>Marcar</th>
                  <th>Nro. Guía</th>
                  <th>Status Actual</th>
                  <th>Caja</th>
              </tr>
          </thead>
          <tbody>
              ${tablaGuiasHtml}
          </tbody>
      </table>
  `;

  // 5. Insertar el HTML en el modal y mostrarlo
  $('#modalDevolucionContent').html(modalBodyHtml);

  // 6. Añadir funcionalidad al checkbox "Marcar Todos" *después* de crear el HTML
  $('#selectAllDevolucion').off('change').on('change', function() {
      var isChecked = $(this).is(':checked');
      $('.modal-guide-check-devolucion').prop('checked', isChecked);
  });

  // 7. Mostrar el modal
  $('#devolucionModal').modal('show');
});


$(document).off('click', '#confirmarDevolucionBtn').on('click', '#confirmarDevolucionBtn', function() {
  var selectedMovFisicoIds = []; 
  $('.modal-guide-check-devolucion:checked').each(function() {
      selectedMovFisicoIds.push($(this).data('mov-fisico-id')); // <-- Recolecta el ID correcto
  });

  var targetContainerVirtualId = $('#selectContainerVirtualDevolucion').val();

  if (!targetContainerVirtualId) {
       Swal.fire('Error', 'Debe seleccionar un container virtual de destino.', 'warning');
       return;
  }
  if (selectedMovFisicoIds.length === 0) {
       Swal.fire('Error', 'Debe seleccionar al menos una guía/caja para devolver.', 'warning');
       return;
  }

  // Llamar a la función con los IDs correctos de MovContainerFisico
  enviar_devolucion(selectedMovFisicoIds, targetContainerVirtualId);

  $('#devolucionModal').modal('hide');
});

// Función de envío (modificado solo el nombre del parámetro)
function enviar_devolucion(selectedMovFisicoIds, targetContainerVirtualId) { // <-- Nombre de parámetro más claro
  console.log("Enviando devolución al backend...");
  console.log("MovContainerFisico IDs:", selectedMovFisicoIds);
  console.log("Container Virtual Destino ID:", targetContainerVirtualId);

  $.ajax({
      url: '/api/devolver-guias-a-virtual',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
          // La clave en el backend espera 'movContainerFisicoIds'
          movContainerFisicoIds: selectedMovFisicoIds,
          targetContainerVirtualId: targetContainerVirtualId
      }),
      success: function(response) {
          Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: response.message || 'Las guías/cajas han sido regresadas correctamente.',
              confirmButtonText: 'Aceptar'
          }).then((result) => {
              if (result.isConfirmed) {
                  location.reload();
              }
          });
      },
      error: function(jqXHR) {
           Swal.fire({
              icon: 'error',
              title: 'Error en Devolución',
              text: jqXHR.responseJSON?.message || 'Ocurrió un error en el servidor.',
              confirmButtonText: 'Aceptar'
          });
      }
  });
}
// ========================================
//       FIN: Manejo Devolución CEDIS
// ========================================

// Resto de tu código KTDatatableRemoteAjaxDemo...
// ... (asegúrate de que jQuery(document).ready() esté al final) ...

function agruparPorPais(data) {
  const paises = {};
  data.forEach(item => {
    const clavePais = (item.pais_destina || '').trim();
    if (!paises[clavePais]) {
      paises[clavePais] = [];
    }
    paises[clavePais].push(item);
  });
  return paises;
}

/**
 *  Este array final se usará en KTDatatable. Cada objeto:
 *  { i, pais, guias }.
 */

var entriesConIndices = []; 
var paisesAgrupados = agruparPorPais(data); // { 'Honduras': [...], 'El Salvador': [...], etc. }
var keysPaises = Object.keys(paisesAgrupados); 
keysPaises.forEach((pais, index) => {
  entriesConIndices.push({
    i: index,         // índice único
    pais,             // string 'Honduras' o 'El Salvador'
    guias: paisesAgrupados[pais] // array con las guías
  });
});
console.log('entriesConIndices =', entriesConIndices);

// ========================================
// 2) Configurar KTDatatable
// ========================================
var KTDatatableRemoteAjaxDemo = function() {
  var demo = function() {
    console.log('paisesAgrupados', paisesAgrupados);

    // En lugar de "Object.keys(paisesAgrupados)", usamos 'entriesConIndices'
    var datatable = $('#kt_datatable_container_fisico').KTDatatable({
      data: {
        type: 'local',
        source: entriesConIndices, // nuestro array con { i, pais, guias }
        pageSize: 1000,            // ajusta según tus necesidades
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
            // Determinar qué botones mostrar según el nivel de usuario
            const mostrarBotones = [0, 1, 2].includes(usuario_nivel);
            
            return `
              <div>
                <!-- Botón siempre visible -->
                <button class="btn btn-sm btn-primary toggle-guides"
                        data-index="${row.i}"
                        style="width: 200px;">
                  País: ${row.pais} - Cant= ${row.guias.length}
                </button>
                
                <!-- Botón Imprimir (condicional) -->
                ${mostrarBotones ? `
                  <button class="btn btn-sm btn-danger imprimir-tabla"
                          data-index="${row.i}">
                    Imprimir
                    <i class="icon-xl la la-print"></i>
                  </button>
                ` : ''}
                
                <!-- Botón Exportar Excel (condicional) -->
                ${mostrarBotones ? `
                  <button class="btn btn-sm btn-warning Exportar-Excel"
                          data-index="${row.i}">
                    Exportar Excel
                    <i class="icon-xl fas fa-file-excel"></i>
                  </button>
                ` : ''}
                
                <!-- Botón Exportar Excel Manifiesto (siempre visible) -->
                <button class="btn btn-sm btn-secondary Exportar-Excel2"
                        data-index="${row.i}">
                  Exportar Excel Manifiesto
                  <i class="icon-xl fas fa-file-excel"></i>
                </button>
                
                <!-- Botón Cambiar Status (siempre visible) -->
                  ${mostrarBotones ? `
                <button class="btn btn-sm btn-info cambiar-status"
                        data-index="${row.i}">
                  Cambiar Status
                  <i class="icon-xl la la-exchange-alt"></i>
                </button> ` : ''}
                
                <!-- Botón Imprimir Masivo (siempre visible) -->
                <button class="btn btn-sm btn-dark imprimir-masivo"
                        data-index="${row.i}">
                  Imprimir Masivo
                  <i class="icon-xl la la-print"></i>
                </button>
                
                <!-- Botón Cambiar de Container (siempre visible) -->
                  ${mostrarBotones ? `
                <button class="btn btn-sm btn-primary cambiar-container"
                        data-index="${row.i}"
                        data-toggle="modal"
                        data-target="#containerModal">
                  Cambiar de Container
                  <i class="icon-xl  fas fa-exchange-alt"></i>
                </button> ` : ''}
                
                <!-- Botón Devolver a Cedis (condicional) -->
                  ${mostrarBotones ? `
                  <button class="btn btn-sm btn-success devolver_cedis"
                          data-index="${row.i}">
                    Devolver a Cedis
                    <i class="icon-xl la la-backward"></i> 
                  </button>
                ` : ''}
                  ${mostrarBotones ? `
                  <button class="btn btn-sm btn-danger asignar-ruta"
                          data-index="${row.i}">
                    Asignar a Ruta 
                    <i class="icon-xl la la-road"></i>
                  </button>
                ` : ''}
                 <div id="status-options-${row.i}" class="status-options" style="display: none;">
                    <select class="form-control status-select">
                      ${status_es.map(option => `

                        <option value="${option.status}" ${option.status == row.guias[0].guia.status ? 'selected' : ''}>${option.nombre}</option>
                        `).join('')}
                    </select>
                    <button class="btn btn-sm btn-primary aplicar-status" data-index="${row.i}">
                      Aplicar
                    </button>
                </div>
                <div id="guia-${row.i}" class="guide-details" style="display: none;"></div>
               

                <div id="guia-${row.i}" class="guide-details" style="display: none;"></div>
              </div>

              
            `;
          }
        }
      ],
    });
 // <button class="btn btn-sm btn-success enviar-notif"
 //data-index="${row.i}">
 //Notificar a todos
 //<i class="icon-xl la fab la-whatsapp"></i>
//</button>
    $(document).on('click', '.cambiar-container', function() {
      // Obtén el índice de la fila desde data-index
      var index = $(this).data('index');
      
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
                // Se asume que:
                // - guia.guia.nro_guia es el número de guía.
                // - guia.guia.status contiene el código de status (convertido con obtenerDescripcionStatus).
                // - guia.cant_caja es la cantidad de cajas.
                // - guia.detalles_caja es un objeto con alto, ancho y largo.
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
          url: 'api/cambiar_container_fisico',
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
    
    // ========================================
    // 3) Manejar el input "contenido_bsucar"
    //    (Dejamos igual tu lógica)
    // ========================================
    $('#contenido_bsucar').on('input', function () {
      // Cancelar cualquier timer previo
      clearTimeout($(this).data('timer'));
    
      // Crear un nuevo timer de 500 ms
      const wait = setTimeout(() => {
        const valor = $(this).val().trim();
    
        // Verifica si hay una barra
        if (valor.includes('/')) {
          const partes = valor.split('/');
          const nro_guia = partes[0] || '';
          let caja = partes[1] || '';
    
          // Si el valor de caja contiene un guion, separamos y tomamos la primera parte
          if (caja.includes('-')) {
            caja = caja.split('-')[0];
          }
    
          console.log('nro_guia:', nro_guia, 'caja:', caja);
    
          // Si no hay nro_guia o caja, avisa
          if (!nro_guia || !caja) {
            alert('El formato esperado es EJEMPLO: ABC123/1. ¡Faltan datos!');
            return;
          }
    
          // Realizamos la petición AJAX
          $.ajax({
            url: '/container_fisico/carga',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
              guia: nro_guia,
              cant_caja: caja,
              container_fisico: container_fisico, 
            }),
            success: function(response) {
              Swal.fire({
                title: '¡Éxito!',
                text: response.message || 'Operación realizada con éxito.',
                icon: 'success',
                timer: 500,               // Mostrar la alerta solo 0.5s
                showConfirmButton: false  // Ocultar el botón "OK"
              }).then((result) => {
                // Si se cerró por el temporizador
                if (result.dismiss === Swal.DismissReason.timer) {
                  location.reload();
                }
              });
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.error('Error AJAX:', jqXHR, textStatus, errorThrown);
    
              if (jqXHR.status === 404) {
                Swal.fire('Error', jqXHR.responseJSON?.message || 'La guía ya esta Registrada.', 'error');
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
    


    // ========================================
    // 4) Manejo de #kt_datatable_search_type2 (igual que tu código)
    // ========================================
    $('#kt_datatable_search_type2').on('change', function() {
      const userId = $(this).val(); // userId aquí podría representar el ID del "container virtual" de origen
      console.log('Container Virtual de Origen (userId):', userId);

      $('#loadingSpinner').show();
      $('#lista_agencias_disponibles').empty(); // Limpiar lista anterior
      $('#asignarGuiasBtnContainer').hide();   // Ocultar botón de asignar inicialmente

      // Asignar el valor del dropdown a conductor_carga, que se usará como 'containerV'
      conductor_carga = userId;

      $.ajax({
          url: '/container_fisico/carga/' + userId, // URL para obtener guías del "container físico" asociadas al "container virtual" (userId)
          method: 'GET',
          dataType: 'json',
          success: function(response) {
              console.log("Respuesta de /container_fisico/carga/:", response);
              const responseGuias = response.guias;
              // conductor_carga ya fue asignado con el valor del dropdown (userId)

              console.log('Guías filtradas desde container físico:', responseGuias);

              // guias_asignar_trailer = responseGuias; // Actualizar el arreglo global (menos crítico para IDs ahora)
              $('#loadingSpinner').hide();

              if (!responseGuias || responseGuias.length === 0) {
                  $('#lista_agencias_disponibles').append('<li style="padding: 10px 15px; text-align: center; color: #888;">No hay guías disponibles en este container físico.</li>');
              } else {
                  // Añadir el checkbox "Seleccionar/Deseleccionar Todas"
                  $('#lista_agencias_disponibles').append(`
                      <li style="padding: 10px 15px; border-bottom: 1px solid rgba(0,0,0,0.2); background-color: #f8f9fa; display: flex; align-items: center;">
                          <input type="checkbox" id="seleccionarTodasGuias" style="margin-right: 10px; transform: scale(1.2);">
                          <label for="seleccionarTodasGuias" style="font-weight: bold; margin-bottom: 0; cursor: pointer;">Seleccionar/Deseleccionar Todas</label>
                      </li>
                  `);

                  // Poblar la lista con guías individuales y sus checkboxes
                  responseGuias.forEach((guia) => {
                      $('#lista_agencias_disponibles').append(`
                          <li data-id="${guia._id}" 
                              style="padding: 10px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.1); display: flex; align-items: center;">
                              <input type="checkbox" class="guia-checkbox" value="${guia._id}" data-nro-guia="${guia.nro_guia}" style="margin-right: 10px; transform: scale(1.2);">
                              <div>
                                  <span style="font-weight: bold; color: #333;">Nro Guía:</span> ${guia.nro_guia}<br>
                                  <span style="font-weight: bold; color: #555;">Remitente:</span> ${guia.nom_cliente_remite}
                              </div>
                          </li>
                      `);
                  });

                  $('#asignarGuiasBtnContainer').show(); // Mostrar el botón de asignar
              }
          },
          error: function(err) {
              $('#loadingSpinner').hide();
              console.error('Error al obtener guías del container físico:', err);
              $('#lista_agencias_disponibles').append('<li style="padding: 10px 15px; color: red; text-align: center;">Error al cargar guías.</li>');
          }
      });
  });

  // --- Event Handlers para la Funcionalidad de los Checkboxes (son los mismos de antes) ---

  // Handler para el checkbox "Seleccionar/Deseleccionar Todas"
  $(document).on('change', '#seleccionarTodasGuias', function() {
      const isChecked = $(this).prop('checked');
      $('#lista_agencias_disponibles .guia-checkbox').prop('checked', isChecked);
  });

  // Handler para los checkboxes individuales de cada guía para actualizar "Seleccionar/Deseleccionar Todas"
  $(document).on('change', '#lista_agencias_disponibles .guia-checkbox', function() {
      const totalCheckboxes = $('#lista_agencias_disponibles .guia-checkbox').length;
      const checkedCheckboxes = $('#lista_agencias_disponibles .guia-checkbox:checked').length;

      if (totalCheckboxes > 0 && checkedCheckboxes === totalCheckboxes) {
          $('#seleccionarTodasGuias').prop('checked', true);
      } else {
          $('#seleccionarTodasGuias').prop('checked', false);
      }
  });

  // --- Event handler para el botón "Asignar Guías" (para /transfer-trailer-deposito3) ---
  $('#asignarGuiasBtn').on('click', function() {
      const guiaIds = [];
      $('#lista_agencias_disponibles .guia-checkbox:checked').each(function() {
          guiaIds.push($(this).val()); // .val() obtiene el atributo value (guia._id)
      });

      if (guiaIds.length === 0) {
          Swal.fire('Atención', 'Debes seleccionar al menos una guía para transferir.', 'warning');
          return;
      }
      console.log('Guía IDs seleccionadas para transferir (container físico):', guiaIds);

      // !!! IMPORTANTE: Asegúrate de que 'conductor_carga' (que actúa como containerV) y 'container_fisico'
      // estén definidas y tengan los valores correctos aquí.
      // 'conductor_carga' se establece cuando cambia el dropdown #kt_datatable_search_type2.
      // 'container_fisico' debe ser obtenida de alguna otra parte de tu UI o lógica.
      // Ejemplo: container_fisico = $('#id_del_selector_container_fisico').val();

      if (typeof conductor_carga === 'undefined' || conductor_carga === null || conductor_carga === '') {
           Swal.fire('Error de Configuración', 'No se ha especificado el Container Virtual de origen (conductor_carga).', 'error');
           return;
      }
      if (typeof container_fisico === 'undefined' || container_fisico === null || container_fisico === '') {
           Swal.fire('Error de Configuración', 'No se ha especificado el Container Físico de destino.', 'error');
           return;
      }

      $.ajax({
          url: '/transfer-trailer-deposito3', // URL para esta acción específica
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              guias: guiaIds,
              containerV: conductor_carga,     // 'conductor_carga' (el ID del dropdown) se usa como 'containerV'
              container_fisico: container_fisico // Esta variable 'container_fisico' debe estar definida
          }),
          success: function(response) {
              Swal.fire(
                  '¡Éxito!',
                  response.message || 'Las guías seleccionadas han sido procesadas.', // Mensaje genérico/ajustado
                  'success'
              ).then(() => {
                  location.reload(); // Recargar la página o actualizar la UI según sea necesario
              });
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.error('Error AJAX en /transfer-trailer-deposito3:', jqXHR.responseText, textStatus, errorThrown);
              let errorMessage = 'Ocurrió un problema inesperado durante la operación.';
              if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                  errorMessage = jqXHR.responseJSON.message;
              } else if (jqXHR.status === 404) {
                  // El mensaje original era "La guía ya esta Registrada previamente.!!!", que suena más a un 409 (conflicto).
                  // Adaptar según la semántica real del error 404 en este endpoint.
                  errorMessage = 'Recurso no encontrado o una de las guías no es válida.';
              } else if (jqXHR.status === 409) {
                  errorMessage = 'Conflicto: La guía ya fue registrada o procesada previamente.';
              }
              Swal.fire('Error', errorMessage, 'error');
          }
      });
  });
    // ========================================
    // 6) Evento .enviar-notif (usando data-index)
    // ========================================
    // Asumiendo que ya tienes el manejador original para el botón ".enviar-notif"
$('#kt_datatable_container_fisico').on('click', '.enviar-notif', function() {
  // Obtenemos el índice
  const i = $(this).data('index');
  // Obtenemos la fila correspondiente (de tu array entriesConIndices)
  const row = entriesConIndices[i];

  console.log('Notificando a todos en:', row.pais, ' - Guías:', row.guias);

  // Construimos info_clientes a partir de row.guias
  const info_clientes = row.guias.map(g => ({
    telefono: g.guia?.celular_remite || '999999',
    nombre: g.guia?.nom_cliente_remite || 'Cliente',
    guia: g.guia?.nro_guia || 'N/A'
  }));

  // Preparamos el payload base (sin el mensaje aún)
  const payloadBase = {
    info_clientes,
    container: container_fisico.contenedor,
    naviera: container_fisico.naviera,
    puerto: container_fisico.puerto,
    placa: container_fisico.placa,
    sello: container_fisico.sello
  };

  console.log('Payload a enviar:', payloadBase);

  // Generamos un mensaje template usando el primer cliente (o valores por defecto)
  const firstClient = info_clientes[0] || {};
  const mensajeTemplate = `
Saludos estimado(a)  Cliente,

Te informamos que tu envío  se encuentra ya en el contenedor, sigue en tránsito Internacional.

Recibirás nuevas notificaciones en el transcurso de los días.

¡Gracias por confiar en nosotros!`;
  
  // Colocamos el mensaje template en el textarea del modal
  $('#mensajeEdicion').val(mensajeTemplate);

  // Guardamos el payload base en una variable global para usarlo luego al enviar
  window.currentPayload = payloadBase;

  // Mostramos el modal (usando Bootstrap)
  $('#mensajeModal').modal('show');
});




// Manejador para el botón "Enviar Notificación" del modal
$('#btnEnviarNotificacion').on('click', async function() {
  // Obtenemos el mensaje editado del textarea
  const mensajeEditado = $('#mensajeEdicion').val();
  
  // Recuperamos el payload base guardado previamente
  const payload = window.currentPayload;
  // Asignamos el mensaje editado al payload
  payload.mensaje = mensajeEditado;
  

  try {
    console.log('Payload a enviar:', payload);

    fetch('/enviar-mensajes2', {
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


$('#kt_datatable_container_fisico').on('click', '.imprimir-tabla', function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obtenemos el índice de la fila del datatable
  const i = $(this).data('index');
  const row = entriesConIndices[i]; // Estructura: { i, pais, guias }

  if (!row || !row.guias) {
    console.error('No se encontró la información para imprimir.');
    return;
  }

  // Agregar título al PDF
  doc.setFontSize(14);
  doc.text(`Reporte de Guías - ${row.pais}`, 14, 15);

  // Preparar los datos para la tabla
  const tableData = row.guias.map((guia, index) => {
    const detallesCaja = guia.detalles_caja || {};

    // Usar la propiedad "seguimientos" (asegúrate de que esté asignada en tus datos)
    const tgTransporte = (guia.seguimientos && guia.seguimientos.length > 0)
      ? guia.seguimientos[0].observacion
      : 'N/A';

    // TG País: filtrar aquellos seguimientos cuyo estado.tipo sea "G transporte"
    const tgPais = (guia.seguimientos && guia.seguimientos.length > 0)
      ? (() => {
          const segG = guia.seguimientos.filter(s => s.estado && s.estado.tipo === 'G transporte');
          return segG.length > 0 ? segG[segG.length - 1].observacion : 'N/A';
        })()
      : 'N/A';

    // Calcular P Cubico (pie cúbico)
    const ancho = parseFloat(detallesCaja.ancho) || 0;
    const alto  = parseFloat(detallesCaja.alto) || 0;
    const largo = parseFloat(detallesCaja.largo) || 0;
    const pCubico = (ancho && alto && largo)
      ? (ancho * alto * largo / 1728).toFixed(2)
      : '';

    return [
      index + 1, // Número
      (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
      (guia.guia && guia.guia.referencia1) ? guia.guia.referencia1 : '',
      `${detallesCaja.alto || ''} x ${detallesCaja.ancho || ''} x ${detallesCaja.largo || ''}`, // Dimensiones
      pCubico, // P Cubico
      guia.cant_caja || '',
      tgPais,
      tgTransporte,
      (guia.guia && guia.guia.total_fac)
        ? `$${parseFloat(guia.guia.total_fac).toFixed(2)}`
        : ''
    ];
  });

  // Definir las columnas para el PDF (orden y encabezados)
  const columns = [
    { header: "#", dataKey: "num" },
    { header: "Guía", dataKey: "guia" },
    { header: "Referencia", dataKey: "referencia" },
    { header: "Dimensiones", dataKey: "dimensiones" },
    { header: "P Cubico", dataKey: "p_cubico" },
    { header: "Caja Nro", dataKey: "caja" },
    { header: "TG País", dataKey: "tg_pais" },
    { header: "TG Transporte", dataKey: "tg_transporte" },
    { header: "Monto", dataKey: "monto" }
  ];

  // Agregar la tabla al PDF usando autoTable
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: 20,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] } // Color azul claro para el encabezado
  });

  // Generar la URL del PDF y abrir en una nueva pestaña
  const pdfURL = doc.output("bloburl");
  window.open(pdfURL, "_blank");
});


    $(document).on('click', '.Exportar-Excel', function() {
      const index = $(this).data('index');
      exportRowToExcel(index);
    });

    $(document).on('click', '.Exportar-Excel2', function() {
      const index = $(this).data('index');
      exportRowToExcel2(index);
    });


    function exportRowToExcel(index) {
      // Verificar que el índice sea válido
      if (!entriesConIndices || entriesConIndices.length <= index) {
        Swal.fire('Error', 'No hay datos para exportar.', 'error');
        return;
      }
    
      // Obtenemos los datos de la fila a exportar
      const rowData = entriesConIndices[index];
    
      // Mapear cada guía a un objeto con las propiedades requeridas
      const exportData = rowData.guias.map((guia, i) => {
        const detallesCaja = guia.detalles_caja || {};
    
        // TG Transporte: Se toma el primer seguimiento (si existe) usando "seguimientos"
        const tgTransporte = (guia.seguimientos && guia.seguimientos.length > 0)
          ? guia.seguimientos[0].observacion
          : 'N/A';
    
        // TG País: Filtramos por seguimientos cuyo estado.tipo sea "G transporte"
        const tgPais = (guia.seguimientos && guia.seguimientos.length > 0)
          ? (() => {
              const segG = guia.seguimientos.filter(s => s.estado && s.estado.tipo === 'G transporte');
              return segG.length > 0 ? segG[segG.length - 1].observacion : 'N/A';
            })()
          : 'N/A';
    
          let ancho = parseFloat(detallesCaja.ancho) || 0;
          let alto  = parseFloat(detallesCaja.alto)  || 0;
          let largo = parseFloat(detallesCaja.largo) || 0;
          
          // Si existen las tres dimensiones, se calcula el pie cúbico. 
          // De lo contrario, se asigna una cadena vacía.
          let pCubico = (ancho && alto && largo) ? (ancho * alto * largo / 1728).toFixed(2) : '';
          
          return {
            Nro: i + 1,
            guia: (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
            caja: guia.cant_caja || '',
            Estado: guia.guia.status ? obtenerDescripcionStatus(guia.guia.status) : '',
            tg_pais: tgPais,
            tg_transporte: tgTransporte,
            Lb: detallesCaja.peso,
            Ancho: detallesCaja.ancho,
            Alto: detallesCaja.alto,
            Largo: detallesCaja.largo,
            "P Cubico": pCubico,
            monto: (guia.guia && guia.guia.total_fac) ? `$${parseFloat(guia.guia.total_fac).toFixed(2)}` : ''
          };
      });
    
      // Exportar a XLSX si la librería XLSX está definida; de lo contrario, exportar a CSV.
      if (typeof XLSX !== 'undefined') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
        XLSX.writeFile(workbook, "reporte_fila_" + rowData.i + ".xlsx");
      } else {
        // Generar CSV como alternativa
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = Object.keys(exportData[0]).join(",") + "\n";
        csvContent += headers;
        exportData.forEach(obj => {
          const row = Object.values(obj).join(",");
          csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_fila_" + rowData.i + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    
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
        const detallesCaja = guia.detalles_caja || {};
    
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
          "Tamaño": `${detallesCaja.alto || ''} x ${detallesCaja.ancho || ''} x ${detallesCaja.largo || ''}`
       
        };
      });
    
      // Exportar a XLSX si la librería XLSX está definida; de lo contrario, exportar a CSV.
      if (typeof XLSX !== 'undefined') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
        XLSX.writeFile(workbook, "reporte_fila_" + rowData.i + ".xlsx");
      } else {
        // Generar CSV como alternativa
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = Object.keys(exportData[0]).join(",") + "\n";
        csvContent += headers;
        exportData.forEach(obj => {
          const row = Object.values(obj).join(",");
          csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reporte_fila_" + rowData.i + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    


    $('#kt_datatable_container_fisico').on('click', '.cambiar-status', function() {
      
      const i = $(this).data('index');
      const statusOptions = $(`#status-options-${i}`);
      
      if (statusOptions.is(':visible')) {
        statusOptions.hide();
      } else {
        statusOptions.show();
      }
    });
    
  

    $('#kt_datatable_container_fisico').on('click', '.aplicar-status', function() {
      const i = $(this).data('index'); // Obtiene el índice único de la fila/grupo de opciones
      const nuevoStatusValue = $(`#status-options-${i} .status-select`).val(); // Valor del status seleccionado
      const selectedStatusText = $(`#status-options-${i} .status-select option:selected`).text(); // Texto del status seleccionado
  
      // --- INICIO: Obtener estado del checkbox "Notificar al cliente" ---
      // Se busca el checkbox específico para esta fila usando el índice 'i'
      const notificarClienteCheckbox = $(`#notifyClientCheck-${i}`);
      const debeNotificarCliente = notificarClienteCheckbox.is(':checked'); // true si está marcado, false si no
      // --- FIN: Obtener estado del checkbox ---
  
      // Obtener datos de la guía (asumiendo que 'entriesConIndices' está disponible y estructurado correctamente)
      // Es importante asegurarse que 'entriesConIndices[i]' y 'entriesConIndices[i].guias' existen
      if (!entriesConIndices || !entriesConIndices[i] || !entriesConIndices[i].guias) {
          console.error("Error: No se pudo encontrar la información de la guía para el índice:", i);
          Swal.fire('Error Interno', 'No se pudo obtener la información de la guía. Por favor, recarga la página.', 'error');
          return;
      }
      const guiasDeLaFila = entriesConIndices[i].guias; // Array de guías para esta fila
  
      // Mapear para obtener los IDs y números de guía
      // (Si solo hay una guía por 'row.i', esto seguirá funcionando)
      const guiaIds = guiasDeLaFila.map(item => item.guia._id);
      const guiaNros = guiasDeLaFila.map(item => item.guia.nro_guia); // Array de números de guía
      
      // Para la notificación, usualmente se notifica por guía individual.
      // Si necesitas enviar una notificación por cada guía en 'guiasDeLaFila'
      // y cada una puede tener un teléfono diferente, la lógica de notificación en el backend
      // necesitará iterar sobre 'guiaIds' o 'guiaNros' y buscar el teléfono correspondiente.
      // Por ahora, enviaremos el array de números de guía y el backend decidirá.
      // Si solo es una guía, guiaNros[0] sería el número.
  
      console.log("Índice:", i);
      console.log("Nuevo Status (valor):", nuevoStatusValue);
      console.log("Nuevo Status (texto):", selectedStatusText);
      console.log("IDs de Guía(s):", guiaIds);
      console.log("Números de Guía(s):", guiaNros);
      console.log("¿Notificar al cliente?:", debeNotificarCliente); // Log del estado del checkbox
  
      // Validar que tengamos al menos un ID de guía
      if (!guiaIds || guiaIds.length === 0) {
          Swal.fire('Error', 'No se pudo identificar la guía para actualizar.', 'error');
          return;
      }
  
      $.ajax({
          url: '/actualizar-status', // Ruta de tu API backend
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              guiaIds: guiaIds,                 // Array de IDs de guía
              nuevoStatus: nuevoStatusValue,    // El valor del estado (ej. el ID del estado)
              statusTexto: selectedStatusText,  // El texto visible del estado (para la notificación)
              numerosGuia: guiaNros,            // Array de números de guía (para la notificación)
              notificar: debeNotificarCliente   // <-- ENVIAR EL ESTADO DEL CHECKBOX
              // telefonoCliente: ... // Si lo tienes disponible en el frontend y es uno solo.
                                       // Si no, el backend debe buscarlo usando guiaIds.
          }),
          success: function(response) {
              Swal.fire('¡Éxito!', response.message || 'Estado actualizado correctamente.', 'success')
                  .then(() => location.reload());
          },
          error: function(jqXHR) {
              Swal.fire('Error', jqXHR.responseJSON?.message || 'Ocurrió un error al actualizar el estado.', 'error');
          }
      });
  });
    // ========================================
    // 7) Evento .toggle-guides (data-index)
    // ========================================
    $('#kt_datatable_container_fisico').on('click', '.toggle-guides', function() {
      const i = $(this).data('index');
      const row = entriesConIndices[i]; // { i, pais, guias }

      // Buscamos el <div id="guia-i">
      const container = $(`#guia-${i}`);
      console.log('Toggle guides => i=', i, 'row.pais=', row.pais, 'container=', container);

      if (container.is(':visible')) {
        container.hide();
      } else {
        container.show();

        if (container.is(':empty')) {
          // row.guias => array
          let totalPeso = 0;
          let totalMonto = 0;

          row.guias.forEach(guia => {
            const detallesCaja = guia.detalles_caja || {};
            totalPeso += parseFloat(detallesCaja.peso) || 0;
            totalMonto += parseFloat(guia.guia.total_fac) || 0;
          });
          const totalMontoFormateado = totalMonto.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          let detallesHTML = `
            <div class="table-responsive"> <span class="grT"> </span>
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guía</th>
                   <th>Status</th>
                  <th>Referencia</th>
                  <th>Dimensiones</th>
                  <th>Peso</th>
                  <th>Caja Nro</th>
                  <th>TG Pais</th>
                  <th>TG Transporte</th>
                  <th>S Recogida</th>
                  
                  <th>Monto</th>
                  <th>Ruta-Fecha</th> 
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${row.guias.map((guia, index) => {
                  const detallesCaja = guia.detalles_caja || {};
                  // TG Transporte

                  const tgTransporte = (guia.seguimientos && guia.seguimientos.length > 0)
                    ? `
                      <a
                       href="${guia.seguimientos[0].imagen}" target="_blank"
                        data-mov-id="${guia._id}"  /* o la ID real de MovContainerFisico */
                        class="tgTransporte-link${guia.impresion ? ' marked' : ''}"
                      >
                        ${guia.seguimientos[0].observacion}
                        ${
                          guia.impresion
                            ? ' <i class="la la-print" style="margin-left: 5px;" title="Impreso"></i>'
                            : ''
                        }
                      </a>
                    `
                    : '';

                const tgPais = (guia.seguimientos && guia.seguimientos.length > 0)
                  ? (() => {
                      const segG = guia.seguimientos.filter(s => s.estado && s.estado.tipo === 'G transporte');
                      return segG.length > 0 ? segG[segG.length - 1].observacion : '';
                    })()
                  : '';


                  const statusesConEstilo = ["6", "7", "16", "14"];


                      const estiloFila = statusesConEstilo.includes(guia.guia.status)
                          ? 'style="background-color: #e8fff3; border-bottom: 1px solid #50cd89; font-weight: bold;"' 
                          : '';


                  return `
                  <tr ${estiloFila}>
                    <td>${index + 1}</td>
                    <td>${guia.guia.nro_guia}</td>
                    <td>${obtenerDescripcionStatus(guia.guia.status)}</td>
                    <td>${guia.guia.referencia1 || ''}</td>
                    <td>${detallesCaja.alto || ''} X 
                        ${detallesCaja.ancho || ''} X 
                        ${detallesCaja.largo || ''}
                    </td>
                    <td>${detallesCaja.peso} 
                    </td>
                    <td>${guia.cant_caja}</td>
                    <td>${tgPais}</td>
                    <td>${tgTransporte}</td>
                    <td>${guia.guia.tipo_contenido}</td>

                    <td>
                      ${
                        guia.guia.total_fac 
                        ? '$' + parseFloat(guia.guia.total_fac).toFixed(2) 
                        : 'N/A'
                      }
                    </td>


                    <td>
                      ${
                        guia.RecorridoRutaDestino && guia.RecorridoRutaDestino.destino
                          ? `${guia.RecorridoRutaDestino.destino.Destino} <br> <span style="font-size:11px;color:#888">${guia.RecorridoRutaDestino.fecha || ''}</span>`
                          : ''
                      }
                    </td>
                    <td>
                      ${
                        [0,1,2].includes(usuario_nivel)
                          ? `<a class="btn btn-sm btn-primary" title="Editar"
                                href="/factura_guia/${guia.guia.nro_guia}" 
                                target="_blank">
                                <i class="icon-xl la la-file-invoice"></i>
                              </a>`
                          : ''
                      }
                      <a class="btn btn-sm btn-primary" title="Entregar"
                         href="/factura_guia_entrega/${guia.guia.nro_guia}/${guia.cant_caja}" 
                         target="_blank">
                        <i class="icon-xl la la-file-signature"></i>
                      </a>
                    </td>
                  </tr>
                  
                `;
                }).join('')}

                <tr style="background:#f6f8fa;font-weight:bold;">
                <td colspan="5">Totales</td>
                <td>${totalPeso.toFixed(2)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${totalMontoFormateado}</td>
                <td></td>
                <td></td>
              </tr>
              </tbody>
            </table>
            </div>
          `;
          container.html(detallesHTML);
        }
      }
    });
  };

  

  return {
    // public functions
    init: function() {
      demo();
    },
  };
}();

$(document).on('click', '.tgTransporte-link', function(e) {
  e.preventDefault();
  const $link = $(this);
  const movId = $link.data('movId');
  const realHref = $link.attr('href') || '#';
  console.log(realHref)
      if (realHref !== '#') {
    window.open(realHref, '_blank');
      }
  // Llamar a /api/confirmar_impresion
  fetch('/api/confirmar_impresion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Añadir la clase .marked
      $link.addClass('marked');
      // Agregar el ícono de impresión si aún no existe
      if (!$link.find('.la.la-print').length) {
        $link.append(' <i class="la la-print" style="margin-left: 5px;" title="Impreso"></i>');
      }

      
    
    }
  })
  .catch(error => {
    console.error("Error al confirmar impresión:", error);
    // Decides si abrir el enlace o no, en caso de fallo
  });
});



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
      return "En Bodega Destino";
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
    default:
      return "Estado desconocido";  // Para cualquier otro valor no previsto
  }

}
// Al cargar el DOM, inicializamos la tabla
jQuery(document).ready(function() {
  KTDatatableRemoteAjaxDemo.init();
});

