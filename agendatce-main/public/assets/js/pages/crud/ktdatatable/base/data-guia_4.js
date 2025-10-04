var data = guias;

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_guia_4').KTDatatable({
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
            return '\<a  href="/factura_guia/' + row.nro_guia  + '" target="_blank" class="btn btn-sm btn-clean btn-icon mr-2" title="Ver Guia">\
                             <span class="svg-icon svg-icon-md">\
                             <i class="icon-2x text-dark-50 flaticon-interface-11"></i>\
                             </span>\
                             </a>\
                        ';
          },
        
        
        }
                // Add more columns if needed
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'agencia._id');
            console.log($(this).val());
        });
        
        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'ruta');
        });
        
        // Manejar el cambio en los datetimepickers
        $('#kt_datetimepicker_1, #kt_datetimepicker_1_2').on('change.datetimepicker', function() {
            // Obtener las fechas seleccionadas en el formato YYYY-MM-DD
            var desdeDate = $('#kt_datetimepicker_1').find("input").val();
            var hastaDate = $('#kt_datetimepicker_1_2').find("input").val();
         console.log(desdeDate)
         console.log(hastaDate)
            // Filtrar el datatable
            datatable.search({
                desde: desdeDate,
                hasta: hastaDate
            }, 'fecha'); // Asumiendo que 'fecha' es el campo en tu datatable para filtrar por fecha
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
