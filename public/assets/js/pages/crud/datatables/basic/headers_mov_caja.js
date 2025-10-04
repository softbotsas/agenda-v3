"use strict";
var KTDatatablesBasicHeaders = function() {

    var initTable1 = function() {
        var table = $('#kt_datatable');

        // begin first table
        table.DataTable({
            responsive: true,
            columnDefs: [
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    render: function(data, type, full, meta) {
                        return '\
                            <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Edit details">\
                                <i class="la la-edit"></i>\
                            </a>\
                            <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Delete">\
                                <i class="la la-trash"></i>\
                            </a>\
                        ';
                    },
                },
                {
                    width: '275px',
                    targets: 5,
                },
                {
                    width: '75px',
                    targets: 6,
                    render: function(data, type, full, meta) {
                        var amount = parseFloat(data);
                        var labelClass = amount <= 0 ? 'label-light-danger' : 'label-light-primary';
                        return '<span class="label label-lg font-weight-bold ' + labelClass + ' label-inline"><b>' + amount.toFixed(2) + '</b></span>';
                    },
                },
            ],
            footerCallback: function(row, data, start, end, display) {
                var api = this.api();

                // Remove the formatting to get integer data for summation
                var intVal = function(i) {
                    return typeof i === 'string' ?
                        i.replace(/[\$,]/g, '') * 1 :
                        typeof i === 'number' ?
                        i : 0;
                };

                // Total over this page
                var pageTotal = api
                    .column(6, { page: 'current' })
                    .data()
                    .reduce(function(a, b) {
                        return intVal(a) + intVal(b);
                    }, 0);

                // Total positive over this page
                var pageTotalPositivo = api
                    .column(6, { page: 'current' })
                    .data()
                    .reduce(function(a, b) {
                        return a + (intVal(b) > 0 ? intVal(b) : 0);
                    }, 0);

                // Total negative over this page
                var pageTotalNegativo = api
                    .column(6, { page: 'current' })
                    .data()
                    .reduce(function(a, b) {
                        return a + (intVal(b) < 0 ? intVal(b) : 0);
                    }, 0);

                // Update footer

				$(api.column(2).footer()).html(
                    
                   pageTotalPositivo.toFixed(2) 
                );
				$(api.column(4).footer()).html(
  
                  pageTotalNegativo.toFixed(2)
                );
				
                $(api.column(6).footer()).html(
                  pageTotal.toFixed(2) 
                );
            },
        });
    };

    return {
        //main function to initiate the module
        init: function() {
            initTable1();
        },
    };

}();

jQuery(document).ready(function() {
    KTDatatablesBasicHeaders.init();
});
