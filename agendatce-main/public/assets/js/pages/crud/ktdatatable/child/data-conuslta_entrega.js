'use strict';
console.log('informacion');




function inicializarTablaBootstrap(newData) {
    // Construir la tabla HTML
    var tableHtml = '<table class="table table-bordered table-striped">';
    
    // Encabezado de la tabla
    tableHtml += '<thead>';
    tableHtml += '<tr>';
    tableHtml += '<th>#</th>';
    tableHtml += '<th>Nro Guía</th>';
    tableHtml += '<th>País Origen</th>';
    tableHtml += '<th>País Destino</th>';
    tableHtml += '<th>Usuario</th>';
    tableHtml += '<th>Etiquetas</th>';
    tableHtml += '<th>Fecha</th>';
    tableHtml += '</tr>';
    tableHtml += '</thead>';
    
    // Cuerpo de la tabla
    tableHtml += '<tbody>';
    
    newData.forEach(function(row, index) {
        var nroGuia = row.guia ? row.guia.nro_guia : '';
        var paisOrigen = row.pais || '';
        var paisDestino = row.pais_destina || '';
        var usuario = row.usuario ? row.usuario.nombre : '';
        var fecha = row.fecha ? new Date(row.fecha).toLocaleString() : '';
        
        // Generar HTML para las etiquetas (si existen)
        var etiquetasHtml = '';
        if (row.movEtiquetas && row.movEtiquetas.length > 0) {
            etiquetasHtml = row.movEtiquetas.map(function(et) {
                return '<span class="badge badge-success" style="margin-right: 5px;">' + et.etiqueta + '</span>';
            }).join('');
        }
        
        tableHtml += '<tr>';
        tableHtml += '<td>' + (index + 1) + '</td>';
        tableHtml += '<td>' + nroGuia + '</td>';
        tableHtml += '<td>' + paisOrigen + '</td>';
        tableHtml += '<td>' + paisDestino + '</td>';
        tableHtml += '<td>' + usuario + '</td>';
        tableHtml += '<td>' + etiquetasHtml + '</td>';
        tableHtml += '<td>' + fecha + '</td>';
        tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody>';
    tableHtml += '</table>';
    
    // Insertar la tabla en el div con id "kt_datatableX"
    $('#kt_datatableX').html(tableHtml);
}

// ----------------------------------------------------------------
// Evento para la consulta: Al hacer click en #informacion_comi
$('#informacion_comi').click(function () {
    // Capturamos los valores de los selects y del input de búsqueda
    var containerId    = $('#kt_datatable_search_type').val();
    var reclamoId      = $('#kt_datatable_search_type2').val();
    var tipoEntregaId  = $('#kt_datatable_search_type3').val();
    var quejaId        = $('#kt_datatable_search_type4').val();
    var entregadoPorId = $('#kt_datatable_search_type5').val();
    var searchQuery    = $('#kt_datatable_search_query').val();

    console.log({
        container: containerId,
        reclamo: reclamoId,
        tipoEntrega: tipoEntregaId,
        queja: quejaId,
        entregadoPor: entregadoPorId,
        search: searchQuery
    });

    // Realizamos la llamada AJAX a la API
    $.ajax({
        url: '/api/consulta_entrega',
        method: 'GET',
        data: {
            container: containerId,
            reclamo: reclamoId,
            tipoEntrega: tipoEntregaId,
            queja: quejaId,
            entregadoPor: entregadoPorId,
            search: searchQuery
        },
        success: function(response) {
            console.log("Respuesta de consulta_entrega:", response.data);
            // Actualizamos la tabla con los nuevos datos
            inicializarTablaBootstrap(response.data);
        },
        error: function(error) {
            console.error("Error al consultar:", error);
            alert("Hubo un error al consultar los datos.");
        }
    });
});

// Inicialización inicial cuando carga la página (si ya tienes datos iniciales en la variable global 'data')
jQuery(document).ready(function() {
    console.log('Documento listo');
    // Si 'data' es una variable global que ya contiene datos:
    if (typeof data !== 'undefined') {
        console.log('Inicializando con datos globales:', data);
        inicializarDatatable(data);
    }
});
