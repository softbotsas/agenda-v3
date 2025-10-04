"use strict";

var KTDatatablesBasicHeaders = function() {

    var initTable1 = function() {
        var table = $('#kt_datatable');

        // begin first table
        table.DataTable({
            responsive: true,
            data: formasPago,
            columnDefs: [
                {
                    targets: -1, // Última columna para acciones
                    title: 'Actions',
                    orderable: false,
                    render: function(data, type, row, meta) {
                        return '\
                            <a href="/forma_pago/edit/${row._id}" class="btn btn-sm btn-clean btn-icon" title="Edit details">\
                                <i class="la la-edit"></i>\
                            </a>\
                            <form action="/forma_pago/delete/${row._id}?_method=DELETE" method="POST" style="display:inline;">\
                                <button type="submit" class="btn btn-sm btn-clean btn-icon" title="Delete">\
                                    <i class="la la-trash"></i>\
                                </button>\
                            </form>\
                        ';
                    },
                },
              
            ],
            // Define the columns to display
            columns: [
                      
                { data: 'nombre_forma' }, 
                { data: 'tipo_forma_pago' },  
                { data: null },           // Columna para las acciones (se llena con render)
            ],
            order: [[1, 'asc']], // Ordenar por el nombre del tipo de pago
        });
    };

    return {
        // Main function to initiate the module
        init: function() {
            initTable1();
        },
    };

}();

jQuery(document).ready(function() {
    KTDatatablesBasicHeaders.init();
});
