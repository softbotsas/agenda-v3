$(document).ready(function () {
    let data = [];
    var datatable;
  
    // Función para inicializar el datatable con los datos obtenidos
    function inicializarDatatable(datos) {
    
    
      console.log(datos);
      if (datatable) {
        datatable.destroy(); // Destruir la instancia existente para reinicializarla
      }
  
      datatable = $('#kt_datatable_guia_5').KTDatatable({
        // Definición del datasource
        data: {
          type: 'local',
          source: datos,
          pageSize: 20,
        },
  
        // Definición del layout
        layout: {
          scroll: true,
          footer: false,
        },
  
        // Definición de sorting y pagination
        sortable: true, // Habilita el ordenamiento
        pagination: true,
  
        search: {
          input: $('#kt_datatable_search_query'),
          key: 'generalSearch'
        },
  
        columns: [
          {
            field: 'nro_guia',
            title: 'Número de Guía'
          },
          {
            field: 'fechaFormateada', // Asegúrate de que este campo existe en tus datos
            title: 'Fecha'
          },

          
          {
            field: 'fechaRecepcionFormateada', // Asegúrate de que este campo existe en tus datos
            title: 'Fecha a Recoger'
          },
          {
            field: 'nom_cliente_remite',
            title: 'Remitente',
          },
          {
            field: 'agencia2',
            title: 'Agencia',
            autoHide: false,
            template: function(row) {
              return row.agencia.NOMBRE;
            }
          },
          {
            field: 'total_fac',
            title: 'Monto',
            template: function(row) {
              const totalFormateado = `$${Number(parseFloat(row.total_fac)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
              return totalFormateado;
            }
          },
          {
            field: 'estatus',
            title: 'Estatus'
          },
          {
            field: 'Actions',
            title: 'Acciones',
            sortable: false,
            width: 125,
            overflow: 'visible',
            autoHide: false,
            template: function(row) {
              const ciudad = row.ciudad_remite?.[0]?.name || 'Ciudad desconocida';
              const estado = row.estado_remite?.[0]?.name || 'Estado desconocido';
              const pais = row.pais_remite?.[0]?.name || 'País desconocido';
              const direccion = row.direccion_remite || 'Dirección desconocida';
              const zip = row.zip_remite || 'Sin ZIP';
              const lugar = row.lugar_recogida || 'Lugar no definido';
              const agencia = JSON.stringify(row.agencia).replace(/'/g, "&apos;");
              const diasRuta = row.rutaInfo || 'Sin información de ruta';
  
              return `
                <a href="/factura_guia/${row.nro_guia}" target="_blank" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">
                  <span class="svg-icon svg-icon-md">
                    <i class="icon-2x text-dark-50 flaticon-interface-11"></i>
                  </span>
                </a>
               
   
              `;
            },
          }
        ],

        
      });
  
      // Eventos de filtros
     
     
  
      // Evento para detectar clicks en los botones de anulación
      $(document).on('click', '.btn-anular', function () {
        const guiaId = $(this).data('id');
  
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción anulará la guía. No se puede revertir.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, anular',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Hacer la petición AJAX al backend
            $.ajax({
              url: `/guia/delete/${guiaId}`,
              method: 'PUT', // Cambia al método requerido
              contentType: 'application/json',
              success: function (data) {
                if (data.success) {
                  Swal.fire(
                    '¡Anulada!',
                    'La guía ha sido anulada correctamente.',
                    'success'
                  ).then(() => location.reload()); // Recargar la página si es necesario
                } else {
                  Swal.fire(
                    'Error',
                    data.message || 'No se pudo anular la guía.',
                    'error'
                  );
                }
              },
              error: function () {
                Swal.fire(
                  'Error',
                  'Hubo un problema con la petición.',
                  'error'
                );
              }
            });
          }
        });
      });
    }
  
    // Función para cargar las guías desde la API
    function cargarGuias() {
      $.ajax({
        url: '/api/guias5', // Asegúrate de que esta URL coincide con tu ruta de API
        method: 'GET',
        success: function(response) {
          if (response.success) {
            data = response.data;
            inicializarDatatable(data);
          } else {
            console.error('Error al obtener las guías:', response.message);
            alert('Hubo un error al cargar las guías.');
          }
        },
        error: function(error) {
          console.error('Error en la solicitud AJAX:', error);
          alert('Hubo un error al cargar las guías.');
        }
      });
    }
  
    // Cargar las guías al cargar la página
   // cargarGuias();
  
    // Evento para el botón de búsqueda
    $('#informacion_comi').click(function () {
      var desde = $('#kt_datetimepicker_1').val();
      var hasta = $('#kt_datetimepicker_1_2').val();
      var busqueda = $('#kt_datatable_search_type').val();
      var agencia = $('#origenes-select').val();
      console.log(agencia);
      // Validar que las fechas estén seleccionadas
      if (!desde || !hasta) {
        alert('Por favor selecciona ambas fechas.');
        return;
      }
  
      // Realizar la consulta a tu backend
      $.ajax({
        url: '/guia_pdt_registrar_agencia5', // Asegúrate de que esta URL es correcta
        method: 'GET',
        data: {
          desde: desde,
          hasta: hasta,
          busqueda: busqueda,
          agencia: agencia,
        },
        success: function (response) {
          // Actualizar el datatable con los nuevos datos
          console.log(response.data);
          data = response.data;
          inicializarDatatable(data);
        },
        error: function (error) {
          console.error('Error al obtener datos:', error);
          alert('Hubo un error al consultar los datos.');
        },
      });
    });

   
});
 // Función para exportar a Excel
 function exportToExcelX() {
  // Obtener los datos de la tabla
  const table = document.getElementById('kt_datatable_guia_2_1'); // ID de la tabla
  const rows = table.querySelectorAll('tbody tr');  // Todas las filas del cuerpo de la tabla

  // Crear un arreglo para almacenar los datos
  const data = [];

  // Agregar los encabezados
  const headers = ['#', 'Número de Guía', 'Fecha', 'Remitente', 'Agencia', 'Monto', 'Estatus'];
  data.push(headers);

  // Variables para la sumatoria de "Monto"
  let contador = 0;
  let totalMonto = 0;

  // Iterar sobre cada fila y extraer los datos
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');

    // Asegúrate de que la fila tenga suficientes celdas
    if (cells.length >= 7) { // Ajustado a 7 celdas
      contador++;
      const guia = cells[0].innerText.trim();       // Número de Guía (nro_guia)
      const fecha = cells[1].innerText.trim();      // Fecha Formateada (fechaFormateada)
      const remite = cells[2].innerText.trim();     // Remitente (nom_cliente_remite)
      const agencia = cells[3].innerText.trim();    // Agencia (agencia2)
      const montoText = cells[4].innerText.trim();  // Monto (total_fac)
      const status = cells[5].innerText.trim();      // Estatus (estatus)

      const monto = parseFloat(montoText.replace(/[^0-9.-]+/g, "")) || 0; // Convertir a número

      totalMonto += monto;

      // Añadir los datos a la matriz con el contador
      data.push([contador, guia, fecha, remite, agencia, monto, status]);
    }
  });

  // Agregar una fila para la sumatoria total de "Monto"
  data.push(['', '', '', '', 'Total', totalMonto, '']);

  // Crear una hoja de trabajo
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Formatear la columna "Monto" como numérica con dos decimales
  for (let i = 1; i <= rows.length; i++) { // Empezar desde 1 para omitir encabezados
    const cellAddress = XLSX.utils.encode_cell({ c: 5, r: i }); // Columna F (Monto)
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].t = 'n'; // Tipo numérico
      worksheet[cellAddress].z = '#,##0.00'; // Formato de número con dos decimales
    }
  }

  // Formatear la fila de total en negrita y con separadores de miles
  const totalRow = rows.length + 1; // Última fila
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
    const cellAddress = `${col}${totalRow + 1}`; // +1 para índices 1-based
    if (worksheet[cellAddress]) {
      if (col === 'F') { // Columna Monto
        worksheet[cellAddress].t = 'n';
        worksheet[cellAddress].z = '#,##0.00';
      }
      // Aplicar negrita
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {};
      }
      worksheet[cellAddress].s.font = { bold: true };
    }
  });

  // Crear un libro de trabajo y añadir la hoja
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Guías');

  // Generar el archivo Excel y descargarlo
  XLSX.writeFile(workbook, 'Reporte_de_Guias.xlsx');
}

// Función para exportar a PDF
function exportToPDFX() {
const { jsPDF } = window.jspdf;

// Crear un nuevo documento PDF
const doc = new jsPDF();

// Agregar un encabezado en la parte superior
doc.setFontSize(18);
doc.text('Reporte de Guías', 14, 22);  // Texto en posición (x=14, y=22)

// Agregar un subtítulo debajo del encabezado
doc.setFontSize(12);
doc.text('Lista de Guías Procesadas', 14, 30);
doc.setFontSize(10);
doc.text('Reporte generado el: ' + new Date().toLocaleDateString(), 14, 36);

// Obtener los datos de la tabla (filas)
const table = document.getElementById('kt_datatable_guia_2_1'); // ID de la tabla
const rows = table.querySelectorAll('tbody tr');  // Todas las filas del cuerpo de la tabla

// Encabezados de la tabla
const head = [['#', 'Número de Guía', 'Fecha', 'Remitente', 'Agencia', 'Monto', 'Estatus']];

// Iterar sobre cada fila y extraer los datos
const body = [];
let contador = 0;
let totalMonto = 0; // Variable para acumular la sumatoria de "Monto"

rows.forEach(row => {
  const cells = row.querySelectorAll('td');

  // Asegúrate de que la fila tenga suficientes celdas
  if (cells.length >= 7) { // Ajustado a 7 celdas
    contador++;
    const guia = cells[0].innerText.trim();       // Número de Guía (nro_guia)
    const fecha = cells[1].innerText.trim();      // Fecha Formateada (fechaFormateada)
    const remite = cells[2].innerText.trim();     // Remitente (nom_cliente_remite)
    const agencia = cells[3].innerText.trim();    // Agencia (agencia2)
    const montoText = cells[4].innerText.trim();  // Monto (total_fac)
    const status = cells[5].innerText.trim();      // Estatus (estatus)

    const monto = parseFloat(montoText.replace(/[^0-9.-]+/g, "")) || 0; // Convertir a número

    totalMonto += monto;

    // Añadir los datos a la tabla con el contador
    body.push([contador, guia, fecha, remite, agencia, monto, status]);
  }
});

// Añadir una fila para la sumatoria total de "Monto"
body.push(['', '', '', '', 'Total', totalMonto, '']);

// Ajustar la posición de la tabla para no sobreponerla con el encabezado
doc.autoTable({
  startY: 50,  // Iniciar la tabla un poco más abajo
  head: head,  // Encabezados de la tabla
  body: body,  // Cuerpo de la tabla
  styles: {
    fontSize: 8  // Reducir el tamaño de la fuente a 8
  },
  didDrawCell: (data) => {
    // Aplicar estilo de negrita y color de fondo a la fila de total
    if (data.row.index === body.length - 1 && data.section === 'body') { // Última fila del cuerpo
      data.cell.styles.fontStyle = 'bold';
      data.cell.styles.fillColor = [211, 211, 211]; // Color de fondo gris claro
    }
  }
});

// Obtener el número total de páginas
const totalPages = doc.getNumberOfPages();

// Agregar la sumatoria al pie de la última página con separadores de miles
doc.setPage(totalPages);
const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
doc.setFont('helvetica', 'bold');
doc.text('Total Monto: ' + totalMonto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 14, pageHeight - 10);

// Mostrar el PDF en una nueva ventana/pestaña
doc.output('dataurlnewwindow');
}