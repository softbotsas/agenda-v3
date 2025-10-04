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
					targets: 9,
				},	

				{
					width: '75px',
					targets: 8,
					render: function(data, type, full, meta) {
						var status = {
							1: {'title': data, 'class': ' label-light-danger'},
							
						};
						if (typeof status[1] === 'undefined' || typeof status[1] === 0) {
							return data;
						}
						return '<span class="label label-lg font-weight-bold' + status[1].class + ' label-inline">' + status[1].title + '</span>';
					},
				},
				{
					width: '75px',
					targets: 9,
					render: function(data, type, full, meta) {
						var status = {
							1: {'title': '$268.00', 'state': 'danger'}
							
						};
						if (typeof status[data] === 'undefined') {
							return data;
						}
						return '<span class="label label-' + status[data].state + ' label-dot mr-2"></span>' +
							'<span class="font-weight-bold text-' + status[data].state + '">' + status[data].title + '</span>';
					},
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
