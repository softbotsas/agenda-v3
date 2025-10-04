var data = typeof agencias !== 'undefined' ? agencias : [];
var filteredData = data;

var KTDatatableRemoteAjaxDemo = function() {
    var datatable;
   
    var demo = function() {
        datatable = $('#kt_datatable_agencias').KTDatatable({
            data: {
                type: 'local',
                source: data,
                pageSize: 50,
            },
            layout: {
                scroll: true,
                footer: false,
            },
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
                    field: 'DIRECCION',
                    title: 'DIRECCION',
                },
                {
                    field: 'CIUDAD',
                    title: 'Ciudad',
                },
                {
                    field: 'ESTADO_DEPARTAMENTO',
                    title: 'Estado'
                }, 
                {
                    field:'CELULAR',
                    title: 'Telefonos',
                    template: function(row) {
                        const celular = row.CELULAR || '';
                        const telefono2 = row.TELEFONO_2 || '';
                        if (celular && telefono2) {
                            return `${celular} - ${telefono2}`;
                        }
                        return celular || telefono2;
                    }
                },   
                {
                    field: 'ZIP',
                    title: 'Zip',
                },
                {
                    field: 'rutas',
                    title: 'Rutas',
                    autoHide: false,
                    template: function(row) {
                        if (!Array.isArray(row.rutas) || row.rutas.length === 0) {
                            return '';
                        }
                        const rutasHtml = row.rutas.map((ruta, index) => {
                            const nombreRuta = typeof ruta === 'object' ? (ruta.Rutas || ruta._id || 'Ruta') : ruta;
                            return `<div>${index + 1}. ${nombreRuta}</div>`;
                        }).join('');
                        return `<div>${rutasHtml}</div>`;
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
                            <a href="/agencia/edit/' + row._id + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Edit details">\
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
                            <a href="/relacion_agencias_ruta/' + row._id + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Relacion Rutas">\
                                <span class="svg-icon svg-icon-md">\
                                    <i class="icon-xl la la-exchange-alt"></i>\
                                </span>\
                            </a>\
                            <a href="http://sistematce.com/qr_agencia/' + row._id + '/' + encodeURIComponent(row.NOMBRE) + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver QR">\
                                <span class="svg-icon svg-icon-md">\
                                    <i class="icon-xl la la-qrcode"></i>\
                                </span>\
                            </a>\
                        ';
                    },
                }
            ],
        });

        function updateTable(filterText) {
            if (!filterText) {
                filteredData = data;
            } else {
                const lowerCaseFilter = filterText.toLowerCase();
                filteredData = data.filter(agency => {
                    const agencyName = agency.NOMBRE ? agency.NOMBRE.toLowerCase() : '';
                    const city = agency.CIUDAD ? agency.CIUDAD.toLowerCase() : '';
                    const routes = (Array.isArray(agency.rutas) && agency.rutas.length > 0) 
                        ? agency.rutas.map(r => r.Rutas.toLowerCase()).join(', ') 
                        : '';
                    const direccion = agency.DIRECCION ? agency.DIRECCION.toLowerCase() : '';
                    const telefonos = `${agency.CELULAR || ''} ${agency.TELEFONO_2 || ''}`.trim().toLowerCase();
                    
                    return agencyName.includes(lowerCaseFilter) || 
                           city.includes(lowerCaseFilter) || 
                           routes.includes(lowerCaseFilter) ||
                           direccion.includes(lowerCaseFilter) ||
                           telefonos.includes(lowerCaseFilter);
                });
            }
            datatable.reload({
                data: filteredData
            });
        }

        $('#kt_datatable_search_type').on('change', function() {
            var selectedRutaText = $(this).find('option:selected').text().trim();
            
            if (selectedRutaText === 'Todas') {
                $('#kt_datatable_search_query').val('');
                updateTable('');
            } else {
                $('#kt_datatable_search_query').val(selectedRutaText);
                updateTable(selectedRutaText);
            }
        });

        $('#kt_datatable_search_query').on('keyup', function() {
            updateTable($(this).val().trim());
        });
    
        $('#export_print').on('click', function(e) {
            e.preventDefault();
            exportTable('print');
        });

        $('#export_excel').on('click', function(e) {
            e.preventDefault();
            exportTable('excel');
        });

        $('#export_pdf').on('click', function(e) {
            e.preventDefault();
            exportTable('pdf');
        });

        $('#export_csv').on('click', function(e) {
            e.preventDefault();
            exportTable('csv');
        });
        
        function exportTable(type) {
            const exportData = filteredData.map(item => {
                const rutasString = (Array.isArray(item.rutas) && item.rutas.length > 0) 
                    ? item.rutas.map(r => r.Rutas).join(', ') 
                    : '';
                const telefonosString = `${item.CELULAR || ''}${item.TELEFONO_2 ? ' - ' + item.TELEFONO_2 : ''}`;
                return {
                    'NOMBRE_AGENCIA': item.NOMBRE || '',
                    'DIRECCION': item.DIRECCION || '',
                    'CIUDAD': item.CIUDAD || '',
                    'ESTADO': item.ESTADO_DEPARTAMENTO || '',
                    'ZIP': item.ZIP || '',
                    'TELEFONOS': telefonosString,
                    'RUTAS': rutasString
                };
            });

            const headers = ['Nombre Agencia', 'Direccion', 'Ciudad', 'Estado', 'Zip', 'Telefonos', 'Rutas'];

            if (type === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Agencias");
                XLSX.writeFile(wb, `Agencias.xlsx`);
            } else if (type === 'csv') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Agencias");
                XLSX.writeFile(wb, `Agencias.csv`);
            } else if (type === 'pdf') {
                const doc = new window.jspdf.jsPDF('l', 'mm', 'a4'); 
                doc.autoTable({
                    head: [headers],
                    body: exportData.map(Object.values),
                    startY: 10,
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                    },
                    headStyles: {
                        fillColor: [100, 100, 100],
                        textColor: 255
                    },
                    margin: { top: 10, right: 10, bottom: 10, left: 10 }
                });
                doc.save('Agencias.pdf');
            } else if (type === 'print') {
                let printWindow = window.open('', '_blank');
                let html = '<html><head><title>Lista de Agencias</title>';
                html += '<style>';
                html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
                html += 'table { width: 100%; border-collapse: collapse; }';
                html += 'th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }';
                html += 'th { background-color: #f2f2f2; }';
                html += '</style>';
                html += '</head><body>';
                html += '<h1>Lista de Agencias</h1>';
                html += '<table><thead><tr>';
                headers.forEach(header => {
                    html += `<th>${header}</th>`;
                });
                html += '</tr></thead><tbody>';
                exportData.forEach(row => {
                    html += '<tr>';
                    Object.values(row).forEach(cell => {
                        html += `<td>${cell}</td>`;
                    });
                    html += '</tr>';
                });
                html += '</tbody></table></body></html>';
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    return {
        init: function() {
            demo();
        },
    };
}();

jQuery(document).ready(function() {
    KTDatatableRemoteAjaxDemo.init();
});