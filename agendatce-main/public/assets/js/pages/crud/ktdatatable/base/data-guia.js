var data = guias;
var usuario_nivel=usuario_nivel

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_guia').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: data,
                pageSize: 20
                
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
                    field: 'agencia',
                    title: 'Código de age',
                    visible: false
                },
                {
                    field: 'agencia._id',
                    title: 'Código de2 age',
                    visible: false
                },
                {
                    field: 'ruta',
                    title: 'Código de Ruta',
                    visible: false
                },
                
                {
                    field: 'nro_guia_fecha',
                    title: 'N° / Fecha',
                    autoHide: false,
                    template: function(row) {
                        // Formatear la fecha como YYYY/MM/DD
                        var fecha = new Date(row.fecha);
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
                        var anio = fecha.getFullYear();
                        var fechaFormateada = `${anio}/${mes}/${dia}`;
                        
                        var fecha2 = new Date(row.fecha_recepcion);
                        var dia2 = String(fecha2.getDate()).padStart(2, '0');
                        var mes2 = String(fecha2.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
                        var anio2 = fecha2.getFullYear();
                        var fechaFormateada2 = `${anio2}/${mes2}/${dia2}`;
                
                        // Combinar nro_guia y fecha en una sola columna
                        return `
                            <div>
                                <strong>${row.nro_guia}</strong><br/>
                                <span>${fechaFormateada}</span>
                                 <span>(${row.tipo_contenido} ${fechaFormateada2})</span>
                            </div>
                        `;
                    }
                },
                
             
                {
                    field: 'nom_cliente_remite',
                    title: 'Cliente',
                    autoHide: false
                }/*,
                {
                    field: 'rutaInfo',
                    title: 'Ruta',
                    autoHide: false,
                    template: function(row) {
                        const rutaMatch = row.rutaInfo.match(/Ruta: (.+)/);
                        return rutaMatch ? rutaMatch[1] : 'Ruta no disponible';
                    }
                }*/,
                {
                    field: 'total_fac',
                        title: 'Monto',
                        autoHide: false, 
                        template: function(row) {
                            const totalFormateado = `$${Number(parseFloat(row.total_fac)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                            return  totalFormateado;
                        }    
                },
                {
                    field: 'AGENCIA_INFO',
                        title: 'Agencia',
                        autoHide: false, 
                        template: function(row) {
                            // Formatear la fecha como YYYY/MM/DD
                           
                            // Combinar nro_guia y fecha en una sola columna
                            return `
                                <div>
                                    <strong>${row.agencia?.NOMBRE}</strong><br/>
                                      <strong>Elaborado por: ${row.usuario?.nombre}</strong><br/>
                                   
                                </div>
                            `;
                        } 

                       
                },
                /*{
                    field: 'pagos',
                    title: '',
                    autoHide: true,
                    template: function(row) {
                        // Calcula la suma de los montos de pagos
                        const totalPagos = row.pagos.reduce((sum, pago) => sum + pago.monto, 0);
                        // Formatea el total como moneda
                        const totalFormateado = `$${Number(totalPagos).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                        return `
                            <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Ver Pagos" data-toggle="collapse" data-target="#details-${row._id}" aria-expanded="false">
                                <i class="la la-angle-down"></i>
                            </a>
                            <span class="ml-2">Total Pagos: ${totalFormateado}</span>
                            <div class="collapse" id="details-${row._id}">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Pago</th>
                                            <th>Cuenta</th>
                                            <th>Monto</th>
                                            <th>Usuario</th>
                                            <th>Agencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${row.pagos.map(pago => `
                                            <tr>
                                                <td>${pago.tipoFormaPago}</td>
                                                <td>${pago.formaPago}</td>
                                               
                                                <td>${pago.monto}</td>
                                                <td>${pago.usuario}</td>
                                                <td>${pago.nombreAgencia}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>`;
                    }
                },*/
                
                /*{
                    field: 'total_fac_totalPagos',
                    title: 'Saldo',
                    autoHide: false,
                    template: function(row) {
                    let monto = row.total_fac;
                    let abono = row.totalPagos
                    const totalFormateado = `$${Number(parseFloat(monto) -  parseFloat(abono)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                    return  totalFormateado;
                    }
                    
                },*/
                
                {
                    field: 'Actions',
                    title: 'Acciones',
                    sortable: false,
                    width: 125,
                    overflow: 'visible',
                    autoHide: false,
                    template: function(row) {
                        // Validar datos y asignar valores predeterminados
                        const ciudad = row.ciudad_remite?.[0]?.name || 'Ciudad desconocida';
                        const estado = row.estado_remite?.[0]?.name || 'Estado desconocido';
                        const pais = row.pais_remite?.[0]?.name || 'País desconocido';
                        const direccion = row.direccion_remite || 'Dirección desconocida';
                        const zip = row.zip_remite || 'Sin ZIP';
                        const lugar = row.lugar_recogida || 'Lugar no definido';
                        const agencia = JSON.stringify(row.agencia).replace(/'/g, "&apos;");
                        const diasRuta = row.rutaInfo || 'Sin información de ruta';
                
                        return `
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; justify-content: space-between;">
                                    <a href="/editar_guia/${row.nro_guia}" class="btn btn-sm btn-clean btn-icon mr-2" title="Editar Guia">
                                        <i class="icon-2x text-dark-50 flaticon-edit"></i>
                                    </a>
                                    ${(usuario_nivel === 1 || usuario_nivel === 2) ? `
                                        <button type="button" class="btn btn-sm btn-clean btn-icon btn-anular" 
                                            data-id="${row._id}" 
                                            title="Anular Guía">
                                            <i class="icon-2x text-dark-50 flaticon2-rubbish-bin"></i>
                                        </button>` : ''}
                                    <a href="/factura_guia/${row.nro_guia}" target="_blank" class="btn btn-sm btn-clean btn-icon" title="Ver Guía">
                                        <i class="icon-2x text-dark-50 flaticon-interface-11"></i>

                                    </a>
                                    <a 

                                        class="btn btn-sm btn-clean btn-icon" 
                                        title="Cambiar Fecha de Recogida" 
                                        data-toggle="modal8" 
                                        data-target="#selectDateModal" 
                                        data-id="${row._id}" 
                                        data-direccion="${direccion}" 
                                        data-ciudad="${ciudad}" 
                                        data-estado="${estado}" 
                                        data-pais="${pais}" 
                                        data-zip="${zip}" 
                                        data-dias_ruta="${diasRuta}" 
                                        data-lugar="${lugar}" 
                                        data-agencia='${agencia}'>
                                        <span class="svg-icon svg-icon-md">
                                            <i class="icon-2x text-dark-50 flaticon-event-calendar-symbol"></i>
                                        </span>
                                    </a>
                                </div>
                            </div>
                        `;
                    }
                }/*,
                
                
                {
                    field: 'Usuario',
                        title: 'Elaborado por:',
                        autoHide: true, 
                        template: function(row) {
                          
                        
                            return  row.usuario.nombre;
                        }    

                       
                }*/
                // Add more columns if needed
            ],
        });

        $('#origenes-select').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'agencia._id');
            console.log($(this).val());
        });
        
        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'ruta');
        });
        
                // Evento para detectar cambios en los datetimepicker
        $('#kt_datetimepicker_1, #kt_datetimepicker_1_2').on('change.datetimepicker', function() {
            // Obtener las fechas seleccionadas
            var desdeDate = $('#kt_datetimepicker_1').val();
            var hastaDate = $('#kt_datetimepicker_1_2').val();

            // Convertir las fechas seleccionadas al formato UTC (ISO)
            var fechaDesdeUTC = desdeDate ? new Date(desdeDate).toISOString() : null;
            var fechaHastaUTC = hastaDate ? new Date(hastaDate + 'T23:59:59.999Z').toISOString() : null;

            console.log('Fecha Desde:', fechaDesdeUTC);
            console.log('Fecha Hasta:', fechaHastaUTC);

            // Filtrar los datos según las fechas seleccionadas
            var filteredData = data.filter(function(row) {
                var fechaRow = new Date(row.fecha).toISOString(); // Formato de la fecha en el dataset

                // Verificar si la fecha del row está dentro del rango seleccionado
                return (!fechaDesdeUTC || fechaRow >= fechaDesdeUTC) &&
                    (!fechaHastaUTC || fechaRow <= fechaHastaUTC);
            });

            console.log('Datos Filtrados:', filteredData);

            // Actualizar los datos del datatable
            datatable.originalDataSet = filteredData;
            datatable.reload();
        });

        $(document).ready(function () {
            // Seleccionar todos los botones de anulación
            $('.btn-anular').on('click', function () {
                const guiaId = $(this).data('id');
        
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Esta acción anulará la guía. No se puede revertir.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, anular',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Hacer la petición AJAX al backend
                        $.ajax({
                            url: `/guia/delete/${guiaId}`,
                            method: 'PUT', // Cambia al método requerido
                            contentType: 'application/json',
                            success: function (data) {
                                if (data.success) {
                                    Swal.fire(
                                        '¡Anulada!',
                                        'La guía ha sido anulada correctamente.',
                                        'success'
                                    ).then(() => location.reload()); // Recargar la página si es necesario
                                } else {
                                    Swal.fire(
                                        'Error',
                                        data.message || 'No se pudo anular la guía.',
                                        'error'
                                    );
                                }
                            },
                            error: function () {
                                Swal.fire(
                                    'Error',
                                    'Hubo un problema con la petición.',
                                    'error'
                                );
                            }
                        });
                    }
                });
            });
        });
        
        
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
