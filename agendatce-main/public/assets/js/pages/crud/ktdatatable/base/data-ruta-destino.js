var data = rutasDestino;

var KTDatatableRutaDestino = function() {
    var demo = function() {
        var datatable = $('#kt_datatable_rutas_destino').KTDatatable({
            data: {
                type: 'local',
                source: data,
                pageSize: 10,
            },
            layout: { scroll: false, footer: false },
            sortable: true,
            pagination: true,
            search: {
                input: $('#kt_datatable_search_query'),
                key: 'generalSearch'
            },
            columns: [
                {
                    field: 'numero',
                    title: 'Numero',
                    width: 70
                },
                {
                    field: 'Destino',
                    title: 'Destino',
                    width: 120
                },
                {
                    field: 'CodigosPostales',
                    title: 'Zip',
                    width: 350,
                    template: function(row) {
                        return Array.isArray(row.CodigosPostales) 
                            ? row.CodigosPostales.join(', ') 
                            : row.CodigosPostales;
                    }
                },
                {
                    field: 'dias',
                    title: 'Días',
                    width: 120,
                    template: function(row) {
                        return Array.isArray(row.dias) 
                            ? row.dias.join(', ') 
                            : row.dias;
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
                        return '\
							<a href="/ruta_destino/edit/' + row._id + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Editar">\
	                            <span class="svg-icon svg-icon-md"><i class="la la-edit"></i></span>\
							</a>\
                            <form method="POST" action="/ruta_destino/delete/' + row._id + '" style="display:inline;">\
                                <button type="submit" class="btn btn-sm btn-clean btn-icon" title="Eliminar" onclick="return confirm(\'¿Seguro que quieres eliminar?\')">\
                                    <span class="svg-icon svg-icon-md"><i class="la la-trash"></i></span>\
                                </button>\
                            </form>';
                    },
                }
            ]
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Status');
        });
    };
    return {
        init: function() {
            demo();
        },
    };
}();

jQuery(document).ready(function() {
    KTDatatableRutaDestino.init();
});
