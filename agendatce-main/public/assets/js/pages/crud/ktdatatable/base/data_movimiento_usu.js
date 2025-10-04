
$(document).ready(function () {

    let data = []
    var datatable;

    function inicializarDatatable(datos) {
        console.log(datos);
        if (datatable) {
            datatable.destroy(); // Destruir la instancia existente para reinicializarla
        }
    
        datatable = $('#kt_datatable_movimiento').KTDatatable({
            // datasource definition
            data: {
                type: 'local', // Se debe especificar el tipo de origen de los datos como 'local'
                source: datos, // Utilizar 'datos' en lugar de 'data' que es incorrecto
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
                    field: 'created_at',
                    title: 'Fecha y Hora',
                    autoHide: false,
                    template: function(row) {
                        var fecha = new Date(row.created_at);
                        
                        // Formatear fecha
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
                        var anio = fecha.getFullYear();
                        
                        // Formatear hora
                        var horas = String(fecha.getHours()).padStart(2, '0');
                        var minutos = String(fecha.getMinutes()).padStart(2, '0');
                        var segundos = String(fecha.getSeconds()).padStart(2, '0');
                        
                        // Combinar fecha y hora
                        var fechaHoraFormateada = `${anio}/${mes}/${dia} ${horas}:${minutos}:${segundos}`;
                        
                        return `
                            <div>
                                <span>${fechaHoraFormateada}</span>
                            </div>
                        `;
                    }
                },
                {
                    field: 'action',
                    title: 'Movimiento'
                    
                },

                {
                    field: 'metadata',
                    title: 'Datos',
                    autoHide: false,
                    template: function(row) {
                        // Asegúrate de que metadata exista y sea un objeto
                        if (row.metadata && typeof row.metadata === 'object') {
                            // Crear un string de los pares clave-valor
                            let metadataContent = Object.entries(row.metadata)
                                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                                .join('<br>'); // Separar cada par por una nueva línea
                            
                            return `
                                <div>
                                    ${metadataContent}
                                </div>
                            `;
                        } else {
                            return `
                                <div>
                                    <span>Sin datos</span>
                                </div>
                            `;
                        }
                    }
                }
               
                
            ],
        });
    }
    
    $(document).ready(function () {
        // Función para obtener la fecha actual formateada como YYYY-MM-DD
        function getCurrentDateFormatted() {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
            const yyyy = today.getFullYear();
            return `${yyyy}-${mm}-${dd}`;
        }
    
        // Asigna la fecha actual a los campos de fecha (si existen en el DOM)
        const formattedDate = getCurrentDateFormatted();
        $('#kt_datetimepicker_1').val(formattedDate);
        $('#kt_datetimepicker_1_2').val(formattedDate);
        console.log(formattedDate)
        // Obtén el userId (suponiendo que tienes un input oculto con ese valor)
        const userId = $('#userId').val(); 
        console.log('UserId extraído de la URL22:', userId);
        const pathSegments = window.location.pathname.split('/');
        const userId2 = pathSegments[pathSegments.length - 1];
        console.log('UserId extraído de la URL:', userId2);
        
        // Verifica que los campos de fecha tengan valor
        if (!formattedDate) {
            alert('No se pudieron obtener las fechas.');
            return;
        }
        const startDateTime = formattedDate + ' 00:00';
        const endDateTime = formattedDate + ' 23:59';
      // Realizar la consulta a tu backend
      $.ajax({
        url: '/logs', // URL del endpoint en tu backend
        method: 'GET',
        data: {
            userId: userId,
            startDate: startDateTime,
            endDate: endDateTime
        },
        success: function (response) {
            if (response.success) {
                console.log(response.logs); // Procesar los datos recibidos
                inicializarDatatable(response.logs); // Llama a la función para actualizar el datatable
            } else {
                alert('No se encontraron registros en el rango de fechas seleccionado.');
            }
        },
        error: function (error) {
            console.error('Error al obtener datos:', error);
            alert('Hubo un error al consultar los datos.');
        },
    });
    });



    $('#informacion_comi').click(function () {
        const userId = $('#userId').val(); // Obtén el userId del campo oculto
        const startDate = $('#kt_datetimepicker_1').val(); // Fecha inicial
        const endDate = $('#kt_datetimepicker_1_2').val(); // Fecha final
    
        // Validar que las fechas estén seleccionadas
        if (!startDate || !endDate) {
            alert('Por favor selecciona ambas fechas.');
            return;
        }

        const startDateTime = startDate + ' 00:00';
        const endDateTime = endDate + ' 23:59';
    
        // Realizar la consulta a tu backend
        $.ajax({
            url: '/logs', // URL del endpoint en tu backend
            method: 'GET',
            data: {
                userId: userId,
                startDate: startDateTime,
                endDate: endDateTime
            },
            success: function (response) {
                if (response.success) {
                    console.log(response.logs); // Procesar los datos recibidos
                    inicializarDatatable(response.logs); // Llama a la función para actualizar el datatable
                } else {
                    alert('No se encontraron registros en el rango de fechas seleccionado.');
                }
            },
            error: function (error) {
                console.error('Error al obtener datos:', error);
                alert('Hubo un error al consultar los datos.');
            },
        });
    });
    

    function exportToPDF() {
        // Obtener el texto seleccionado de los selectores
        /*const formaPagoSelect = document.getElementById('kt_datatable_search_type');
        const formaPago = formaPagoSelect.options[formaPagoSelect.selectedIndex].text;*/
       
        const agencia_Select = document.getElementById('kt_datatable_search_status'); // Cambia el ID por el correcto
           const agencia_text = agencia_Select.options[agencia_Select.selectedIndex].text;
           const agencia_id = document.getElementById('kt_datatable_search_status').value; 
       
        const { jsPDF } = window.jspdf;
       
        // Crear un nuevo documento PDF
        const doc = new jsPDF();
       
        // Agregar un encabezado en la parte superior
        doc.setFontSize(18);
        doc.text('Reporte de Comisiones Pagadas', 14, 22);  // Texto en posición (x=14, y=22)
       
        // Agregar un subtítulo debajo del encabezado
        doc.setFontSize(12);
        doc.text('Lista Comisiones Pagadas', 14, 30);
        doc.setFontSize(10);
       
       
        doc.text('Agencia: ' + agencia_text, 100, 26);

        
       
        // Definir encabezados de la tabla
        const head = [['Guia / Fecha', 'Agencia', 'Usuario', 'Monto']];
       
        // Filtrar los datos según la forma de pago seleccionada
        let filteredData = data;
       
            // Filtro por forma de pago
          /*  if (formaPago !== 'Todas') {
                filteredData = filteredData.filter(row => row.forma_pago.nombre_forma === formaPago);
            }
       */
            // Filtro por usuario
            if (agencia_text !== 'Todas') {
                   filteredData = filteredData.filter(row => row.agencia._id === agencia_id);
              
               }
        
               const totalMonto = filteredData.reduce((sum, row) => sum + (parseFloat(row.monto) || 0), 0);
       
        // Definir los datos de las filas, solo con los datos filtrados
        const body = filteredData.map(row => [
               row.guia.nro_guia + ' / ' + new Date(row.fecha).toLocaleDateString(),
               row.agencia.NOMBRE,
               row.usuario.name,
               `$${Number(parseFloat(row.monto)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
           ]);
       
        
       // Agregar la tabla al PDF
       doc.autoTable({
           startY: 50,
           head: head,
           body: body,
           styles: { fontSize: 8 },
       });
       
       // Agregar el total al final
       const finalY = doc.lastAutoTable.finalY + 10;
       doc.text(`Total Comisones Pagadas: $${totalMonto.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 14, finalY);
       
        // Mostrar el PDF en una nueva ventana/pestaña
        doc.output('dataurlnewwindow');
       }
       
   
    $('#exportarPDF_comi').click(function () {
        exportToPDF();
    });
})

