
// ========================================
// 1) Preparar las funciones y datos
// ========================================
var data = mov_container; // Asumimos que "mov_container" está definido en tu vista
console.log('la holla',  data);

var status_es = status_especiales;
/** 
 *  agruparPorPais => crea un objeto { pais: [items...] }
 *  Quedará igual a antes, pero lo usaremos para 
 *  generar un array con índice.
 */
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
          field: 'index',
          title: '#',
          template: function(row, index) {
            return index + 1;
          }
        },
        {
          field: 'guia',
          title: 'Guía',
          template: function(row) {
            return row.guia.nro_guia;
          }
        },
        {
          field: 'status',
          title: 'Status',
          template: function(row) {
            return obtenerDescripcionStatus(row.guia.status);
          }
        },
        {
          field: 'referencia',
          title: 'Referencia',
          template: function(row) {
            return row.guia.referencia1 || '';
          }
        },
        {
          field: 'dimensiones',
          title: 'Dimensiones',
          template: function(row) {
            const detallesCaja = row.detalles_caja || {};
            return `${detallesCaja.alto || ''} X ${detallesCaja.ancho || ''} X ${detallesCaja.largo || ''}`;
          }
        },
        {
          field: 'caja',
          title: 'Caja Nro',
          template: function(row) {
            return row.cant_caja;
          }
        },
        {
          field: 'tgPais',
          title: 'TG Pais',
          template: function(row) {
            if (row.seguimientos && row.seguimientos.length > 0) {
              const segG = row.seguimientos.filter(s => s.estado && s.estado.tipo === 'G transporte');
              return segG.length > 0 ? segG[segG.length - 1].observacion : '';
            }
            return '';
          }
        },
        {
          field: 'tgTransporte',
          title: 'TG Transporte',
          template: function(row) {
            if (row.seguimientos && row.seguimientos.length > 0) {
              return `<a href="${row.seguimientos[0].imagen}" target="_blank">
                        ${row.seguimientos[0].observacion}
                      </a>`;
            }
            return '';
          }
        },
        {
          field: 'monto',
          title: 'Monto',
          template: function(row) {
            return row.guia.total_fac 
              ? '$' + parseFloat(row.guia.total_fac).toFixed(2)
              : 'N/A';
          }
        },
        {
          field: 'accion',
          title: 'Acción',
          template: function(row) {
            return `
              <a class="btn btn-sm btn-primary" title="Editar"
                 href="/factura_guia/${row.guia.nro_guia}" target="_blank">
                <i class="icon-xl la la-file-invoice"></i>
              </a>
              <a class="btn btn-sm btn-primary" title="Entregar"
                 href="/factura_guia_entrega/${row.guia.nro_guia}/${row.cant_caja}" target="_blank">
                <i class="icon-xl la la-file-signature"></i>
              </a>
            `;
          }
        }
      ]
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
      // Para cada ítem en row.guias, generamos un string "nro_guia/cant_caja"
      const guiaCajaPairs = row.guias.map(guia => {
        // Obtenemos el número de guía (si existe) y el número de caja (si no existe, se asume "1")
        const nro_guia = (guia.guia && guia.guia.nro_guia) ? guia.guia.nro_guia : '';
        const caja = guia.cant_caja ? guia.cant_caja : '1';
        return `${nro_guia}-${caja}`;
      });
    
      // Filtrar pares vacíos y unirlos con comas
      const guiasParam = guiaCajaPairs.filter(pair => pair.trim() !== '').join(',');
    
      // Construir la URL usando el parámetro formado
      const url = `/generate-multiplepdfsguias/${guiasParam}`;
      console.log('URL generada para impresión masiva:', url);
    
      // Abrir la URL en una nueva pestaña
      window.open(url, '_blank');
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
            success: function (response) {
              Swal.fire(
                '¡Éxito!',
                response.message || 'Operación realizada con éxito.',
                'success'
              ).then(() => location.reload());
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
    


    // ========================================
    // 4) Manejo de #kt_datatable_search_type2 (igual que tu código)
    // ========================================
    $('#kt_datatable_search_type2').on('change', function() {
      const userId = $(this).val();
      console.log('Usuario seleccionado:', userId);

      $('#loadingSpinner').show();
      $('#lista_agencias_disponibles').empty();
      
      // Llamada AJAX para filtrar guías por el usuario seleccionado
      $.ajax({
        url: '/container_fisico/carga/' + userId,
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
            $('#lista_agencias_disponibles').append('<li>No hay guías para este conductor.</li>');
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


    // ========================================
    // 5) #asignarGuiasBtn (igual que tu código)
    // ========================================
    $('#asignarGuiasBtn').on('click', function() {
      const guiaIds = guias_asignar_trailer.map(guia => guia._id);

      if (guiaIds.length === 0) {
        alert('No hay guías para asignar.');
        return;
      }
      console.log('Guía IDs a asignar:', guiaIds);

      $.ajax({
        url: '/transfer-trailer-deposito3',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
          guias: guiaIds, 
          containerV: conductor_carga,
          container_fisico : container_fisico
        }),
        success: function(response) {
          Swal.fire(
            '¡Éxito!',
            response.message || 'La guía ha sido asignada a este tráiler.',
            'success'
          ).then(() => location.reload());
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
      const i = $(this).data('index');
      const neuvo_status = $(`#status-options-${i} .status-select`).val();
      const row = entriesConIndices[i].guias; // { i, pais, guias }
      console.log(row)
      
      const selectedStatus = $(`#status-options-${i} .status-select option:selected`).text();
      // Obtener las guías para actualizar
      const guiaIds = row.map(guia => guia.guia._id);
      const guia_nro = row.map(guia => guia.guia.nro_guia);
        console.log(neuvo_status)
        console.log(guiaIds)
        console.log(guia_nro)
    
      $.ajax({
        url: '/actualizar-status', // Ruta de tu API
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          guiaIds,
          neuvo_status, selectedStatus, guia_nro
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
          let detallesHTML = `
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guía</th>
                   <th>Status</th>
                  <th>Referencia</th>
                  <th>Dimensiones</th>
                  <th>Caja Nro</th>
                  <th>TG Pais</th>
                  <th>TG Transporte</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${row.guias.map((guia, index) => {
                  const detallesCaja = guia.detalles_caja || {};
                  // TG Transporte

                  const tgTransporte = (guia.seguimientos && guia.seguimientos.length > 0)
                  ? `<a href="${guia.seguimientos[0].imagen}" target="_blank">
                      ${guia.seguimientos[0].observacion}
                    </a>`
                  : '';

                const tgPais = (guia.seguimientos && guia.seguimientos.length > 0)
                  ? (() => {
                      const segG = guia.seguimientos.filter(s => s.estado && s.estado.tipo === 'G transporte');
                      return segG.length > 0 ? segG[segG.length - 1].observacion : '';
                    })()
                  : '';

                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${guia.guia.nro_guia}</td>
                       <td>${obtenerDescripcionStatus(guia.guia.status)}</td>
                      <td>${guia.guia.referencia1 || ''}</td>
                      <td>${detallesCaja.alto || ''} X 
                          ${detallesCaja.ancho || ''} X 
                          ${detallesCaja.largo || ''}
                      </td>
                      <td>${guia.cant_caja}</td>
                      <td>${tgPais}</td>
                      <td>${tgTransporte}</td>
                      <td>
                        ${
                          guia.guia.total_fac 
                          ? '$' + parseFloat(guia.guia.total_fac).toFixed(2) 
                          : 'N/A'
                        }
                      </td>
                      <td>
                        <a class="btn btn-sm btn-primary" title="Editar"
                           href="/factura_guia/${guia.guia.nro_guia}" 
                           target="_blank">
                          <i class="icon-xl la la-file-invoice"></i>
                        </a>
                        <a class="btn btn-sm btn-primary" title="Entregar"
                           href="/factura_guia_entrega/${guia.guia.nro_guia}/${guia.cant_caja}" 
                           target="_blank">
                          <i class="icon-xl la la-file-signature"></i>
                        </a>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
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
      case "17":
        return "Entrega Notificada";  
    default:
      return "Estado desconocido";  // Para cualquier otro valor no previsto
  }

}
// Al cargar el DOM, inicializamos la tabla
jQuery(document).ready(function() {
  KTDatatableRemoteAjaxDemo.init();
});

