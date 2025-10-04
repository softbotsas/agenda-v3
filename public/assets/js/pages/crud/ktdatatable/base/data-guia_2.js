var data = guias;

function devolverTransitoLocal(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta guía será devuelta.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, devolver',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/devolver_transito_local/${id}`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            'Devuelta',
                            'La guía ha sido devuelta correctamente.',
                            'success'
                        ).then(() => {
                            // Recargar la página después de cerrar la alerta
                            location.reload();
                        });
                    } else {
                        Swal.fire(
                            'Error',
                            data.message || 'No se pudo devolver la guía.',
                            'error'
                        );
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire(
                        'Error',
                        'Ocurrió un error al conectar con el servidor.',
                        'error'
                    );
                });
        }
    });
}

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_guia_2').KTDatatable({
            // datasource definition
            data: {
                type: 'local',
                source: data,
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
                
                        // Combinar nro_guia y fecha en una sola columna
                        return `
                            <div>
                                <strong>${row.nro_guia}</strong><br/>
                                <span>${fechaFormateada}</span>
                            </div>
                        `;
                    }
                },
                
             
                {
                    field: 'nom_cliente_remite',
                    title: 'Cliente',
                    autoHide: false
                },
                {
                    field: 'rutaInfo',
                    title: 'Ruta',
                    autoHide: false,
                    template: function(row) {
                        const rutaMatch = row.rutaInfo.match(/Ruta: (.+)/);
                        return rutaMatch ? rutaMatch[1] : 'Ruta no disponible';
                    }
                },
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
                    field: 'totalPagos',
                        title: 'Abonos',
                        autoHide: false, 
                        template: function(row) {
                            const totalFormateado = `$${Number(parseFloat(row.totalPagos)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                            return  totalFormateado;
                        }    

                       
                },
                {
                    field: 'pagos',
                    title: 'Pagos',
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
                },
                
                {
                    field: 'total_fac_totalPagos',
                    title: 'Saldo',
                    autoHide: false,
                    template: function(row) {
                    let monto = row.total_fac;
                    let abono = row.totalPagos
                    const totalFormateado = `$${Number(parseFloat(monto) -  parseFloat(abono)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                    return  totalFormateado;
                    }
                    
                }
                
                ,
                {
          field: 'Actions',
          title: 'Acciones',
          sortable: false,
          width: 125,
          overflow: 'visible',
          autoHide: false,
          template: function(row) {
            return `
                <a href="/factura_guia/${row.nro_guia}" target="_blank" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">
                    <span class="svg-icon svg-icon-md">
                        <i class="icon-2x text-dark-50 flaticon-interface-11"></i>
                    </span>
                </a>
                <button onclick="devolverTransitoLocal('${row._id}')" class="btn btn-sm btn-clean btn-icon mr-2" title="Devolver Paquete">
                    <span class="svg-icon svg-icon-md">
                        <i class="icon-2x text-dark-50 flaticon2-reply-1"></i>
                    </span>
                </button>
            `;
            },
        
        
        },
        {
            field: 'Usuario',
                title: 'Elaborado por:',
                autoHide: true, 
                template: function(row) {
                  
                
                    return  row.usuario.nombre;
                }    

               
        },
        {
            field: 'Usuario2',
                title: 'Conductor Local:',
                autoHide: true, 
                template: function(row) {
                  
                
                    return  row.chequeo_transito;
                    
                }    

               
        }
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
