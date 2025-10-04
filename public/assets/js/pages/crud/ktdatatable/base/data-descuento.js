$(document).ready(function () {
    // Inicializar datatable
    let data = []
    var datatable;
   

    function inicializarDatatable(datos) {
      
      
        if (datatable) {
            datatable.destroy(); // Destruir la instancia existente para reinicializarla
        }

        datatable = $('#kt_datatable_descuento').KTDatatable({
            data: {
                type: 'local',
                source: datos,
                pageSize: 20,
            },
            layout: {
                scroll: true,
                footer: true,
            },
            sortable: true,
            pagination: true,
            search: {
                input: $('#kt_datatable_search_query'),
                key: 'generalSearch',
            },
            columns: [
                { field: 'agencia._id', title: 'Códigoage', visible: false },
                {
                    field: 'guia.nro_guia_fecha',
                    title: 'Guia / Fecha2',
                    autoHide: false,
                    template: function (row) {
                        var fecha = new Date(row.fecha);
                        var dia = String(fecha.getDate()).padStart(2, '0');
                        var mes = String(fecha.getMonth() + 1).padStart(2, '0');
                        var anio = fecha.getFullYear();
                        return `
                            <div>
                                <strong>${row.nro_guia}</strong><br/>
                                <span>${anio}/${mes}/${dia}</span>
                            </div>
                        `;
                    },
                },
                { field: 'agencia.NOMBRE', title: 'Agencia', autoHide: false },
                {
                    field: 'monto',
                    title: 'Descuento',
                    autoHide: false,
                    template: function (row) {
                        return `$${parseFloat(row.total_descuento).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
                    },
                },
                { field: 'usuario.nombre', title: 'Usuario', autoHide: false },
            ],
        });
    }

    $('.btn-danger').click(function () {
        var desde = $('#kt_datetimepicker_1').val();
        var hasta = $('#kt_datetimepicker_1_2').val();
        var busqueda = $('#kt_datatable_search_query').val();
        var agencia = $('#kt_datatable_search_status').val();
        console.log(agencia)
        const fechaDesdeUTC = desde
            ? `${desde}T00:00:00.000Z`
            : null;

        // Ajustar fechaHasta al final del día
        const fechaHastaUTC = hasta
            ? `${hasta}T23:59:59.999Z`
            : null;

        // Validar que las fechas estén seleccionadas
        if (!fechaDesdeUTC || !fechaHastaUTC) {
            alert('Por favor selecciona ambas fechas.');
            return;
        }
    
        // Realizar la consulta a tu backend
        $.ajax({
            url: '/lista_rutas_filtradas', // Cambia esta URL a tu endpoint
            method: 'GET',
            data: {
                desde: fechaDesdeUTC,
                hasta: fechaHastaUTC,
                busqueda: busqueda,
                agencia: agencia,
            },
            success: function (response) {
                // Actualizar el datatable con los nuevos datos
                data = response.data;
                inicializarDatatable(response.data);
            },
            error: function (error) {
                console.error('Error al obtener datos:', error);
                alert('Hubo un error al consultar los datos.');
            },
        });
    });

    
      // Función para exportar a PDF
      function exportToPDF() {
        if (data.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        const agencia_Select = document.getElementById('kt_datatable_search_status'); // Cambia el ID por el correcto
        const agencia_text = agencia_Select.options[agencia_Select.selectedIndex].text;
        const agencia_id = document.getElementById('kt_datatable_search_status').value;

        const { jsPDF } = window.jspdf;

        // Crear un nuevo documento PDF
        const doc = new jsPDF();

        // Agregar un encabezado en la parte superior
        doc.setFontSize(18);
        doc.text('Reporte de Descuentos', 14, 22);  // Texto en posición (x=14, y=22)

        // Agregar un subtítulo debajo del encabezado
        doc.setFontSize(12);
        doc.text('Lista de Descuentos ', 14, 30);
        doc.setFontSize(10);

        doc.text('Agencia: ' + agencia_text, 100, 26);

        // Filtrar los datos según la agencia seleccionada
        let filteredData = data;
        if (agencia_text !== 'Todas') {
            filteredData = filteredData.filter(row => row.agencia._id === agencia_id);
        }

        const totalMonto = filteredData.reduce((sum, row) => sum + (parseFloat(row.total_descuento) || 0), 0);

        // Definir los encabezados de la tabla
        const head = [['Guia / Fecha', 'Cliente', 'Agencia', 'Usuario', 'Monto']];

        // Definir los datos de las filas, solo con los datos filtrados
        const body = filteredData.map(row => [
            row.nro_guia + ' / ' + new Date(row.fecha).toLocaleDateString(),
            row.nom_cliente_remite,
            row.agencia.NOMBRE,
            row.usuario.nombre,
            `$${Number(parseFloat(row.total_descuento)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
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
        doc.text(`Total Comisiones Pagadas: $${totalMonto.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 14, finalY);

        // Mostrar el PDF en una nueva ventana/pestaña
        doc.output('dataurlnewwindow');
    }

    // Llama a exportToPDF() cuando sea necesario, por ejemplo, al hacer clic en un botón:
    $('#exportarPDF').click(function () {
        exportToPDF();
    });


    // Inicializar datatable vacío al cargar la página
    
});
