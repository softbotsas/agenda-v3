let data = [];

$(document).ready(function () {
    var datatable;

    // Función para inicializar el datatable con los datos obtenidos
    function inicializarDatatable(datos) {
        console.log(datos);

        if (datatable) {
            datatable.destroy(); // Destruir la instancia existente para reinicializarla
        }

        datatable = $('#kt_datatable_pagos_c').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: datos,
                pageSize: 20,
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
                    field: 'select',
                    title: '<input type="checkbox" id="select-all" />',
                    sortable: false,
                    width: 30,
                    autoHide: false,
                    template: function (row) {
                        return `<input type="checkbox" class="select-row" data-monto="${row.monto}" data-id="${row._id}" />`;
                    },
                },
                {
                    field: 'agencia.NOMBRE',
                    title: 'Código de age',
                    visible: false
                },
                {
                    field: 'usuario._id',
                    title: 'Usuario2',
                    visible: false
                },
                {
                    field: 'forma_pago._id',
                    title: 'Código de age',
                    visible: false
                },
                {
                    field: 'guia.nro_guia_fecha',
                    title: 'Guia / Fecha',
                    autoHide: false,
                    template: function (row) {
                        // Formatear la fecha como YYYY/MM/DD
                        var fecha = new Date(row.fecha);
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
                        var anio = fecha.getFullYear();
                        var fechaFormateada = `${anio}/${mes}/${dia}`;

                        // Combinar nro_guia y fecha en una sola columna
                        return `
                            <div>
                                <strong>${row.guia.nro_guia}</strong><br/>
                                <span>${fechaFormateada}</span>
                            </div>
                        `;
                    }
                },
                {
                    field: 'forma_pago.nombre_forma',
                    title: 'F. Pago',
                    autoHide: false,
                    template: function (row) {
                        return `
                            <div>
                                <strong>${row.forma_pago.tipo_forma_pago.nombre_tipo}</strong><br/>
                                <span>${row.forma_pago.nombre_forma}</span>
                            </div>
                        `;
                    }
                },
                {
                    field: 'fecha',
                    title: 'Fecha',
                    autoHide: false,
                    template: function (row) {
                        // Formatear la fecha como YYYY/MM/DD
                        var fecha = new Date(row.fecha);
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
                        var anio = fecha.getFullYear();
                        var fechaFormateada = `${anio}/${mes}/${dia}`;

                        return `
                            <div>
                                <span>${fechaFormateada}</span>
                            </div>
                        `;
                    }
                },
                {
                    field: 'usuario.name',
                    title: 'Usuario',
                    autoHide: false
                },
                {
                    field: 'monto',
                    title: 'Monto',
                    autoHide: false,
                    template: function (row) {
                        const totalFormateado = `$${Number(parseFloat(row.monto)).toFixed(2)
                            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        return totalFormateado;
                    }
                },
                {
                    field: 'comision.monto',
                    title: 'Comision Pagada',
                    autoHide: false,
                    template: function (row) {
                        if (!row.comision || row.comision.monto == null) {
                            return '0';
                        }
                        const totalFormateado = `$${Number(parseFloat(row.comision.monto)).toFixed(2)
                            .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        return totalFormateado;
                    }
                },
                {
                    field: 'Actions',
                    title: 'Acciones',
                    sortable: false,
                    width: 125,
                    overflow: 'visible',
                    autoHide: false,
                    template: function (row) {
                        return '<a href="/factura_guia/' + row.guia.nro_guia +
                            '" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">' +
                            '<span class="svg-icon svg-icon-md">' +
                            '<i class="icon-2x text-dark-50 flaticon-interface-11"></i>' +
                            '</span></a>';
                    },
                }
            ]
        });
    }

    

    // Evento de búsqueda por fechas, agencia, busqueda y ruta
    $('#informacion_comi').click(function () {
        var desdeDate = $('#kt_datetimepicker_1').val();
        var hastaDate = $('#kt_datetimepicker_1_2').val();

        var desde = "";
        var hasta= "";
        if (desdeDate || hastaDate) {
             desde = new Date(desdeDate).toISOString();
             hasta = new Date(hastaDate + 'T23:59:59.999Z').toISOString();
       
        }
      
        


        var agencia = $('#kt_datatable_search_type2').val();
        
        var busqueda = $('#kt_datatable_search_query').val();
        var usuario = $('#kt_datatable_search_status').val();
        var formaP = $('#kt_datatable_search_type').val();
        console.log()
        var ruta = $('#kt_datatable_search_status5').val();
      
        // Realizar la consulta a tu backend
        $.ajax({
            url: '/bsucar_pagos_porcobrar_conductor', // Verifica que la URL sea correcta
            method: 'GET',
            data: {
                desde: desde,
                hasta: hasta,
                busqueda: busqueda,
                agencia: agencia,
                formaP: formaP, ruta, usuario
            },
            success: function (response) {
                console.log('hola');
                console.log(response.data);
                data = response.data;
                inicializarDatatable(data);
            },
            error: function (error) {
                console.error('Error al obtener datos:', error);
                alert('Hubo un error al consultar los datos.');
            }
        });
    });

    // Manejo de selección de filas
    var selectedIds = [];
    let totalMonto = 0;

    $('#kt_datatable_pagos_c').on('change', '.select-row', function () {
        console.log("Evento change disparado para: ", $(this).data('id'));
        // Tu lógica aquí...
        var id = $(this).data('id');
        var monto = parseFloat($(this).data('monto')) || 0;
    
        if ($(this).is(':checked')) {
            selectedIds.push(id);
            totalMonto += monto;
        } else {
            selectedIds = selectedIds.filter(selectedId => selectedId !== id);
            totalMonto -= monto;
        }
    
        if (selectedIds.length > 0) {
            $('#action-button').prop('disabled', false);
        } else {
            $('#action-button').prop('disabled', true);
            totalMonto = 0;
        }
        calcularSumaMontosNoSeleccionados();
        console.log(totalMonto)
    });

    // Seleccionar o deseleccionar todas las filas
    $('#select-all').on('change', function () {
        var isChecked = $(this).is(':checked');
        $('.select-row').each(function () {
            $(this).prop('checked', isChecked).trigger('change');
        });
        calcularSumaMontosNoSeleccionados();
    });

    // Evento para confirmar y actualizar los pagos seleccionados
    $('#action-button').on('click', function () {
        if (selectedIds.length > 0) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: `Esta acción confirmará los pagos seleccionados. Total Remesa: $${totalMonto.toFixed(2)}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, confirmar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: '/updatepagos',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ selectedIds: selectedIds, monto: totalMonto }),
                        success: function (response) {
                            Swal.fire({
                                title: '¡Éxito!',
                                text: 'Pagos actualizados y confirmados correctamente.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                location.reload();
                            });
                        },
                        error: function (xhr, status, error) {
                            Swal.fire({
                                title: 'Error',
                                text: 'Ocurrió un error al actualizar los pagos. Inténtalo de nuevo.',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    });
                }
            });
        } else {
            Swal.fire({
                title: 'Advertencia',
                text: 'No se ha seleccionado ningún pago.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    });

        

function calcularSumaMontosNoSeleccionados() {
    let sumaMontos = 0; // Inicializar suma

    // Usar setTimeout para retrasar la ejecución por 3 segundos
    setTimeout(() => {
        document.querySelectorAll('.select-row:not(:checked)').forEach(checkbox => {
            // Obtener el monto del data attribute
            const monto = parseFloat(checkbox.getAttribute('data-monto')); // Asegúrate de que sea un número

            // Sumar el monto a la suma total
            sumaMontos += monto;
        });

        // Formatear el total como dinero
        const totalFormateado = `$${sumaMontos.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
        console.log(totalFormateado); // Mostrar el total en consola
        document.getElementById('total-cobrar').innerText = "Total Cobrar: " + totalFormateado; 
        return totalFormateado; // Retornar el total formateado
    }, 2000); // Retrasar por 3000 milisegundos (3 segundos)
}

});
