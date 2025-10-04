var data = pagos;

var KTDatatableRemoteAjaxDemo = function() {
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
    var demo = function() {
        var datatable = $('#kt_datatable_pagos').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: data,
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
                    field: 'Actions',
                    title: 'Acciones',
                    sortable: false,
                    width: 125,
                    overflow: 'visible',
                    autoHide: false,
                    template: function(row) {
                        return `
                          
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
        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'agencia._id');
            sumMontos();
        });

        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'forma_pago._id');
            sumMontos();
        });

        $('#kt_datetimepicker_1, #kt_datetimepicker_1_2').on('change.datetimepicker', function() {
            // Obtener las fechas seleccionadas
            var desdeDate = $('#kt_datetimepicker_1').val();
            var hastaDate = $('#kt_datetimepicker_1_2').val();
        
            // Convertir las fechas seleccionadas al formato UTC (ISO)
            var fechaDesdeUTC = desdeDate ? new Date(desdeDate).toISOString() : null;
            var fechaHastaUTC = hastaDate ? new Date(hastaDate + 'T23:59:59.999Z').toISOString() : null;
        
            console.log('Fecha Desde:', fechaDesdeUTC);
            console.log('Fecha Hasta:', fechaHastaUTC);
        
            // Filtrar los datos según las fechas seleccionadas
            var filteredData = data.filter(function(row) {
                var fechaRow = new Date(row.fecha).toISOString(); // Formato de la fecha en el dataset
        
                // Verificar si la fecha del row está dentro del rango seleccionado
                return (!fechaDesdeUTC || fechaRow >= fechaDesdeUTC) &&
                       (!fechaHastaUTC || fechaRow <= fechaHastaUTC);
            });
        
            console.log('Datos Filtrados:', filteredData);
        
            // Actualizar los datos del datatable
            datatable.originalDataSet = filteredData;
            datatable.reload();
        });
 


};

    return {
        init: function() {
            demo();
        },
    };
}();

jQuery(document).ready(function() {
    KTDatatableRemoteAjaxDemo.init();
});
