// Variables globales para el historial
let historyData = [];
let filteredHistory = [];
let departments = [];
let users = [];
let tasks = [];

// ========================================
// FUNCIONES PRINCIPALES DEL HISTORIAL
// ========================================

// Cargar datos del historial desde el servidor
async function loadHistoryData() {
  console.log('🚀 Cargando historial desde servidor...');
  
  try {
    const response = await fetch('/agendatce/api/history/all', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📊 Respuesta del servidor:', result);
    
    if (result.success && result.data) {
      historyData = result.data;
      filteredHistory = [...historyData];
      
      console.log('✅ Historial cargado:', historyData.length, 'actividades');
      
      // Actualizar estadísticas
      updateHistoryStats(historyData);
      
      // Mostrar historial
      updateHistoryDisplay(filteredHistory);
      
      // Cargar datos para filtros
      await loadFilterData();
      
    } else {
      throw new Error(result.message || 'Error desconocido del servidor');
    }
    
  } catch (error) {
    console.error('❌ Error cargando historial:', error);
    showHistoryError('Error al cargar el historial: ' + error.message);
  }
}

// Cargar datos para los filtros
async function loadFilterData() {
  console.log('🔧 Cargando datos para filtros...');
  
  try {
    // Cargar departamentos
    const deptResponse = await fetch('/agendatce/api/configuration/departments', {
      credentials: 'include'
    });
    if (deptResponse.ok) {
      const deptResult = await deptResponse.json();
      departments = deptResult.data || [];
      populateDepartmentFilter();
    }
    
    // Cargar usuarios
    const userResponse = await fetch('/agendatce/api/configuration/employees', {
      credentials: 'include'
    });
    if (userResponse.ok) {
      const userResult = await userResponse.json();
      users = userResult.data || [];
      populateUserFilter();
    }
    
    // Cargar tareas
    const taskResponse = await fetch('/agendatce/api/configuration/tasks', {
      credentials: 'include'
    });
    if (taskResponse.ok) {
      const taskResult = await taskResponse.json();
      tasks = taskResult.data || [];
      populateTaskFilter();
    }
    
    console.log('✅ Datos de filtros cargados');
    
  } catch (error) {
    console.error('❌ Error cargando datos de filtros:', error);
  }
}

// ========================================
// FUNCIONES DE FILTROS
// ========================================

function populateDepartmentFilter() {
  const select = document.getElementById('department-filter');
  if (!select) return;
  
  select.innerHTML = '<option value="">Todos los departamentos</option>';
  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept._id;
    option.textContent = dept.name || dept.departamento_name || 'Sin nombre';
    select.appendChild(option);
  });
}

function populateUserFilter() {
  const select = document.getElementById('user-filter');
  if (!select) return;
  
  select.innerHTML = '<option value="">Todos los usuarios</option>';
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = user.name || user.nombre || 'Usuario sin nombre';
    select.appendChild(option);
  });
}

function populateTaskFilter() {
  const select = document.getElementById('task-filter');
  if (!select) return;
  
  select.innerHTML = '<option value="">Todas las tareas</option>';
  tasks.forEach(task => {
    const option = document.createElement('option');
    option.value = task._id;
    option.textContent = task.title || 'Tarea sin título';
    select.appendChild(option);
  });
}

function onDepartmentChange() {
  const departmentSelect = document.getElementById('department-filter');
  const userSelect = document.getElementById('user-filter');
  
  if (!departmentSelect || !userSelect) return;
  
  const selectedDept = departmentSelect.value;
  
  // Filtrar usuarios por departamento
  userSelect.innerHTML = '<option value="">Todos los usuarios</option>';
  
  const filteredUsers = selectedDept ? 
    users.filter(user => user.departamento === selectedDept) : 
    users;
    
  filteredUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = user.name || user.nombre || 'Usuario sin nombre';
    userSelect.appendChild(option);
  });
}

function applyFilters() {
  console.log('🔍 Aplicando filtros...');
  
  const departmentFilter = document.getElementById('department-filter')?.value || '';
  const userFilter = document.getElementById('user-filter')?.value || '';
  const taskFilter = document.getElementById('task-filter')?.value || '';
  const actionFilter = document.getElementById('action-filter')?.value || '';
  const statusFilter = document.getElementById('status-filter')?.value || '';
  const dateFrom = document.getElementById('date-from')?.value || '';
  const dateTo = document.getElementById('date-to')?.value || '';
  
  console.log('🎯 Filtros aplicados:', {
    departmentFilter, userFilter, taskFilter, 
    actionFilter, statusFilter, dateFrom, dateTo
  });
  
  filteredHistory = historyData.filter(activity => {
    // Filtro por departamento (a través del usuario)
    if (departmentFilter) {
      const user = users.find(u => u._id === activity.user_id);
      if (!user || user.departamento !== departmentFilter) {
        return false;
      }
    }
    
    // Filtro por usuario
    if (userFilter && activity.user_id !== userFilter) {
      return false;
    }
    
    // Filtro por tarea
    if (taskFilter && activity.task_definition !== taskFilter) {
      return false;
    }
    
    // Filtro por tipo de acción
    if (actionFilter && activity.action_type !== actionFilter) {
      return false;
    }
    
    // Filtro por estado
    if (statusFilter) {
      if (statusFilter === 'with_evidence' && (!activity.evidence || activity.evidence.length === 0)) {
        return false;
      }
      if (statusFilter === 'without_evidence' && activity.evidence && activity.evidence.length > 0) {
        return false;
      }
    }
    
    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      const activityDate = new Date(activity.created_at);
      if (dateFrom && activityDate < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && activityDate > new Date(dateTo + 'T23:59:59')) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log('📊 Resultado filtrado:', filteredHistory.length, 'actividades');
  
  // Actualizar estadísticas con datos filtrados
  updateHistoryStats(filteredHistory);
  
  // Mostrar historial filtrado
  updateHistoryDisplay(filteredHistory);
}

function clearFilters() {
  console.log('🧹 Limpiando filtros...');
  
  // Resetear todos los filtros
  document.getElementById('department-filter').value = '';
  document.getElementById('user-filter').value = '';
  document.getElementById('task-filter').value = '';
  document.getElementById('action-filter').value = '';
  document.getElementById('status-filter').value = '';
  document.getElementById('date-from').value = '';
  document.getElementById('date-to').value = '';
  
  // Restaurar historial completo
  filteredHistory = [...historyData];
  
  // Actualizar estadísticas
  updateHistoryStats(filteredHistory);
  
  // Mostrar historial completo
  updateHistoryDisplay(filteredHistory);
}

function toggleAdvancedFilters() {
  const filtersSection = document.getElementById('filters-section');
  if (filtersSection.style.display === 'none') {
    filtersSection.style.display = 'block';
  } else {
    filtersSection.style.display = 'none';
  }
}

// ========================================
// FUNCIONES DE ESTADÍSTICAS
// ========================================

function updateHistoryStats(activities) {
  console.log('📊 Actualizando estadísticas...');
  
  const totalActivities = activities.length;
  const completedCount = activities.filter(a => a.action_type === 'completed').length;
  const incrementCount = activities.filter(a => a.action_type === 'increment').length;
  const notApplicableCount = activities.filter(a => a.action_type === 'not_applicable').length;
  
  // Contar usuarios únicos
  const uniqueUsers = new Set(activities.map(a => a.user_id)).size;
  
  // Actualizar DOM
  document.getElementById('total-activities').textContent = totalActivities;
  document.getElementById('completed-count').textContent = completedCount;
  document.getElementById('increment-count').textContent = incrementCount;
  document.getElementById('not-applicable-count').textContent = notApplicableCount;
  document.getElementById('active-users').textContent = uniqueUsers;
  
  // Atrasadas (esto requeriría lógica más compleja, por ahora 0)
  document.getElementById('overdue-count').textContent = '0';
  
  console.log('✅ Estadísticas actualizadas');
}

// ========================================
// FUNCIONES DE VISUALIZACIÓN
// ========================================

function updateHistoryDisplay(activities) {
  console.log('🎨 Actualizando visualización...');
  
  const container = document.getElementById('history-container');
  if (!container) {
    console.error('❌ Container history-container no encontrado');
    return;
  }
  
  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-history text-muted fa-3x mb-3"></i>
        <h5>No hay actividades que coincidan con los filtros</h5>
        <p class="text-muted">Intenta ajustar los filtros o registrar nuevas actividades.</p>
      </div>
    `;
    return;
  }
  
  // Agrupar por fecha
  const groupedActivities = {};
  activities.forEach(activity => {
    const date = new Date(activity.created_at).toLocaleDateString('es-ES');
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });
  
  let html = '';
  
  Object.keys(groupedActivities).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
    const dayActivities = groupedActivities[date];
    
    html += `
      <div class="mb-4">
        <h6 class="text-primary mb-3">
          <i class="fas fa-calendar-day me-2"></i>
          ${date} (${dayActivities.length} actividades)
        </h6>
        <div class="timeline">
          ${dayActivities.map(activity => createActivityCard(activity)).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  console.log('✅ Visualización actualizada');
}

function createActivityCard(activity) {
  const actionIcon = {
    'completed': 'check-circle',
    'increment': 'plus-circle',
    'not_applicable': 'ban'
  }[activity.action_type] || 'circle';
  
  const actionColor = {
    'completed': 'success',
    'increment': 'info',
    'not_applicable': 'secondary'
  }[activity.action_type] || 'primary';
  
  const actionText = {
    'completed': 'Completó',
    'increment': 'Incrementó',
    'not_applicable': 'Marcó como No Aplica'
  }[activity.action_type] || 'Registró acción';
  
  const evidenceBadges = activity.evidence && activity.evidence.length > 0 ? 
    activity.evidence.map(ev => `
      <span class="badge bg-warning me-1" onclick="viewEvidence('${ev.url}', '${ev.original_name || ev.filename}')" style="cursor: pointer;">
        <i class="fas fa-paperclip me-1"></i>${ev.original_name || ev.filename}
      </span>
    `).join('') : '';
  
  return `
    <div class="card mb-3 border-0 shadow-sm">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-1">
            <div class="bg-${actionColor} bg-opacity-10 rounded-3 p-2 text-center">
              <i class="fas fa-${actionIcon} text-${actionColor}"></i>
            </div>
          </div>
          <div class="col-md-3">
            <h6 class="mb-1">${activity.task_title || 'Tarea sin título'}</h6>
            <p class="text-muted mb-0 small">
              <i class="fas fa-user me-1"></i>${activity.user_name || 'Usuario desconocido'}
            </p>
          </div>
          <div class="col-md-2">
            <span class="badge bg-${actionColor}">${actionText}</span>
            ${activity.action_type === 'increment' ? `<br><small class="text-muted">Valor: +${activity.value}</small>` : ''}
          </div>
          <div class="col-md-3">
            <small class="text-muted">${new Date(activity.created_at).toLocaleTimeString('es-ES')}</small>
            ${evidenceBadges ? `<br>${evidenceBadges}` : ''}
          </div>
          <div class="col-md-3">
            ${activity.comment ? 
              `<div class="text-truncate" title="${activity.comment}">
                <i class="fas fa-comment me-1"></i>
                <small class="text-muted">${activity.comment.substring(0, 40)}${activity.comment.length > 40 ? '...' : ''}</small>
              </div>` : ''}
            <button class="btn btn-sm btn-outline-primary mt-1" onclick="viewActivityDetails('${activity._id}')">
              <i class="fas fa-eye me-1"></i>Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========================================
// FUNCIONES DE MODALES
// ========================================

function viewActivityDetails(activityId) {
  const activity = historyData.find(a => a._id === activityId);
  if (!activity) return;
  
  // Usar el modal estático de history.ejs
  const modal = new bootstrap.Modal(document.getElementById('activityDetailModal'));
  const modalBody = document.querySelector('#activityDetailModal .modal-body');
  
  modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6>Información General</h6>
        <p><strong>Tarea:</strong> ${activity.task_title || 'Sin título'}</p>
        <p><strong>Usuario:</strong> ${activity.user_name || 'Desconocido'}</p>
        <p><strong>Acción:</strong> ${getActionText(activity.action_type)}</p>
        <p><strong>Fecha:</strong> ${new Date(activity.created_at).toLocaleString('es-ES')}</p>
        ${activity.value ? `<p><strong>Valor:</strong> ${activity.value}</p>` : ''}
      </div>
      <div class="col-md-6">
        <h6>Comentarios</h6>
        <p>${activity.comment || 'Sin comentarios'}</p>
        ${activity.evidence && activity.evidence.length > 0 ? `
          <h6>Evidencias</h6>
          <div class="d-flex flex-wrap gap-2">
            ${activity.evidence.map(ev => `
              <button class="btn btn-sm btn-outline-primary" onclick="viewEvidence('${ev.url}', '${ev.original_name || ev.filename}')">
                <i class="fas fa-paperclip me-1"></i>${ev.original_name || ev.filename}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  modal.show();
}

function viewEvidence(url, filename) {
  if (!url || !filename) return;
  
  // Usar el modal estático de history.ejs
  const modal = new bootstrap.Modal(document.getElementById('evidenceModal'));
  const modalBody = document.querySelector('#evidenceModal .modal-body');
  const modalTitle = document.querySelector('#evidenceModal .modal-title');
  
  modalTitle.textContent = filename;
  
  if (isImageFile(filename)) {
    modalBody.innerHTML = `
      <div class="text-center">
        <div class="mb-3">
          <button class="btn btn-sm btn-outline-secondary me-2" onclick="zoomImage('in')">
            <i class="fas fa-search-plus"></i> Zoom In
          </button>
          <button class="btn btn-sm btn-outline-secondary me-2" onclick="zoomImage('out')">
            <i class="fas fa-search-minus"></i> Zoom Out
          </button>
          <button class="btn btn-sm btn-outline-secondary me-2" onclick="resetImageZoom()">
            <i class="fas fa-expand-arrows-alt"></i> Reset
          </button>
          <a href="${url}" class="btn btn-sm btn-primary" download="${filename}">
            <i class="fas fa-download"></i> Descargar
          </a>
        </div>
        <div class="image-container" style="max-height: 70vh; overflow: auto; border: 1px solid #dee2e6; border-radius: 8px; background: #f8f9fa;">
          <img id="evidenceImage" src="${url}" class="img-fluid" alt="${filename}" style="transition: transform 0.3s ease; cursor: zoom-in;" onclick="toggleImageZoom()">
        </div>
        <div class="mt-2">
          <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            Haz clic en la imagen para hacer zoom
          </small>
        </div>
      </div>
    `;
  } else {
    modalBody.innerHTML = `
      <div class="text-center">
        <div class="mb-4">
          <i class="fas fa-file fa-4x text-muted mb-3"></i>
          <h5>${filename}</h5>
          <p class="text-muted">Archivo adjunto</p>
        </div>
        <div class="d-grid gap-2 d-md-block">
          <a href="${url}" class="btn btn-primary" download="${filename}">
            <i class="fas fa-download me-2"></i>Descargar archivo
          </a>
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-2"></i>Cerrar
          </button>
        </div>
      </div>
    `;
  }
  
  modal.show();
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function getActionText(actionType) {
  const actions = {
    'completed': 'Completó',
    'increment': 'Incrementó',
    'not_applicable': 'Marcó como No Aplica'
  };
  return actions[actionType] || 'Registró acción';
}

function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

// Variables para control de zoom de imagen
let currentZoom = 1;
const ZOOM_STEP = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.5;

function zoomImage(direction) {
  const img = document.getElementById('evidenceImage');
  if (!img) return;
  
  if (direction === 'in') {
    currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
  } else if (direction === 'out') {
    currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
  }
  
  img.style.transform = `scale(${currentZoom})`;
  updateZoomButtons();
}

function resetImageZoom() {
  currentZoom = 1;
  const img = document.getElementById('evidenceImage');
  if (img) {
    img.style.transform = 'scale(1)';
  }
  updateZoomButtons();
}

function toggleImageZoom() {
  const img = document.getElementById('evidenceImage');
  if (!img) return;
  
  if (currentZoom === 1) {
    currentZoom = 2;
  } else {
    currentZoom = 1;
  }
  
  img.style.transform = `scale(${currentZoom})`;
  updateZoomButtons();
}

function updateZoomButtons() {
  const zoomInBtn = document.querySelector('button[onclick="zoomImage(\'in\')"]');
  const zoomOutBtn = document.querySelector('button[onclick="zoomImage(\'out\')"]');
  
  if (zoomInBtn) {
    zoomInBtn.disabled = currentZoom >= MAX_ZOOM;
  }
  if (zoomOutBtn) {
    zoomOutBtn.disabled = currentZoom <= MIN_ZOOM;
  }
}

function showHistoryError(message) {
  const container = document.getElementById('history-container');
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h5>Error al cargar el historial</h5>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="loadHistoryData()">
          <i class="fas fa-refresh me-1"></i>Reintentar
        </button>
      </div>
    `;
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Historial inicializado');
  loadHistoryData();
});

// Hacer funciones globales para compatibilidad
window.loadHistoryData = loadHistoryData;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.viewActivityDetails = viewActivityDetails;
window.viewEvidence = viewEvidence;
window.toggleAdvancedFilters = toggleAdvancedFilters;
window.onDepartmentChange = onDepartmentChange;
