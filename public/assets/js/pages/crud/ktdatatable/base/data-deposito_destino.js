var data = depositosDestino;
var paises = origenes;

function buscarpais(pais) {
  let nombre_pais = "";
  paises.forEach(item => { if (item.id === pais) nombre_pais = item.name; });
  return nombre_pais;
}

/* ======  columnas ====== */
const COLUMNS_MOBILE = [
  { field: 'nombre',        title: 'Deposito',  autoHide: false, width: 70 },
  { field: 'registroCount', title: 'Cant',      autoHide: false, width: 35 },
  { field: 'pais',          title: 'Pais',      autoHide: false, width: 70,
    template: row => buscarpais(row.pais)
  },
  { field: 'Actions',  title: '', sortable: false, overflow: 'visible', autoHide: false, width: 8,
    template: function(row) {
      return '\
        <a href="/deposito_destino/edit/'+ row._id +'" \
           class="btn btn-sm btn-clean btn-icon mr-1" title="Editar">\
          <span class="svg-icon svg-icon-md">\
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">\
              <g fill="none"><rect width="24" height="24"/><path fill="#000" d="M8,17.9 L8,6 l2.5-2.5 L16,6 v11.9 c0,.8-.7,1.5-1.5,1.5H9.5C8.7,19.4,8,18.7,8,17.9z"/></g>\
            </svg>\
          </span>\
        </a>';
    }
  },
  { field: 'Actions2', title: '', sortable: false, overflow: 'visible', autoHide: false, width: 50,
    template: function(row) {
      return '<a href="/mov_deposito_destino/'+ row._id +'" class="btn btn-primary btn-sm">Asignar</a>';
    }
  },
];

const COLUMNS_DESKTOP = [
  { field: 'nombre',        title: 'Depósito',    autoHide: false },
  { field: 'registroCount', title: 'Cant Guias' },
  { field: 'pais',          title: 'País',        autoHide: false,
    template: row => buscarpais(row.pais)
  },
  { field: 'Actions',  title: '', sortable: false, overflow: 'visible', autoHide: false,
    template: function(row) {
      return '\
        <a href="/deposito_destino/edit/' + row._id + '" class="btn btn-sm btn-clean btn-icon mr-2" title="Editar">\
         <span class="svg-icon svg-icon-md">\ <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">\ <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\ <rect x="0" y="0" width="24" height="24"/>\ <path d="M8,17.9148182 L8,5.96685884 C8,5.56391781 8.16211443,5.17792052 8.44982609,4.89581508 L10.965708,2.42895648 C11.5426798,1.86322723 12.4640974,1.85620921 13.0496196,2.41308426 L15.5337377,4.77566479 C15.8314604,5.0588212 16,5.45170806 16,5.86258077 L16,17.9148182 C16,18.7432453 15.3284271,19.4148182 14.5,19.4148182 L9.5,19.4148182 C8.67157288,19.4148182 8,18.7432453 8,17.9148182 Z" fill="#000000" fill-rule="nonzero"\ transform="translate(12.000000, 10.707409) rotate(-135.000000) translate(-12.000000, -10.707409) "/>\ <rect fill="#000000" opacity="0.3" x="5" y="20" width="15" height="2" rx="1"/>\ </g>\ </svg>\ </span>\
        </a>';
    }
  },
  { field: 'Actions2', title: '', sortable: false, overflow: 'visible', autoHide: false,
    template: function(row) {
      return '<a href="/mov_deposito_destino/' + row._id + '" class="btn btn-primary">Asignar Carga</a>';
    }
  },
];

/* ====== helpers ====== */
const isMobile = () => window.matchMedia('(max-width: 576px)').matches;
let currentMode = null;           // 'mobile' | 'desktop'
let datatableInstance = null;

function buildDatatable(columnsSet) {
  // guarda estado de búsqueda si existe
  const searchVal = $('#kt_datatable_search_query').val() || '';

  // destruye instancia previa si existe
  if (datatableInstance && datatableInstance.destroy) {
    datatableInstance.destroy();
    $('#kt_datatable_container').empty(); // limpiar DOM interno del plugin
  }

  datatableInstance = $('#kt_datatable_container').KTDatatable({
    data: { type: 'local', source: data, pageSize: 12 },
    layout: {
      // en móvil evitamos contenedor scroll de KT para no crear scroll horizontal
      scroll: !isMobile(),
      footer: false,
    },
    sortable: true,
    pagination: true,
    search: {
      input: $('#kt_datatable_search_query'),
      key: 'generalSearch'
    },
    columns: columnsSet,
  });

  // re-aplicar búsqueda
  if (searchVal) datatableInstance.search(searchVal, 'generalSearch');

  // (Si usas select filters)
  $('#kt_datatable_search_status').off('change.dd1').on('change.dd1', function() {
    datatableInstance.search($(this).val().toLowerCase(), 'Status');
  });
  $('#kt_datatable_search_type').off('change.dd2').on('change.dd2', function() {
    datatableInstance.search($(this).val().toLowerCase(), 'Type');
  });
  $('#kt_datatable_search_status, #kt_datatable_search_type').selectpicker();
}

function initResponsiveDatatable() {
  const nextMode = isMobile() ? 'mobile' : 'desktop';
  if (nextMode === currentMode && datatableInstance) return; // nada que hacer
  currentMode = nextMode;
  buildDatatable(currentMode === 'mobile' ? COLUMNS_MOBILE : COLUMNS_DESKTOP);
}

/* ====== init ====== */
$(document).ready(function () {
  initResponsiveDatatable();

  // debounce resize
  let rAF = null;
  window.addEventListener('resize', () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => initResponsiveDatatable());
  });
});
