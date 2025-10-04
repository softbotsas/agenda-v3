"use strict";
// Class definition

var KTDatatableRecordSelectionDemo = function() {
    // Private functions

    var formSource = [
        {
            item: 1,
            id:'32',
            nombre: "WIL-SOUTH - LUNES",
            
            codigo: "29576, 29519, 29511, 29526, 29527, 29528, 29536, 29543, 29544, 29545, 29546, 29547, 29563, 29565, 29566, 29568, 29569, 29571, 29572, 29574, 29575, 29577, 29578, 29579, 29581, 29582, 29587, 29588, 29589, 29592, 29597, 29598, 28420, 28463, 28468, 28467, 28452, 28470, 28462, 28430, 28439, 28432, 28319, 28340, 28362, 28369, 28375, 28424, 28431, 28438, 28442, 28450, 28472, 28422, 28423, 28461, 28462, 28465, 29532",
            
        },
        {
            item: 2,
            id:'33',
            nombre: "WS-WEST-MIERCOLES",
            
            codigo: "28697, 28623, 28678, 28651, 28652, 28653, 28654, 28655, 28657, 28658, 28659, 28661, 28662, 28663, 28664, 28665, 28666, 28667, 28672, 28675, 28679, 28680, 28681, 28684, 28690, 28691, 28692, 28693, 28694, 28698, 28705, 28737, 28749, 28752, 28755, 28761, 28765, 28777, 28601, 28602, 28603, 28604, 28605, 28606, 28607, 28608, 28609, 28610, 28611, 28612, 28613, 28615, 28616, 28617, 28618, 28619, 28622, 28624, 28626, 28627, 28628, 28629, 28630, 28631, 28633, 28635, 28636, 28637, 28638, 28640, 28641, 28643, 28644, 28645, 28646, 28647, 28649, 28627, 28668, 28676, 28683,",
            
        },
        {
            item: 2,
            id:'850',
            nombre: "MAC - LOCAL SAB - JUEV",
            
            codigo: "31005, 31008, 31061, 31029, 31031, 31032, 31046, 31047, 31052, 31201, 31202, 31203, 31204, 31205, 31206, 31207, 31208, 31209, 31210, 31211, 31212, 31213, 31216, 31217, 31220, 31221, 31294, 31295, 31296, 31297, 31298, 31299, 31069, 31076, 31028, 31088, 31093, 31095, 31098, 31099,",
            
        }
        ,
        {
            item: 2,
            id:'34',
            nombre: "SC - EAST LUNES",
            
            codigo: "29370, 29666, 29653, 29325, 29351, 29332, 29819, 29178, 29822, 29037, 29850, 29861, 29848, 29839, 29840, 29844, 29802, 29804, 29808, 29808, 29646, 29647, 29648, 29649, 30901, 30903, 30905, 30906, 30907, 30909, 30912, 30914, 30916, 30917, 30919, 30999, 29620, 29360, 29628,",
            
        }
    ];

    var options = {
        // datasource definition
        data: {
          
            type: 'local',
            source: formSource
           
        },

        // layout definition
        layout: {
            scroll: false, // enable/disable datatable scroll both horizontal and
            footer: false // display/hide footer
        },

        // column sorting
        sortable: true,

        

        // columns definition
        columns: [
            {
                field: 'item',
                title: '#',
                width:30
                
            },
            
             {
            field: 'id',
            title: 'id',
                width:25
            },
             {
            field: 'nombre',
            title: 'Nombre',
                width:150
        }, {
            field: 'codigo',
            title: 'Codigo',
            width:350
        }, {
            field: 'Actions',
            title: 'Actions',
            sortable: false,
            width: 75,
            overflow: 'visible',
            textAlign: 'left',
	        autoHide: false,
            template: function() {
                return '\
                    <div class="dropdown dropdown-inline">\
                        <a href="javascript:;" class="btn btn-sm btn-clean btn-icon mr-2" data-toggle="dropdown">\
                            <span class="svg-icon svg-icon-md">\
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">\
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                                        <rect x="0" y="0" width="24" height="24"/>\
                                        <path d="M5,8.6862915 L5,5 L8.6862915,5 L11.5857864,2.10050506 L14.4852814,5 L19,5 L19,9.51471863 L21.4852814,12 L19,14.4852814 L19,19 L14.4852814,19 L11.5857864,21.8994949 L8.6862915,19 L5,19 L5,15.3137085 L1.6862915,12 L5,8.6862915 Z M12,15 C13.6568542,15 15,13.6568542 15,12 C15,10.3431458 13.6568542,9 12,9 C10.3431458,9 9,10.3431458 9,12 C9,13.6568542 10.3431458,15 12,15 Z" fill="#000000"/>\
                                    </g>\
                                </svg>\
                            </span>\
                        </a>\
                        <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">\
                            <ul class="navi flex-column navi-hover py-2">\
                                <li class="navi-header font-weight-bolder text-uppercase font-size-xs text-primary pb-2">\
                                    Choose an action:\
                                </li>\
                                <li class="navi-item">\
                                    <a href="#" class="navi-link">\
                                        <span class="navi-icon"><i class="la la-print"></i></span>\
                                        <span class="navi-text">Print</span>\
                                    </a>\
                                </li>\
                                <li class="navi-item">\
                                    <a href="#" class="navi-link">\
                                        <span class="navi-icon"><i class="la la-copy"></i></span>\
                                        <span class="navi-text">Copy</span>\
                                    </a>\
                                </li>\
                                <li class="navi-item">\
                                    <a href="#" class="navi-link">\
                                        <span class="navi-icon"><i class="la la-file-excel-o"></i></span>\
                                        <span class="navi-text">Excel</span>\
                                    </a>\
                                </li>\
                                <li class="navi-item">\
                                    <a href="#" class="navi-link">\
                                        <span class="navi-icon"><i class="la la-file-text-o"></i></span>\
                                        <span class="navi-text">CSV</span>\
                                    </a>\
                                </li>\
                                <li class="navi-item">\
                                    <a href="#" class="navi-link">\
                                        <span class="navi-icon"><i class="la la-file-pdf-o"></i></span>\
                                        <span class="navi-text">PDF</span>\
                                    </a>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>\
                    <a href="javascript:;" class="btn btn-sm btn-clean btn-icon mr-2" title="Edit details">\
                        <span class="svg-icon svg-icon-md">\
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">\
                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                                    <rect x="0" y="0" width="24" height="24"/>\
                                    <path d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z" fill="#000000" fill-rule="nonzero"\ transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "/>\
                                    <rect fill="#000000" opacity="0.3" x="5" y="20" width="15" height="2" rx="1"/>\
                                </g>\
                            </svg>\
                        </span>\
                    </a>\
                    <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Delete">\
                        <span class="svg-icon svg-icon-md">\
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">\
                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                                    <rect x="0" y="0" width="24" height="24"/>\
                                    <path d="M6,8 L6,20.5 C6,21.3284271 6.67157288,22 7.5,22 L16.5,22 C17.3284271,22 18,21.3284271 18,20.5 L18,8 L6,8 Z" fill="#000000" fill-rule="nonzero"/>\
                                    <path d="M14,4.5 L14,4 C14,3.44771525 13.5522847,3 13,3 L11,3 C10.4477153,3 10,3.44771525 10,4 L10,4.5 L5.5,4.5 C5.22385763,4.5 5,4.72385763 5,5 L5,5.5 C5,5.77614237 5.22385763,6 5.5,6 L18.5,6 C18.7761424,6 19,5.77614237 19,5.5 L19,5 C19,4.72385763 18.7761424,4.5 18.5,4.5 L14,4.5 Z" fill="#000000" opacity="0.3"/>\
                                </g>\
                            </svg>\
                        </span>\
                    </a>\
                ';
            },
        }],
    };

    // basic demo
    var localSelectorDemo = function() {
        // enable extension
        options.extensions = {
            // boolean or object (extension options)
            checkbox: true,
        };

        options.search = {
            input: $('#kt_datatable_search_query'),
            key: 'generalSearch'
        };

        var datatable = $('#kt_datatable').KTDatatable(options);

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Status');
        });

        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Type');
        });

        $('#kt_datatable_search_status, #kt_datatable_search_type').selectpicker();

        datatable.on(
            'datatable-on-check datatable-on-uncheck',
            function(e) {
                var checkedNodes = datatable.rows('.datatable-row-active').nodes();
                var count = checkedNodes.length;
                $('#kt_datatable_selected_records').html(count);
                if (count > 0) {
                    $('#kt_datatable_group_action_form').collapse('show');
                } else {
                    $('#kt_datatable_group_action_form').collapse('hide');
                }
            });

        $('#kt_datatable_fetch_modal').on('show.bs.modal', function(e) {
            var ids = datatable.rows('.datatable-row-active').
            nodes().
            find('.checkbox > [type="checkbox"]').
            map(function(i, chk) {
                return $(chk).val();
            });
            console.log(ids);
            var c = document.createDocumentFragment();
            for (var i = 0; i < ids.length; i++) {
                var li = document.createElement('li');
                li.setAttribute('data-id', ids[i]);
                li.innerHTML = 'Selected record ID: ' + ids[i];
                c.appendChild(li);
            }
            $('#kt_datatable_fetch_display').append(c);
        }).on('hide.bs.modal', function(e) {
            $('#kt_datatable_fetch_display').empty();
        });
    };

    var serverSelectorDemo = function() {
        // enable extension
        options.extensions = {
            // boolean or object (extension options)
            checkbox: true,
        };
        options.search = {
            input: $('#kt_datatable_search_query_2'),
            key: 'generalSearch'
        };

        var datatable = $('#kt_datatable_2').KTDatatable(options);

        $('#kt_datatable_search_status_2').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Status');
        });

        $('#kt_datatable_search_type_2').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'Type');
        });

        $('#kt_datatable_search_status_2, #kt_datatable_search_type_2').selectpicker();

        datatable.on(
            'datatable-on-click-checkbox',
            function(e) {
                // datatable.checkbox() access to extension methods
                var ids = datatable.checkbox().getSelectedId();
                var count = ids.length;

                $('#kt_datatable_selected_records_2').html(count);

                if (count > 0) {
                    $('#kt_datatable_group_action_form_2').collapse('show');
                } else {
                    $('#kt_datatable_group_action_form_2').collapse('hide');
                }
            });

        $('#kt_datatable_fetch_modal_2').on('show.bs.modal', function(e) {
            var ids = datatable.checkbox().getSelectedId();
            var c = document.createDocumentFragment();
            for (var i = 0; i < ids.length; i++) {
                var li = document.createElement('li');
                li.setAttribute('data-id', ids[i]);
                li.innerHTML = 'Selected record ID: ' + ids[i];
                c.appendChild(li);
            }
            $('#kt_datatable_fetch_display_2').append(c);
        }).on('hide.bs.modal', function(e) {
            $('#kt_datatable_fetch_display_2').empty();
        });
    };

    return {
        // public functions
        init: function() {
            localSelectorDemo();
            serverSelectorDemo();
        },
    };
}();
jQuery(document).ready(function() {
    KTDatatableRecordSelectionDemo.init();
});
