
$(document).ready(function () {

    let data = []
    var datatable;

    function inicializarDatatable(datos) {
        console.log(datos);
        if (datatable) {
            datatable.destroy(); // Destruir la instancia existente para reinicializarla
        }
    
        datatable = $('#kt_datatable_comision').KTDatatable({
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
                    field: 'agencia._id',
                    title: 'Códigoage',
                    visible: false
                },
                {
                    field: '',
                    title: ' Fecha2',
                    autoHide: false,
                    template: function(row) {
                        var fecha = new Date(row.fecha_creacion);
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
                    field:'agencia2', 
                    title: 'Agencia',
                        autoHide: false, 
                        template: function(row) {
                            
                        
                            return  row.agencia.NOMBRE;
                        }   
                },
              
                {
                    field: 'celular',
                    title: 'Celular',
                    autoHide: false,
                  
                },
               
                
            ],
        });
    }
    

    $('#informacion_comi').click(function () {
        const desde = $('#kt_datetimepicker_1').val();
        const hasta = $('#kt_datetimepicker_1_2').val();
        const laagencia = $('#kt_datatable_search_status').val();
        // Validar que las fechas estén seleccionadas
        if (!desde || !hasta) {
            alert('Por favor selecciona ambas fechas.');
            return;
        }

        const fechaDesdeUTC = desde
        ? `${desde}T00:00:00.000Z`
        : null;
    
    // Ajustar fechaHasta al final del día
       const fechaHastaUTC = hasta
        ? `${hasta}T23:59:59.999Z`
        : null;
    
        console.log('Desde UTC:', fechaDesdeUTC);
        console.log('Hasta UTC:', fechaHastaUTC);
    
        // Realizar la consulta al backend
        $.ajax({
            url: '/api/preguias/noConvertidas', // Cambia esta URL si es necesario
            method: 'GET',
            data: {
                fechaInicio: fechaDesdeUTC,
                fechaFin: fechaHastaUTC,
                agencia: laagencia
            },
            success: function (response) {
                console.log('Datos obtenidos:', response);
    
                // Maneja las estadísticas y datos
                const { estadisticas, preguiasNoConvertidas } = response;
    
                // Ejemplo: Mostrar estadísticas
                $('#totalPreguias').text(estadisticas.totalPreguias);
                $('#totalPreguiasConvertidas').text(estadisticas.totalPreguiasConvertidas);
                $('#totalPreguiasNoConvertidas').text(estadisticas.totalPreguiasNoConvertidas);
                $('#efectividad').text(estadisticas.efectividad);
    
                // Ejemplo: Inicializar/Actualizar DataTable con las preguias no convertidas
                inicializarDatatable(preguiasNoConvertidas);
            },
            error: function (error) {
                console.error('Error al obtener datos:', error);
                alert('Hubo un error al consultar los datos.');
            }
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

