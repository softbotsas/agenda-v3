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
                    targets: 2,
                },
                
            ],
            
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
