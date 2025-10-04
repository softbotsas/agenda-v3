var data = preguias;

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_preguia').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: data,
                pageSize: 50,
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
                    field: 'agencia._id',
                    title: 'Código de Ruta',
                    visible : false
                
                },
                
                {
                    field: 'codigoRuta',
                    title: 'Código de Ruta',
                    visible: false
                },
                {
                    field: 'fecha_creacion',
                        title: 'Fecha',
                        autoHide: false,
                        template: function(row) {
                            // Verificar si la fecha existe y está en formato ISO 8601
                            if (row.fecha_creacion) {
                                // Convertir la fecha ISO 8601 a un objeto Date
                                var date = new Date(row.fecha_creacion);
                                // Formatear la fecha a MM/DD/YYYY
                                var formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                                return formattedDate;
                            } else {
                                // Retornar un valor por defecto si la fecha no está disponible
                                return 'Fecha no disponible';
                            }
                        }
                    },
                {
                    field: 'agencias',
                    title: 'Agencia',
                    autoHide: false,
                    template: function(row) {
                        return row.agencia && row.agencia.NOMBRE ? row.agencia.NOMBRE : 'Agencia no disponible';
                    }
                },
                {
                    field: 'nom_cliente',
                    title: 'Cliente',
                    autoHide: false
                },
                {
                    field: 'celular',
                    title: 'Celular',
                    autoHide: false
                }
                
                
               

                // Add more columns if needed
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val(), 'agencia._id');
            console.log($(this).val())
        });

        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'codigoRuta');
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
