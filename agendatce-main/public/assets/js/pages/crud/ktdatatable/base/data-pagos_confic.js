var data = pagos;

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_pagos_confi').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: data,
                pageSize: 20,
                
            },

            // layout definition
            layout: {
                scroll: true,
                footer: false,
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
                    field: 'agencia.NOMBRE',
                    title: 'Código de age',
                    visible: false
                },
                {
                    field: 'forma_pago._id',
                    title: 'parma pago',
                    visible: false
                },
               
                
                {
                    field: 'guia.nro_guia_fecha',
                    title: 'Guia / Fecha',
                    autoHide: false,
                    template: function(row) {
                        // Formatear la fecha como YYYY/MM/DD
                        var fecha = new Date(row.fecha);
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
                        var anio = fecha.getFullYear();
                        var fechaFormateada = `${anio}/${mes}/${dia}`;
                
                        // Combinar nro_guia y fecha en una sola columna
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
                    field: 'usuario.name',
                    title: 'Usuario',
                    autoHide: false
                },
                
                {
                    field: 'monto',
                        title: 'Monto',
                        autoHide: false, 
                        template: function(row) {
                            const totalFormateado = `$${Number(parseFloat(row.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                            return  totalFormateado;
                        }    
                }
              
                ,
                {
          field: 'Actions',
          title: 'Acciones',
          sortable: false,
          width: 125,
          overflow: 'visible',
          autoHide: false,
          template: function(row) {
            return '\<form action="' + row._id + '?_method=DELETE" method="POST" style="display:inline;">\
                            <button type="submit" class="btn btn-sm btn-clean btn-icon" title="Delete" style="background:none; border:none; padding:0;">\
                                <span class="svg-icon svg-icon-md">\
                                <i class="icon-2x text-dark-50 flaticon2-rubbish-bin"></i>\
                                </span>\
                            </button>\
                            </form>\
                            <a  href="/factura_guia/' + row.guia.nro_guia  + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">\
                             <span class="svg-icon svg-icon-md">\
                             <i class="icon-2x text-dark-50 flaticon-interface-11"></i>\
                             </span>\
                             </a>\
                              ';
          },
        
        
        }
                // Add more columns if needed
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'agencia');
            console.log($(this).val());
        });
        
        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'forma_pago._id');
        });
        
        // Manejar el cambio en los datetimepickers
        $('#kt_datetimepicker_1, #kt_datetimepicker_1_2').on('change.datetimepicker', function() {
            // Obtener las fechas seleccionadas en el formato YYYY-MM-DD
            var desdeDate = $('#kt_datetimepicker_1').find("input").val();
            var hastaDate = $('#kt_datetimepicker_1_2').find("input").val();
         console.log(desdeDate)
         console.log(hastaDate)
            // Filtrar el datatable
            datatable.search({
                desde: desdeDate,
                hasta: hastaDate
            }, 'fecha'); // Asumiendo que 'fecha' es el campo en tu datatable para filtrar por fecha
        });
        
    };

    return {
        // public functions
        init: function() {
            demo();
        },
    };
}();

jQuery(document).ready(function() {
    KTDatatableRemoteAjaxDemo.init();
});
