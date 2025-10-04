var data = guias;

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_guia_3').KTDatatable({
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
                    field: 'cajaNro',
                    title: 'Pq Nro',
                    autoHide: false,
            
                },
                {
                    field: 'agencia._id',
                    title: 'Código de2 age',
                    visible: false
                },
                {
                    field: 'ruta',
                    title: 'Código de Ruta',
                    visible: false
                },
                
                {
                    field: 'nro_guia_fecha',
                    title: 'N° / Fecha',
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
                                <strong>${row.nroGuia}</strong><br/>
                                <span>${row.fecha}</span>
                            </div>
                        `;
                    }
                },
                
             
                {
                    field: 'laguia.nom_cliente_remite',
                    title: 'Cliente',
                    autoHide: false
                },
                {
                    field: 'ruta',
                    title: 'Ruta',
                    autoHide: false,
                    template: function(row) {
                        const rutaMatch = row.rutaInfo.match(/Ruta: (.+)/);
                        return rutaMatch ? rutaMatch[1] : 'Ruta no disponible';
                    }
                },
                {
                    field: 'total_fac',
                        title: 'Monto',
                        autoHide: false, 
                        template: function(row) {
                            const totalFormateado = `$${Number(parseFloat(row.laguia.total_fac)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                            return  totalFormateado;
                        }    
                },
                {
                    field: 'agencia',
                    title: 'Agencia',
                    autoHide: false, 
                    template: function(row) {
                       
                        return row.agencia.NOMBRE
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
            return '\<a  href="/factura_guia/' + row.nro_guia  + '" target="_blank" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">\
                             <span class="svg-icon svg-icon-md">\
                             <i class="icon-2x text-dark-50 flaticon-interface-11"></i>\
                             </span>\
                             </a>\
                        ';
          },
        
        
        },
        
        {
            field: 'Usuario3',
                title: 'Recibido en Deposito por:',
                autoHide: true, 
                template: function(row) {
                  
                
                    return  row.usuarioChequeo.name;
                    
                }    

               
        }
                // Add more columns if needed
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'agencia._id');
            console.log($(this).val());
        });
        
        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'ruta');
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
