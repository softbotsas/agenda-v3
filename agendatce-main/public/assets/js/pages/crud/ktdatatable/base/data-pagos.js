let data = [];

$(document).ready(function () {
   
    var datatable;
   
    // Función para inicializar el datatable con los datos obtenidos
    function inicializarDatatable(datos) {


        console.log(datos);
     
      if (datatable) {
        datatable.destroy(); // Destruir la instancia existente para reinicializarla
      }
  
    // Private functions
    var sumMontos = function() {
        var total = 0;
       
        // Obtener todas las filas originales del datatable
        var rows = $('#kt_datatable_pagos').KTDatatable().originalDataSet;

        if (rows && rows.length) {
            rows.forEach(function(row) {
                // Parsear el monto como número (sin el símbolo $ ni separadores)
                var monto = parseFloat(row.monto) || 0;
                total += monto;
            });
        }

        // Mostrar el total en una última fila dentro del datatable
        var totalFormateado = `$${total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
        
        // Crear o actualizar la fila de total en el pie de tabla
        var totalRow = `
            <tr style="font-size:20px">
                <td colspan="4" style="text-align:right;"><strong>Total a Cobrar</strong></td>
                <td><strong>${totalFormateado}</strong></td>
                <td colspan="2"></td>
            </tr>
        `;
        
        // Verificar si el pie de tabla ya existe, si no, agregarlo
        if ($('#kt_datatable_pagos tfoot').length === 0) {
            $('#kt_datatable_pagos').append('<tfoot></tfoot>');
        }
        
        $('#kt_datatable_pagos tfoot').html(totalRow);
    };

    // Basic demo
 
         datatable = $('#kt_datatable_pagos').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: datos,
                pageSize: 20,
            },

            // layout definition
            layout: {
                scroll: true,
                footer: true, // Cambiar a true para activar el pie de tabla
            },

            // column sorting
            sortable: true,

            pagination: true,

            search: {
                input: $('#kt_datatable_search_query'),
                key: 'generalSearch'
            },
            
            columns: [
                {
                    field: 'agencia._id',
                    title: 'Códigoage',
                    visible: false
                },
                {
                    field: 'forma_pago._id',
                    title: 'parma pago',
                    visible: false
                },
                {
                    field: 'guia.nro_guia_fecha',
                    title: 'Guia / Fecha2',
                    autoHide: false,
                    template: function(row) {
                        var fecha = new Date(row.fecha);
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
                        var anio = fecha.getFullYear();
                        var fechaFormateada = `${anio}/${mes}/${dia}`;
                
                        return `
                            <div>
                                <strong>${row.guia.nro_guia}</strong><br/>
                                <span>${fechaFormateada}</span>
                            </div>
                        `;
                    }
                },
                {
                    field: 'forma_pago.nombre_forma',
                    title: 'F. Pago',
                    autoHide: false,
                    template: function(row) {
                        return `
                            <div>
                                <strong>${row.forma_pago.tipo_forma_pago.nombre_tipo}</strong><br/>
                                <span>${row.forma_pago.nombre_forma}</span>
                            </div>
                        `;
                    } 
                }, 
                {
                    field: 'agencia.NOMBRE',
                    title: 'Agencia',
                    autoHide: false
                },
                {
                    field: 'monto',
                    title: 'Monto',
                    autoHide: false, 
                    template: function(row) {
                        const totalFormateado = `$${Number(parseFloat(row.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        return totalFormateado;
                    }    
                },
                {
                    field: 'comision.monto',
                    title: 'Comision Pagada',
                    autoHide: false, 
                    template: function(row) {
                        if (!row.comision || row.comision.monto == null) {
                            // Si el valor es null o undefined, devuelve 0
                            return '0';
                        }
                        // Formatea el número si existe
                        const totalFormateado = `$${Number(parseFloat(row.comision.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        return totalFormateado;
                    }    
                },
                {
                    field: 'Actions',
                    title: 'Acciones',
                    sortable: false,
                    width: 125,
                    overflow: 'visible',
                    autoHide: false,
                    template: function(row) {
                        return `
                            <form action="/pagos/delete/${row._id}?_method=DELETE" method="POST" style="display:inline;" class="form-delete-pago">
                            <button type="submit" class="btn-delete-pago btn btn-sm btn-clean btn-icon" title="Delete" style="background:none; border:none; padding:0;">
                                <span class="svg-icon svg-icon-md">
                                    <i class="icon-2x text-dark-50 flaticon2-rubbish-bin"></i>
                                </span>
                            </button>
                        </form>
                            <a href="/factura_guia/${row.guia.nro_guia}" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">
                                <span class="svg-icon svg-icon-md">
                                    <i class="icon-2x text-dark-50 flaticon-interface-11"></i>
                                </span>
                            </a>
                            ${row.imagen_comprobante ? `<a href="${row.imagen_comprobante}" target="_blank" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Imagen">
                                <span class="svg-icon svg-icon-md">
                                    <i class="icon-2x text-dark-50 flaticon-photo-camera"></i>
                                </span>
                            </a>` : ''}
                        `;
                    }
                },
                {
                    field: 'usuario.name',
                    title: 'Usuario',
                    autoHide: true
                }
            ],
        });

        datatable.on('datatable-on-init', sumMontos);
        datatable.on('datatable-on-reloaded', sumMontos);
        datatable.on('datatable-on-layout-updated', sumMontos);
        
        // Ejecutar la suma después de cualquier cambio en los filtros
      
 




};

$('#kt_datatable_pagos').on('submit', '.form-delete-pago', function(e) {
    e.preventDefault(); // Evitar que se envíe el formulario de inmediato
    const form = this;

    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Esta acción eliminará el pago!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit(); // Si se confirma, enviar el formulario
        }
    });
});


$('#informacion_comi').click(function () {
    
    var desdeDate = $('#kt_datetimepicker_1').val();
    var hastaDate = $('#kt_datetimepicker_1_2').val();
    
    var desde = desdeDate ? new Date(desdeDate).toISOString() : null;
    var hasta = hastaDate ? new Date(hastaDate + 'T23:59:59.999Z').toISOString() : null;
   
    var busqueda = $('#kt_datatable_search_query').val();
    var agencia = $('#kt_datatable_search_status').val();

    var ruta = $('#kt_datatable_search_type').val();
    
    var formaP =$('#kt_datatable_search_type2').val();
    

    
    // Validar que las fechas estén seleccionadas
   

    // Realizar la consulta a tu backend
    $.ajax({
      url: '/bsucar_pagos_porcobrar_agencia', // Asegúrate de que esta URL es correcta
      method: 'GET',
      data: {
        desde: desde,
        hasta: hasta,
        busqueda: busqueda,
        agencia: agencia,
         ruta : ruta,
         formaP
      },
      success: function (response) {
        console.log('hola');
        console.log(response.pagos);
        data = response.pagos;
        inicializarDatatable(data);
      },
      error: function (error) {
        console.error('Error al obtener datos:', error);
        alert('Hubo un error al consultar los datos.');
      },
    });
  });






});



function exportToPDF() {
    // Obtener los valores y textos de los filtros
    const rutaSelect = document.getElementById('kt_datatable_search_type');
    const ruta_text = rutaSelect.options[rutaSelect.selectedIndex].text;
    const ruta_id = rutaSelect.value; // Forma de pago

    const agenciaSelect = document.getElementById('kt_datatable_search_status');
    const agencia_text = agenciaSelect.options[agenciaSelect.selectedIndex].text;
    const agencia_id = agenciaSelect.value; // Agencia

    // Obtener las fechas seleccionadas
    const desdeDate = document.getElementById('kt_datetimepicker_1').value;
    const hastaDate = document.getElementById('kt_datetimepicker_1_2').value;
    const fechaDesdeUTC = desdeDate ? new Date(desdeDate).toISOString() : null;
    const fechaHastaUTC = hastaDate ? new Date(hastaDate + 'T23:59:59.999Z').toISOString() : null;

    // Inicializar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título y filtros en el encabezado del PDF
    doc.setFontSize(18);
    doc.text('Reporte de Pagos', 14, 22);

    doc.setFontSize(12);
    doc.text('Filtros aplicados:', 14, 30);
    doc.text(`Forma de Pago: ${ruta_text}`, 14, 36);
    doc.text(`Agencia: ${agencia_text}`, 14, 42);
    if (desdeDate) {
        doc.text(`Desde: ${new Date(desdeDate).toLocaleDateString()}`, 14, 48);
    }
    if (hastaDate) {
        doc.text(`Hasta: ${new Date(hastaDate).toLocaleDateString()}`, 14, 54);
    }

    // Filtrar los datos según los criterios seleccionados
    // Se asume que 'data' es la variable global o el arreglo que contiene todos los pagos ya cargados.
    let filteredData = data;

    // Filtrar por Forma de Pago (ruta)
    if (ruta_id && ruta_id !== 'Todas') {
        filteredData = filteredData.filter(row => row.forma_pago && row.forma_pago._id === ruta_id);
    }

    // Filtrar por Agencia
    if (agencia_id && agencia_id !== 'Todas') {
        filteredData = filteredData.filter(row => row.agencia && row.agencia._id === agencia_id);
    }

    // Filtrar por rango de fecha
    if (fechaDesdeUTC || fechaHastaUTC) {
        filteredData = filteredData.filter(row => {
            const fechaRow = new Date(row.fecha).toISOString();
            return (!fechaDesdeUTC || fechaRow >= fechaDesdeUTC) &&
                   (!fechaHastaUTC || fechaRow <= fechaHastaUTC);
        });
    }

    // Calcular el total de Monto Cobrado (suma de los montos)
    const totalMonto = filteredData.reduce((sum, row) => sum + (parseFloat(row.monto) || 0), 0);

    // Definir el encabezado y el cuerpo de la tabla para el PDF.
    // Si algún campo puede faltar, se muestra un mensaje alternativo.
    const head = [[
        'Nro. Guía', 
        'F. Pago', 
        'Agencia', 
        'Cobrado por', 
        'Monto Cobrado', 
        'Comisión Pagada'
    ]];
    const body = filteredData.map(row => [
        // Combina el número de guía con la fecha (formato local)
        `${row.guia?.nro_guia || 'Guía no disponible'} - ${new Date(row.fecha).toLocaleDateString()}`,
        row.forma_pago?.nombre_forma || 'Forma de pago no disponible',
        row.cliente || 'No disponible',      // Ajusta este campo según la información para la agencia
        row.usuario?.name || 'Usuario no disponible',
        `$${(Number(row.monto) || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
        `$${(Number(row.comision?.monto) || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    ]);

    // Agregar la tabla al PDF usando autoTable (asegúrate de tener el plugin autoTable)
    doc.autoTable({
        startY: 60,
        head: head,
        body: body,
        styles: { fontSize: 8 }
    });

    // Agregar el total al final de la tabla
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Cobrado: $${totalMonto.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 14, finalY);

    // Abre el PDF en una nueva ventana o pestaña
    doc.output('dataurlnewwindow');
}

