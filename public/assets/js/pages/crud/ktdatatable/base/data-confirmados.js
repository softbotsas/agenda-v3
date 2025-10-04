var data = confirmaciones;

var KTDatatableRemoteAjaxDemo = function() {
    // Private functions
   
    // basic demo
    var demo = function() {
        var datatable = $('#kt_datatable_confirmados').KTDatatable({
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
                    field: 'agencia._id',
                    title: 'Códigoage',
                    visible: false
                },
                {
                    field: 'forma_pago._id',
                    title: 'parma pago',
                    visible: false
                },

               
                
                {
                    field: 'fecha',
                    title: 'Fecha',
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
                                
                                <span>${fechaFormateada}</span>
                            </div>
                        `;
                    }
                },{
                    field: 'usuario.name',
                    title: 'Confirmado Por',
                    autoHide: false
                },
                {
                    field: 'monto',
                        title: 'Monto',
                        autoHide: false, 
                        template: function(row) {
                            const totalFormateado = `$${Number(parseFloat(row.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        
                            return  totalFormateado;
                        }    
                },{
                    field: 'pagosConfi',
                    title: '',
                    autoHide: true,
                    template: function(row) {
                        
                        return `    
                           
                             <span class="ml-2">Pagos</span>                
                            <div  id="details-${row._id}">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Guia</th>
                                            <th>Fecha</th>
                                            <th>Cuenta</th>
                                            <th>Forma Pago</th>
                                            <th>Cobrado por:</th>
                                            <th>Imagen</th> <!-- Nueva columna para la imagen -->
                                             <th>Rurta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${row.pagosConfi.map(pago => {
                                            // Formatear la fecha aquí
                                            var fecha = new Date(pago.pago.fecha);
                                            var dia = String(fecha.getDate()).padStart(2, '0');
                                            var mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
                                            var anio = fecha.getFullYear();
                                            var fechaFormateada = `${anio}/${mes}/${dia}`;
                                            
                                            // Verificar si existe una imagen_comprobante
                                            const imagenComprobante = pago.pago.imagen_comprobante ? 
                                                `<a href="${pago.pago.imagen_comprobante}" target="_blank">Ver imagen</a>` : 
                                                ''; // Si existe, crear el enlace, sino, dejar vacío
                
                                            return `
                                                <tr>
                                                    <td>${pago.guia.nro_guia}</td>
                                                    <td>${fechaFormateada}</td>  <!-- Usamos la fecha formateada -->
                                                    <td>${pago.monto}</td>
                                                     <td>${pago.pago.forma_pago.nombre_forma}</td>
                                                    <td>${pago.pago.usuario.name}</td>
                                                    <td>${imagenComprobante}</td> <!-- Columna con la imagen o vacío -->
                                                     <td>${pago.guia.ruta.Rutas}</td>
                                               
                                                    </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>`;
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
                        return `
                            <button class="btn btn-sm btn-primary" onclick="exportToPDF('${row._id}')">
                                Imprimir
                            </button>
                        `;
                    }
                }
                
                
       
            ],
        });

        $('#kt_datatable_search_status').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'agencia._id');
            console.log($(this).val());
        });
        
        $('#kt_datatable_search_type').on('change', function() {
            datatable.search($(this).val().toLowerCase(), 'forma_pago._id');
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
