var data = containers; // Datos originales obtenidos del backend
var paises = origenes; // Lista de países
var originalData = [...containers]; // Copia de los datos originales
var datatable; // Variable global para la instancia de KTDatatablevar 
console.log('usuario nivel', usuario_nivel)




// Copia de los datos originales para poder restaurarlos
var originalData = [...containers];
var datatable;
var estadoOptions = []; // Nueva variable para almacenar los estados

console.log('usuario nivel', usuario_nivel);

function buscarpais(pais) {
    let nombre_pais = "";
    paises.forEach(item => {
        if (item.id === pais) {
            nombre_pais = item.name;
        }
    });
    return nombre_pais;
}

// Función para inicializar la datatable con datos específicos
function initDatatable(datos) {
    // Destruir la instancia existente si hay una
    if (datatable) {
        datatable.destroy();
        $('#kt_datatable_container').empty(); // Limpiar el contenedor
    }

    // Crear nueva instancia
    datatable = $('#kt_datatable_container').KTDatatable({
        data: {
            type: 'local',
            source: datos,
            pageSize: 50,
        },
        layout: {
            scroll: true,
            footer: false,
            responsive: true,
            height: null,
            minWidth: 600,
            spinner: {
                type: 'loader',
                opacity: 0.7,
                class: 'text-primary'
            }
        },
        sortable: true,
        pagination: true,
        search: {
            input: $('#kt_datatable_search_query'),
            key: 'generalSearch'
        },
        columns: [
            {
                field: 'contenedor',
                title: 'Nro Contenedor',
                autoHide: false,
            },
            {
                field: 'registroCount',
                title: 'Cant Guias',
                width: 50,
            },
            {
                field: 'fecha_despacho',
                title: 'Fecha Despacho',
                type: 'date',
                template: function(row) {
                    // Verificar si la fecha de despacho existe y no está vacía
                    if (!row.fecha_despacho) {
                        return ''; // Devolver una cadena vacía si no hay fecha
                    }
                    
                    // Si hay una fecha, formatearla y mostrarla
                    var fecha = new Date(row.fecha_despacho);
                    // Validar si la fecha es válida
                    if (isNaN(fecha.getTime())) {
                        return 'Fecha inválida'; // O cualquier mensaje de error que prefieras
                    }
                    return `${fecha.getFullYear()}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${String(fecha.getDate()).padStart(2, '0')}`;
                }
            },
            {
                field: 'fecha_llegada_destino',
                title: 'Fecha Llegada',
                type: 'date',
                template: function(row) {
                    // Verificar si la fecha de despacho existe y no está vacía
                    if (!row.fecha_llegada_destino) {
                        return ''; // Devolver una cadena vacía si no hay fecha
                    }
                    
                    // Si hay una fecha, formatearla y mostrarla
                    var fecha = new Date(row.fecha_llegada_destino);
                    // Validar si la fecha es válida
                    if (isNaN(fecha.getTime())) {
                        return 'Fecha inválida'; // O cualquier mensaje de error que prefieras
                    }
                    return `${fecha.getFullYear()}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${String(fecha.getDate()).padStart(2, '0')}`;
                }
            },{
                field: 'dias_transito',
                title: 'Días en Tránsito',
                width: 100,
                template: function(row) {
                    // Verificar que ambas fechas existan
                    if (!row.fecha_despacho || !row.fecha_llegada_destino) {
                        return ''; // Si alguna fecha falta, no mostrar nada
                    }
            
                    const fechaDespacho = new Date(row.fecha_despacho);
                    const fechaLlegada = new Date(row.fecha_llegada_destino);
            
                    // Validar que ambas fechas sean válidas
                    if (isNaN(fechaDespacho.getTime()) || isNaN(fechaLlegada.getTime())) {
                        return 'Fechas inválidas';
                    }
            
                    // Calcular la diferencia en milisegundos
                    const diferenciaMilisegundos = fechaLlegada.getTime() - fechaDespacho.getTime();
            
                    // Convertir la diferencia a días (1000ms * 60s * 60min * 24h)
                    const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
            
                    return diferenciaDias >= 0 ? `${diferenciaDias} días` : 'Error';
                }
            },
            {
                field: 'naviera',
                title: 'Descripcion',
                autoHide: false
            },
            {
                field: 'pais',
                title: 'Pais',
                width: 75,
                template: function(row) {
                    return buscarpais(row.pais);
                }
            },
            {
                field: 'estado',
                title: 'Status',
            },
            {
                field: 'Actions',
                title: '',
                sortable: false,
                overflow: 'visible',
                autoHide: false,
                width: 25,
                template: function(row) {
                    if (usuario_nivel === 0 || usuario_nivel === 1 || usuario_nivel === 2) {
                        return '\
                            <a href="/container_fisico/edit/' + row._id + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Edit details">\
                                <span class="svg-icon svg-icon-md">\
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">\
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                                            <rect x="0" y="0" width="24" height="24"/>\
                                            <path d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z" fill="#000000" fill-rule="nonzero" transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "/>\
                                            <rect fill="#000000" opacity="0.3" x="5" y="20" width="15" height="2" rx="1"/>\
                                        </g>\
                                    </svg>\
                                </span>\
                            </a>\
                        ';
                    }
                    return '';
                },
            },
            {
                field: 'Actions2',
                title: '',
                sortable: false,
                overflow: 'visible',
                template: function(row) {
                    return '\
                        <a href="/mov_container_fisico/' + row._id + '" class="btn btn-primary mr-2" title="Edit details">\
                             Carga\
                        </a>\
                    ';
                },
            }
        ],
    });
}

// Función para filtrar los datos por estado
function filterByEstado(estado) {
    const filteredData = originalData.filter(item => {
        // Si el estado es vacío, mostrar todos, de lo contrario, filtrar por estado
        return !estado || item.estado === estado;
    });
    initDatatable(filteredData);
}

// Función para obtener los estados desde el backend
async function loadEstados() {
    try {
        const response = await fetch('/api/estado-containers');
        if (!response.ok) {
            throw new Error('Error al cargar los estados');
        }
        const estados = await response.json();
        estadoOptions = estados.map(e => e.nombre);

        const estadoSelect = $('#filter_by_estado');
        estadoSelect.empty();
        estadoSelect.append('<option value="">Mostrar Todos</option>');

        estadoOptions.forEach(estado => {
            const option = `<option value="${estado}">${estado}</option>`;
            estadoSelect.append(option);
        });

        // Seleccionar "Pendiente" por defecto
        estadoSelect.val('Pendiente');
        
        // Inicializar la tabla con el filtro "Pendiente"
        filterByEstado('Pendiente');
        
    } catch (error) {
        console.error('Error al cargar los estados:', error);
        const estadoSelect = $('#filter_by_estado');
        estadoSelect.empty();
        estadoSelect.append('<option value="">Error al cargar</option>');
        // Inicializar la tabla con todos los datos si hay un error
        initDatatable(originalData);
    }
}

// Inicializar la datatable y cargar los estados al cargar la página
$(document).ready(function() {
    // Inicializar la datatable con los datos originales (antes de cargar los estados)
    initDatatable(originalData);
    loadEstados();

    // Configurar búsqueda por guía
    $('#btn_search_guia').on('click', buscarPorGuia);
    $('#kt_datatable_search_guia').on('keyup', function(e) {
        if (e.key === 'Enter') {
            buscarPorGuia();
        }
    });

    // Botón para limpiar búsqueda
    $('#btn_clear_search').on('click', function() {
        $('#kt_datatable_search_guia').val('');
        restoreOriginalData();
    });
    
    // Manejador de eventos para el select de estados
    $('#filter_by_estado').on('change', function() {
        const selectedEstado = $(this).val();
        filterByEstado(selectedEstado);
    });
});

function buscarPorGuia() {
    const guia = $('#kt_datatable_search_guia').val().trim();
    showLoadingSpinner(true);
    if (!guia) {
        restoreOriginalData();
        return;
    }
    $.ajax({
        url: '/containers/search',
        method: 'GET',
        data: { guia: guia },
        success: function(response) {
            if (response.containers && response.containers.length > 0) {
                initDatatable(response.containers);
            } else {
                showEmptyResults();
            }
            mostrarInfoGuia(response);
        },
        error: showErrorMessage,
        complete: function() {
            showLoadingSpinner(false);
        }
    });
}

function mostrarInfoGuia(response) {
    const infoContainer = $('#info_guia2');
    infoContainer.empty();
    if (!response.guia) {
        infoContainer.html(`<div class="alert alert-warning"><strong>Guía no encontrada:</strong> No se encontró información para la guía buscada.</div>`);
        return;
    }
    const guia = response.guia[0];
    const fecha = new Date(guia.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const totalFac = guia.total_fac ? (typeof guia.total_fac === 'number' ? guia.total_fac : parseFloat(guia.total_fac) || 0) : 0;
    const html = `
        <div class="card">
            <div class="card-header"><h3 class="card-title">Información de la Guía: ${guia.nro_guia}</h3></div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered table-hover">
                        <thead class="thead-light">
                            <tr>
                                <th>Nro Guía</th>
                                <th>Remitente</th>
                                <th>Destinatario</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Total Factura</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${guia.nro_guia}</td>
                                <td>${guia.nom_cliente_remite}</td>
                                <td>${guia.nom_cliente_destina}</td>
                                <td>${fechaFormateada}</td>
                                <td>${horaFormateada}</td>
                                <td>$${totalFac}</td>
                                <td>${guia.tipo_contenido}</td>
                                <td>${obtenerDescripcionStatus(guia.status)}</td>
                                <td>
                                    <a class="btn btn-sm btn-primary" title="Entregar" href="/factura_guia_entrega/${guia.nro_guia}/1" target="_blank">
                                        <i class="icon-xl la la-file-signature"></i>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    infoContainer.html(html);
}

function obtenerDescripcionStatus(status) {
    switch(status) {
        case "-1": return "Por LLevar a agencia";
        case "1": return "Espera de Conductor";
        case "2": return "En Transito Local";
        case "2-2": return "En Trailer";
        case "3": return "En Transito Cedis";
        case "4": return "En Cedis";
        case "5": return "En Container Fisico";
        case "6": return "En Bodega Para Su Distribucion";
        case "7": return "En Transito Destino";
        case "8": return "Anulada";
        case "10": return "1 Transito Aduana De Destino";
        case "11": return "1-Recibida En Frontera Mx";
        case "12": return "2 Tramites Aduanales";
        case "12-2": return "2 Tramites Aduanales Escala HND";
        case "13": return "3 Revision Aduanal";
        case "14": return "4 En Bodega Para Su Distribucion";
        case "15": return "5 En Proceso De Entrega";
        case "16": return "6 Entregado";
        case "17": return "Entrega Notificada";
        default: return "Estado desconocido";
    }
}

function restoreOriginalData() {
    // Restaurar la datatable con los datos originales y aplicar el filtro de estado por defecto
    const estadoPorDefecto = 'Pendiente';
    const filteredData = originalData.filter(item => item.estado === estadoPorDefecto);
    initDatatable(filteredData);
    $('#filter_by_estado').val(estadoPorDefecto);
}

function showEmptyResults() {
    initDatatable([]);
    Swal.fire({
        icon: 'info',
        title: 'No se encontraron resultados',
        text: 'No hay contenedores asociados a esta guía',
        confirmButtonText: 'Aceptar'
    });
}

function showLoadingSpinner(show) {
    if (show) {
        $('#kt_datatable_container').append(`<div class="overlay-spinner"><div class="spinner"></div></div>`);
    } else {
        $('.overlay-spinner').remove();
    }
}

function showErrorMessage() {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al buscar la guía',
        confirmButtonText: 'Aceptar'
    });
}