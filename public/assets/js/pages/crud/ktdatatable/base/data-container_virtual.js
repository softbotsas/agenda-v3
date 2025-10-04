
var data = mov_container;   // Asumimos que esto viene de tu backend
var paises = origenes;      // Si lo usas en otro lado, lo mantienes
console.log('la data', data);

/**
 * Función para agrupar las guías por país
 */
function agruparPorPais(data) {
  const paises = {};
  data.forEach(item => {
      const clave = item?.pais_destina || '';  // Ajusta según tu modelo
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
    var datatable = $('#kt_datatable_container_virtual').KTDatatable({
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

              

                    <button class="btn btn-sm btn-danger imprimir-tabla" 
                        data-index="${row.i}">
                  Imprimir
                  <i class="icon-xl la la-print"></i>
                </button>

                <button class="btn btn-sm btn-warning Exportar-Excel" 
                        data-index="${row.i}">
                  Exportar Excel
                 <i class="icon-xl fas fa-file-excel"></i>
                </button>
                 <button class="btn btn-sm btn-secondary Exportar-Excel2" 
                        data-index="${row.i}">
                  Exportar Excel Manifiesto
                 <i class="icon-xl fas fa-file-excel"></i>
                </button>
                  <button class="btn btn-sm btn-primary cambiar-container"
                        data-index="${row.i}"
                        data-toggle="modal"
                        data-target="#containerModal">
                  Cambiar de Cedis
                   <i class="icon-xl  fas fa-exchange-alt"></i>
                </button>
              </div>
                <div id="guia-${row.i}" class="guide-details" style="display: none;"></div>
            `;
          }
        }
      ],
    });
    //  <button class="btn btn-sm btn-success enviar-notif"
   // data-index="${row.i}">
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
          url: 'api/cambiar_container_virtual',
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

    $('#kt_datatable_container_virtual').on('click', '.enviar-notif', function() {
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
        container: container.nombre,
       // naviera: container_fisico.naviera,
        //puerto: container_fisico.puerto,
        //placa: container_fisico.placa,
        //sello: container_fisico.sello
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
    

    // Función para exportar la fila a Excel (formato estándar)
function exportRowToExcel2(index) {
  // Verificar que el índice sea válido
  if (!entriesConIndices || entriesConIndices.length <= index) {
    Swal.fire('Error', 'No hay datos para exportar.', 'error');
    return;
  }

  const rowData = entriesConIndices[index];

  // Mapear cada guía a un objeto con las propiedades requeridas
  const exportData = rowData.guias.map((guia, i) => {
    const detallesCaja = guia.detalles_caja || {};
    // TG Transporte: Si existen seguimientos, se toma la observación del primero
    const tgTransporte = (guia.seguimiento && guia.seguimiento.length > 0)
      ? guia.seguimiento[0].observacion
      : '';

    // TG País: Filtrar los seguimientos cuyo estado.tipo sea "G transporte"
    const tgPais = (guia.seguimiento && guia.seguimiento.length > 0)
      ? (() => {
          const segG = guia.seguimiento.filter(s => s.estado && s.estado.tipo === 'G transporte');
          return segG.length > 0 ? segG[segG.length - 1].observacion : '';
        })()
      : '';
    // Calcular P Cubico: Si existen ancho, alto y largo (en pulgadas), se convierte a pie cúbico
    const ancho = parseFloat(detallesCaja.ancho) || 0;
    const alto  = parseFloat(detallesCaja.alto)  || 0;
    const largo = parseFloat(detallesCaja.largo) || 0;
    const pCubico = (ancho && alto && largo)
      ? (ancho * alto * largo / 1728).toFixed(2)
      : '';

      return {
        Nro: i + 1,
        guia: (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
        caja: guia.cant_caja || '',
        Estado: guia.guia.status ? obtenerDescripcionStatus(guia.guia.status) : '',
        tg_pais: tgPais,
        tg_transporte: tgTransporte,
        Lb: detallesCaja.peso,
        Ancho: ancho,
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

// Función para exportar "Excel de Manifiesto"
// En este ejemplo, se utiliza un formato similar pero con nombres de columnas (o datos) que podrían diferir.
// Puedes ajustar las columnas según los requerimientos de tu manifiesto.
function exportManifestToExcel(index) {
  if (!entriesConIndices || entriesConIndices.length <= index) {
    Swal.fire('Error', 'No hay datos para exportar.', 'error');
    return;
  }

  const rowData = entriesConIndices[index];
  const exportData = rowData.guias.map((guia, i) => {
    console.log('hu2',guia)
    const detallesCaja = guia.detalles_caja || {};
    
    // Calcular P Cubico
    const ancho = parseFloat(detallesCaja.ancho) || 0;
    const alto  = parseFloat(detallesCaja.alto)  || 0;
    const largo = parseFloat(detallesCaja.largo) || 0;
    const pCubico = (ancho && alto && largo)
      ? (ancho * alto * largo / 1728).toFixed(2)
      : '';

    // Por ejemplo, en el manifiesto podrías requerir algunas columnas adicionales o renombradas.
    return {
      Nro: i + 1,
      Guía: (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
      Remitente: guia.guia.nom_cliente_remite || '',
      Destinatario: guia.guia.nom_cliente_destina || '',
      Dirección: guia.guia.direccion_destina || '',
      Teléfono: guia.guia.telefono_destina || '',
      Móvil: guia.guia.celular_destina || '',
    
      Ciudad: (guia.guia.ciudad_destina && guia.guia.ciudad_destina[0])
                ? guia.guia.ciudad_destina[0].name || ''
                : '',
      Estado: (guia.guia.estado_destina && guia.guia.estado_destina[0])
                ? guia.guia.estado_destina[0].nombre || ''
                : '',
      País: (guia.guia.pais_destina && guia.guia.pais_destina[0])
                ? guia.guia.pais_destina[0].nombre || ''
                : '',
      Dimensiones: `${detallesCaja.alto || ''} x ${detallesCaja.ancho || ''} x ${detallesCaja.largo || ''}`,
      "P Cubico": pCubico,
      Caja: guia.cant_caja || '',
      Monto: (guia.guia && guia.guia.total_fac)
               ? `$${parseFloat(guia.guia.total_fac).toFixed(2)}`
               : ''
    };
  });

  if (typeof XLSX !== 'undefined') {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Manifiesto");
    XLSX.writeFile(workbook, "manifiesto_fila_" + rowData.i + ".xlsx");
  } else {
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
    link.setAttribute("download", "manifiesto_fila_" + rowData.i + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Event listeners para los botones de exportación
$(document).on('click', '.Exportar-Excel', function() {
  const index = $(this).data('index');
  exportRowToExcel2(index);
});

$(document).on('click', '.Exportar-Excel2', function() {
  const index = $(this).data('index');
  exportManifestToExcel(index);
});

$(document).on('click', '.imprimir-tabla', function() {
  const index = $(this).data('index');
  imprimirListadoConJsPDF(index);
});


function imprimirListadoConJsPDF(index) {
  // Extraer jsPDF desde window.jspdf
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obtener la fila de datos a partir del índice
  const row = entriesConIndices[index]; // Estructura: { i, pais, guias }

  if (!row || !row.guias) {
    console.error('No se encontró la información para imprimir.');
    return;
  }

  // Agregar título al PDF
  doc.setFontSize(14);
  doc.text(`Reporte de Guías - ${row.pais}`, 14, 15);

  // Preparar los datos para la tabla
  const tableData = row.guias.map((guia, i) => {
    // Obtener los detalles de la caja; si no existen, se usa un objeto vacío
    const detallesCaja = guia.detalles_caja || {};

    // TG Transporte: Si existen seguimientos, se toma la observación del primero
    const tgTransporte = (guia.seguimiento && guia.seguimiento.length > 0)
      ? guia.seguimiento[0].observacion
      : '';

    // TG País: Filtrar los seguimientos cuyo estado.tipo sea "G transporte"
    const tgPais = (guia.seguimiento && guia.seguimiento.length > 0)
      ? (() => {
          const segG = guia.seguimiento.filter(s => s.estado && s.estado.tipo === 'G transporte');
          return segG.length > 0 ? segG[segG.length - 1].observacion : '';
        })()
      : '';

    // Calcular el pie cúbico (P Cubico)
    // Suponiendo que las dimensiones están en pulgadas y 1 pie³ = 1728 in³.
    const ancho = parseFloat(detallesCaja.ancho) || 0;
    const alto  = parseFloat(detallesCaja.alto) || 0;
    const largo = parseFloat(detallesCaja.largo) || 0;
    const pCubico = (ancho && alto && largo)
      ? (ancho * alto * largo / 1728).toFixed(2)
      : '';

    return [
      i + 1, // Número de fila
      (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '',
      (guia.guia && guia.guia.referencia1) ? guia.guia.referencia1 : '',
      `${detallesCaja.alto || ''} x ${detallesCaja.ancho || ''} x ${detallesCaja.largo || ''}`,
      pCubico,
      guia.cant_caja || '',
      tgPais,
      tgTransporte,
      (guia.guia && guia.guia.total_fac)
        ? `$${parseFloat(guia.guia.total_fac).toFixed(2)}`
        : ''
    ];
  });

  // Definir las columnas para el encabezado del PDF
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
    headStyles: { fillColor: [41, 128, 185] } // Azul claro para el encabezado
  });

  // Generar la URL del PDF y abrirla en una nueva pestaña
  const pdfURL = doc.output("bloburl");
  window.open(pdfURL, "_blank");
}


    // =============================
    // 3) Input #contenido_bsucar (igual que tu lógica actual)
    // =============================
    $('#contenido_bsucar').on('input', function () {
      // Cancelamos el timeout previo, si lo hay.
      clearTimeout($(this).data('timer'));
    
      // Configuramos un nuevo timeout de 500ms.
      var wait = setTimeout(() => {
        const valor = $(this).val().trim();
    
        if (valor.includes('/')) {
          const partes = valor.split('/');
          const nro_guia = partes[0] || '';
          let caja = partes[1] || '';
    
          if (caja.includes('-')) {
            caja = caja.split('-')[0];
          }
    
          console.log('nro_guia:', nro_guia, 'caja:', caja);
    
          if (!nro_guia || !caja) {
            alert('El formato esperado es EJEMPLO: ABC123/1. ¡Faltan datos!');
            return;
          }
    
          $.ajax({
            url: '/transfer-deposito-containerV',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
              nro_guia: nro_guia,
              cant_caja: caja,
              container: container, 
            }),
            success: function (response) {
              Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: response.message || 'Operación realizada con éxito.',
                timer: 500,
                showConfirmButton: false
              }).then(() => location.reload());
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.error('Error AJAX:', jqXHR, textStatus, errorThrown);
              if (jqXHR.status === 404) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: jqXHR.responseJSON?.message || 'La guía no existe o estado inválido.',
                  timer: 1000,
                  showConfirmButton: false
                });
              } else if (jqXHR.status === 409) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: jqXHR.responseJSON?.message || 'Ya existe un registro con esta info.',
                  timer: 1000,
                  showConfirmButton: false
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: jqXHR.responseJSON?.message || 'Ocurrió un problema inesperado.',
                  timer: 1000,
                  showConfirmButton: false
                });
              }
            }
          });
        }
      }, 500); // 500ms de espera
    
      // Guardamos el timeout en el elemento para poder cancelarlo si es necesario.
      $(this).data('timer', wait);
    });
    


    // =============================
    // 4) Evento .toggle-guides (usamos data-index en lugar de data-pais)
    // =============================
    $('#kt_datatable_container_virtual').on('click', '.toggle-guides', function() {
      const i = $(this).data('index'); // índice
      const row = entriesConIndices[i]; // { i, pais, guias }

      const container = $(`#guia-${i}`);

      if (container.is(':visible')) {
        container.hide();
      } else {
        container.show();

        if (container.is(':empty')) {
          // row.guias => array de guías
          let detallesHTML = `  <div class="table-responsive"> <span class="grT"> </span>
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guía</th>
                  <th>Referencia</th>
                  <th>Dimensiones (Alto x Ancho x Largo)</th>
                   <th>Peso</th>
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
                    ? `<a href="${guia.seguimiento[0].imagen}" target="_blank" class="tgTransporte-link${guia.impresion ? ' marked' : ''}"  data-mov-id="${guia._id}">
                         ${guia.seguimiento[0].observacion}
                          ${
                          guia.impresion
                            ? ' <i class="la la-print" style="margin-left: 5px;" title="Impreso"></i>'
                            : ''
                        }
                       </a>`
                    : '';

                  

                  const tgPais = (guia.seguimiento && guia.seguimiento.length > 0)
                    ? (() => {
                      const segG = guia.seguimiento.filter(s => s.estado && s.estado.tipo === 'G transporte');
                      return segG.length > 0 ? segG[segG.length - 1].observacion : '';
                    })()
                    : 'N/A';

                  return `
                    <tr>
                      <td>${index + 1}</td>
                      
                      <td>${guia.guia.nro_guia}</td>
                      <td>${guia.guia.referencia1 || ''}</td>
                      <td>${detallesCaja.alto || ''} X 
                          ${detallesCaja.ancho || ''} X
                          ${detallesCaja.largo || ''}
                      </td>
                      <td>${detallesCaja.peso}</td>
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



    $(document).on('click', '.tgTransporte-link', function(e) {
      e.preventDefault();
      const $link = $(this);
      const movId = $link.data('movId');
      const realHref = $link.attr('href');
          if (realHref !== '#') {
            window.open(realHref, '_blank');
          }


            $link.addClass('marked');
            // Agregar el ícono si no existe
            if (!$link.find('.la.la-print').length) {
              $link.append(' <i class="la la-print" style="margin-left: 5px;" title="Impreso"></i>');
            }     
            fetch('/api/confirmar_impresion2', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ movId })
            })
            .then(res => res.json())
            .then(data => {
             
            })
            .catch(error => {
              console.error("Error al confirmar impresión:", error);
              // Decides si abrir el enlace o no, en caso de fallo
            });
      
    });
    
    
    $('#kt_datatable_search_type2').on('change', function() {
      const userId = $(this).val(); // userId aquí podría representar el ID del "depósito" o "agencia" del que se cargan los contenedores virtuales
      console.log('Elemento seleccionado (e.g., Depósito/Agencia ID):', userId);

      $('#loadingSpinner').show();
      $('#lista_agencias_disponibles').empty(); // Limpiar lista anterior
      $('#asignarGuiasBtnContainer').hide();   // Ocultar botón de asignar inicialmente

      // Variable para almacenar el valor que se usará como 'deposito' en la asignación
      // Se actualiza aquí porque la lógica de asignación lo usa como 'conductor_carga'
      // que se pasa como 'deposito' al endpoint /transfer-deposito-containerV2
      conductor_carga = userId; // <<< IMPORTANTE: conductor_carga ahora toma el valor de este dropdown

      $.ajax({
          url: '/api/continer_virtual/' + userId, // URL para obtener guías del "container virtual"
          method: 'GET',
          dataType: 'json',
          success: function(response) {
              console.log("Respuesta de /api/continer_virtual/:", response);
              const responseGuias = response.guias;
              // conductor_carga = userId; // Ya se asignó arriba, antes del AJAX call.
                                        // Esto asegura que 'conductor_carga' tenga el valor del dropdown actual.

              console.log('Guías filtradas desde container virtual:', responseGuias);

              // guias_asignar_trailer = responseGuias; // Actualizar el arreglo global (menos crítico para IDs ahora)
              $('#loadingSpinner').hide();

              if (!responseGuias || responseGuias.length === 0) {
                  $('#lista_agencias_disponibles').append('<li style="padding: 10px 15px; text-align: center; color: #888;">No hay guías en este container virtual / depósito.</li>');
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
              console.error('Error al obtener guías del container virtual:', err);
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

  // --- Event handler para el botón "Asignar Guías" (para /transfer-deposito-containerV2) ---
  $('#asignarGuiasBtn').on('click', function() {
      const guiaIds = [];
      $('#lista_agencias_disponibles .guia-checkbox:checked').each(function() {
          guiaIds.push($(this).val()); // .val() obtiene el atributo value (guia._id)
      });

      if (guiaIds.length === 0) {
          Swal.fire('Atención', 'Debes seleccionar al menos una guía para transferir.', 'warning');
          return;
      }
      console.log('Guía IDs seleccionadas para transferir a container:', guiaIds);

      // !!! IMPORTANTE: Asegúrate de que las variables 'conductor_carga' y 'container'
      // estén definidas y tengan los valores correctos aquí.
      // 'conductor_carga' se establece cuando cambia el dropdown #kt_datatable_search_type2.
      // 'container' debe ser obtenida de alguna otra parte de tu UI o lógica.
      // Ejemplo: const container = $('#id_del_selector_container').val();

      if (typeof conductor_carga === 'undefined' || conductor_carga === null || conductor_carga === '') {
           Swal.fire('Error de Configuración', 'No se ha especificado el depósito de origen (conductor_carga).', 'error');
           return;
      }
      if (typeof container === 'undefined' || container === null || container === '') { // Asumiendo que 'container' es una variable que debes tener
           Swal.fire('Error de Configuración', 'No se ha especificado el container de destino.', 'error');
           return;
      }

      $.ajax({
          url: '/transfer-deposito-containerV2', // La nueva URL para esta acción
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              guias: guiaIds,
              deposito: conductor_carga, // 'conductor_carga' (el ID del dropdown) se usa como 'deposito'
              container: container        // Esta variable 'container' debe estar definida en tu scope
          }),
          success: function(response) {
              Swal.fire(
                  '¡Éxito!',
                  response.message || 'Las guías seleccionadas han sido transferidas al container.', // Mensaje ajustado
                  'success'
              ).then(() => {
                  location.reload(); // Recargar la página o actualizar la UI según sea necesario
              });
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.error('Error AJAX al transferir a container:', jqXHR.responseText, textStatus, errorThrown);
              let errorMessage = 'Ocurrió un problema inesperado durante la transferencia.';
              if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                  errorMessage = jqXHR.responseJSON.message;
              } else if (jqXHR.status === 404) {
                  errorMessage = 'Una o más guías no existen o tienen un estado inválido.';
              } else if (jqXHR.status === 409) {
                  errorMessage = 'Conflicto al procesar la transferencia. Verifique el estado de las guías.';
              }
              Swal.fire('Error', errorMessage, 'error');
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

