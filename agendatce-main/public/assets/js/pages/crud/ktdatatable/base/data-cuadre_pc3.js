var data = cuadres_pc;

var KTDatatableRemoteAjaxDemo = function() {
   
    var demo = function() {
        var datatable = $('#kt_datatable_cuadre2').KTDatatable({
            
            data: {
                type: 'local',
                source: data,
                pageSize: 20,
            },

            // layout definition
            layout: {
                scroll: false,
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
                    field: 'la_ruta',       // Este es el field que se usará en la búsqueda
                    title: 'la_ruta',
                    visible: true,
                    template: function(row) {
                        return row.ruta && row.ruta._id ? row.ruta._id : '';
                    }
                },
                {
                    field: 'fecha',
                        title: 'Fecha',
                        autoHide: false,
                        template: function(row) {
                            // Verificar si la fecha existe y está en formato ISO 8601
                            if (row.fecha) {
                                // Convertir la fecha ISO 8601 a un objeto Date
                                var date = new Date(row.fecha);
                                // Formatear la fecha a MM/DD/YYYY
                                var formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                                return formattedDate;
                           
                            }
                        }
                    },
                {
                    field: 'ruta',
                    title: 'Ruta',
                    autoHide: false,
                    template: function(row) {
                        return row.ruta && row.ruta.Rutas ? row.ruta.Rutas : 'Ruta no disponible';
                    }
                },
                {
                    field: 'usuario.name',
                    title: 'Usuario',
                    autoHide: false,
                    template: function(row) {
                        return row.usuario && row.usuario.name ? row.usuario.name : 'Agencia no disponible';
                    }
                },
                {
                    field: 'totalIngresos',
                    title: 'Total Ingresos',
                    autoHide: false,
                    template: function(row) {
                        if (!row.ingresos || row.ingresos.length === 0) return '$0.00';
                        // Sumar montos
                        var suma = row.ingresos.reduce(function(acc, item) {
                            return acc + (item.monto || 0);
                        }, 0);
                        return '$' + suma.toFixed(2);
                    }
                },

                // 6) Nueva columna: Total Egresos
                {
                    field: 'totalEgresos',
                    title: 'Total Egresos',
                    autoHide: false,
                    template: function(row) {
                        if (!row.egresos || row.egresos.length === 0) return '$0.00';
                        var suma = row.egresos.reduce(function(acc, item) {
                            return acc + (item.monto || 0);
                        }, 0);
                        return '$' + suma.toFixed(2);
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
                        <a href="javascript:void(0)" 
                           onclick="buscar_cuadres('${row._id}')" 
                           class="btn btn-sm btn-clean btn-icon mr-2" 
                           title="Ver Guia">
                          <span class="svg-icon svg-icon-md">
                            <i class="icon-2x text-dark-50 flaticon-interface-11"></i>
                          </span>
                        </a>
                      `;
                    },
                  }
                
               

                // Add more columns if needed
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'codigoAgencia');
            console.log($(this).val())
        });

        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'la_ruta');
            console.log($(this).val())
        });

        $('#kt_datatable_search_status, #kt_datatable_search_type').selectpicker();
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
