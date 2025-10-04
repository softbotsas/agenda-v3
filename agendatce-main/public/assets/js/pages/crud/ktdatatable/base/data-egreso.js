
$(document).ready(function () {

    let data = []
    var datatable;

    function inicializarDatatable(datos) {
        console.log(datos);
        data = datos
        if (datatable) {
            datatable.destroy(); // Destruir la instancia existente para reinicializarla
        }
    
        datatable = $('#kt_datatable_gastos').KTDatatable({
            // datasource definition
            data: {
                type: 'local', // Se debe especificar el tipo de origen de los datos como 'local'
                source: datos, // Utilizarto 'datos' en lugar de 'data' que es incorrecto
                pageSize: 20,
            },
    
            // layout definition
            layout: {
                scroll: true,
                footer: true, // Cambiar a true para activar el pie de tabla
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
                    field: 'fecha',
                    title: 'Fecha',
                    autoHide: false,
                    template: function(row) {
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
                    field: 'tipoEgreso.nombre',
                    title: 'T. de Egreso',
                    autoHide: false
                },
                
                {
                    field: 'monto',
                    title: 'Monto',
                    autoHide: false,
                    template: function(row) {
                        const totalFormateado = `$${Number(parseFloat(row.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                        return totalFormateado;
                    }
                },
                {
                    field: 'agencia.NOMBRE',
                    title: 'Agencia',
                    autoHide: false
                },

                {
                    field: 'ruta.rutas',
                    title: 'Ruta',
                    autoHide: false
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
        
                  
                            <form action="/pagos/comision/${row._id}?_method=DELETE" 
                                  method="POST" 
                                  style="display:inline;">
                                
                                <input type="hidden" name="_method" value="DELETE">
                  
                                <button type="submit" 
                                        class="btn btn-sm btn-clean btn-icon" 
                                        title="Delete" 
                                        style="background:none; border:none; padding:0;">
                                    <span class="svg-icon svg-icon-md">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             width="24px" 
                                             height="24px" 
                                             viewBox="0 0 24 24" 
                                             version="1.1">
                                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <rect x="0" y="0" width="24" height="24"/>
                                                <path d="M6,8 L6,20.5 C6,21.3284271 
                                                        6.67157288,22 7.5,22 
                                                        L16.5,22 
                                                        C17.3284271,22 18,21.3284271 18,20.5 
                                                        L18,8 L6,8 Z" 
                                                      fill="#000000" 
                                                      fill-rule="nonzero"/>
                                                <path d="M14,4.5 L14,4 
                                                        C14,3.44771525 
                                                        13.5522847,3 13,3 
                                                        L11,3 
                                                        C10.4477153,3 10,3.44771525 10,4 
                                                        L10,4.5 
                                                        L5.5,4.5 
                                                        C5.22385763,4.5 5,4.72385763 5,5 
                                                        L5,5.5 
                                                        C5,5.77614237 5.22385763,6 5.5,6 
                                                        L18.5,6 
                                                        C18.7761424,6 19,5.77614237 19,5.5 
                                                        L19,5 
                                                        C19,4.72385763 18.7761424,4.5 18.5,4.5 
                                                        L14,4.5 Z" 
                                                      fill="#000000" 
                                                      opacity="0.3"/>
                                            </g>
                                        </svg>
                                    </span>
                                </button>
                            </form>
                  
                            ${
                              row.imagen 
                                ? `
                                  <a href="${row.imagen}" 
                                     target="_blank" 
                                     class="btn btn-sm btn-clean btn-icon mr-2" 
                                     title="Ver Imagen">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="icon-2x text-dark-50 flaticon-photo-camera"></i>
                                    </span>
                                  </a>`
                                : ''
                            }
                        `;
                    }
                  },
                {
                    field: 'usuario.name',
                    title: 'Usuario',
                    autoHide: true
                }
            ],
        });
    }
    


    $('#informacion_comi').click(function () {
        var desde = $('#kt_datetimepicker_1').val(); // Fecha "Desde"
        var hasta = $('#kt_datetimepicker_1_2').val(); // Fecha "Hasta"
        var ruta = $('#kt_datatable_search_type').val(); // Búsqueda por nro_guia
        var agencia = $('#kt_datatable_search_status').val(); // Agencia seleccionada

        var egreso = $('#kt_datatable_search_type2').val(); // Búsqueda por nro_guia
        var usuario = $('#kt_datatable_search_status2').val(); // Agencia seleccionada
    
        var fechaDesdeUTC = null;
        var fechaHastaUTC = null;
    
        // Validar si las fechas están seleccionadas
        if (desde) {
            fechaDesdeUTC = `${desde}T00:00:00.000Z`; // Inicio del día en UTC
        }
        if (hasta) {
            fechaHastaUTC = `${hasta}T23:59:59.999Z`; // Fin del día en UTC
        }
    
        // Construcción del objeto de datos solo con parámetros definidos
        var requestData = {};
        if (fechaDesdeUTC) requestData.desde = fechaDesdeUTC;
        if (fechaHastaUTC) requestData.hasta = fechaHastaUTC;
       
       
        if (egreso) requestData.busqueda = tipoEgreso;
        if (agencia) requestData.agencia = agencia;
        if (usuario) requestData.usuario = usuario;
        if (ruta) requestData.ruta = ruta;

        console.log("Parámetros enviados:", requestData);
    
        // Realizar la consulta a tu backend
        $.ajax({
            url: '/egresos/api', // Asegúrate de que esta es la URL correcta de tu API
            method: 'GET',
            data: requestData,
            success: function (response) {
                console.log("Datos recibidos:", response.data);
                
                // Verificar si response.data existe y no está vacío
                if (response.data && response.data.length > 0) {
                    inicializarDatatable(response.data);
                } else {
                    alert("No se encontraron resultados.");
                }
            },
            error: function (error) {
                console.error('Error al obtener datos:', error);
                alert('Hubo un error al consultar los datos.');
            },
        });
    });
    

    function exportToPDF() {
        // Obtener el texto y valor de la agencia seleccionada
        const agenciaSelect = document.getElementById('kt_datatable_search_status');
        const agencia_text = agenciaSelect.options[agenciaSelect.selectedIndex].text;

        const RutaSelect = document.getElementById('kt_datatable_search_type');
        const ruta_text = agenciaSelect.options[RutaSelect.selectedIndex].text;

        const TipoSelect = document.getElementById('kt_datatable_search_type2');
        const tipo_text = agenciaSelect.options[TipoSelect.selectedIndex].text;
        
        const UsuarioSelect = document.getElementById('kt_datatable_search_status2');
        const usuarop_text = agenciaSelect.options[UsuarioSelect.selectedIndex].text;
        
        const agencia_id = agenciaSelect.value;
    
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Encabezado principal
        doc.setFontSize(18);
        doc.text('Reporte de Gastos', 14, 22);
    
        // Subtítulo y datos adicionales
        doc.setFontSize(12);
        doc.text('Lista Comisiones Pagadas', 14, 30);
    
        doc.setFontSize(10);
        // Mostrar información de la agencia y la fecha de generación
        doc.text(`Agencia: ${agencia_text}`, 14, 34); 
        doc.text(`Rutas: ${ruta_text}`, 14, 38);
        doc.text(`Tipo: ${tipo_text}`, 14, 42);
        doc.text(`Usuario: ${usuarop_text}`, 150, 42);

        
        const fechaGeneracion = new Date().toLocaleDateString();
        doc.text(`Fecha de Generación: ${fechaGeneracion}`, 150, 38);
    
        // Encabezado de la tabla
        const head = [['Guia', 'Agencia', 'Usuario', 'Monto']];
    
        // Filtrar datos según la agencia seleccionada
        let filteredData = data;
        if (agencia_text !== 'Todas') {
            filteredData = filteredData.filter(row => row.agencia._id === agencia_id);
        }
        const totalMonto = filteredData.reduce((sum, row) => sum + (parseFloat(row.monto) || 0), 0);
    
        // Preparar las filas de la tabla
        const body = filteredData.map(row => {
            const fecha = new Date(row.fecha);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const fechaFormateada = `${anio}/${mes}/${dia}`;
        
            return [
                fechaFormateada,
                row.agencia.NOMBRE,
                row.usuario.name,
                `$${Number(parseFloat(row.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
            ];
        });
    
        // Agregar la tabla al PDF utilizando autoTable
        doc.autoTable({
            startY: 45,  // Inicia la tabla por debajo de los encabezados
            head: head,
            body: body,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] },  // Color de fondo para el encabezado (opcional)
            margin: { top: 45 }
        });
    
        // Agregar el total al final de la tabla
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Total Comisiones Pagadas: $${totalMonto.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 14, finalY);
    
        // Abrir el PDF en una nueva pestaña/ventana
        doc.output('dataurlnewwindow');
    }
    
    $('#exportarPDF_comi').click(function () {
        exportToPDF();
    });
    
})

