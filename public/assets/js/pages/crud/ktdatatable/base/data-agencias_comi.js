var data = typeof agencias !== 'undefined' ? agencias : [];

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_agencias_comi').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: data,
                pageSize: 50,
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
                    field: 'NOMBRE',
                    title: 'Nombre',
                },
             
                {
                    field: 'CIUDAD',
                    title: 'Ciudad',
                },
                {
                    field: 'ZIP',
                    title: 'Zip',
                }
                ,{
          field: 'Actions',
          title: 'Comisiones',
          sortable: false,
          width: 125,
          overflow: 'visible',
          autoHide: false,
          template: function(row) {
            return `
                <a href="/agencia_comi/${row._id}" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver QR">
                    <span class="svg-icon svg-icon-md">
                        <i class="icon-xl la la-comment-dollar"></i>
                    </span>
                </a>
            `;
        },
        }
                // Add more columns if needed
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Status');
        });

        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Type');
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
