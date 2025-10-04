// Funciones de periodicidad para el sistema de agenda
console.log('🚀 Cargando funciones de periodicidad...');

// Función para actualizar las opciones de frecuencia basadas en la periodicidad
function updateFrequencyOptions() {
    console.log('🔄 updateFrequencyOptions llamada');
    const periodicitySelect = document.getElementById('task_definition_periodicity');
    const frequencySelect = document.getElementById('task_definition_frequency');
    
    if (!periodicitySelect || !frequencySelect) {
        console.log('❌ Elementos no encontrados');
        return;
    }
    
    const periodicity = periodicitySelect.value;
    console.log('📅 Periodicidad seleccionada:', periodicity);
    
    // Limpiar opciones existentes
    frequencySelect.innerHTML = '<option value="">Seleccionar frecuencia...</option>';
    
    if (periodicity === 'weekly') {
        // Opciones para semanal: 1 a 7 veces por semana
        for (let i = 1; i <= 7; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} vez${i > 1 ? 'es' : ''} por semana`;
            frequencySelect.appendChild(option);
        }
        frequencySelect.value = '1'; // Seleccionar por defecto
    } else if (periodicity === 'monthly') {
        // Opciones para mensual: 1 a 31 veces por mes
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} vez${i > 1 ? 'es' : ''} por mes`;
            frequencySelect.appendChild(option);
        }
        frequencySelect.value = '1'; // Seleccionar por defecto
    } else if (periodicity === 'biweekly') {
        // Opciones para quincenal: 1 a 15 veces por quincena
        for (let i = 1; i <= 15; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} vez${i > 1 ? 'es' : ''} por quincena`;
            frequencySelect.appendChild(option);
        }
        frequencySelect.value = '1'; // Seleccionar por defecto
    }
    
    // Actualizar días específicos
    updateDaysOptions();
}

// Función para actualizar las opciones de días específicos
function updateDaysOptions() {
    console.log('📅 updateDaysOptions llamada');
    const periodicity = document.getElementById('task_definition_periodicity').value;
    const frequency = parseInt(document.getElementById('task_definition_frequency').value);
    const specificDaysSection = document.getElementById('specific_days_section');
    const daysContainer = document.getElementById('days_selection_container');
    
    if (!specificDaysSection || !daysContainer) {
        console.log('❌ Elementos de días no encontrados');
        return;
    }
    
    console.log('📊 Periodicidad:', periodicity, 'Frecuencia:', frequency);
    
    // Limpiar contenedor
    daysContainer.innerHTML = '';
    
    if (periodicity === 'weekly' && frequency > 0) {
        console.log('📅 Generando checkboxes para días de la semana');
        specificDaysSection.style.display = 'block';
        
        const daysOfWeek = [
            { value: 'monday', label: 'Lunes' },
            { value: 'tuesday', label: 'Martes' },
            { value: 'wednesday', label: 'Miércoles' },
            { value: 'thursday', label: 'Jueves' },
            { value: 'friday', label: 'Viernes' },
            { value: 'saturday', label: 'Sábado' },
            { value: 'sunday', label: 'Domingo' }
        ];
        
        daysOfWeek.forEach(day => {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" id="day_${day.value}" value="${day.value}">
                <label class="form-check-label" for="day_${day.value}">${day.label}</label>
            `;
            daysContainer.appendChild(div);
        });
        
    } else if (periodicity === 'monthly' && frequency > 0) {
        console.log('📅 Generando checkboxes para días del mes');
        specificDaysSection.style.display = 'block';
        
        // Días del mes (1-31)
        for (let day = 1; day <= 31; day++) {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" id="day_${day}" value="${day}">
                <label class="form-check-label" for="day_${day}">${day}</label>
            `;
            daysContainer.appendChild(div);
        }
        
    } else if (periodicity === 'biweekly' && frequency > 0) {
        console.log('📅 Generando checkboxes para días quincenales');
        specificDaysSection.style.display = 'block';
        
        // Días de la quincena (1-15)
        for (let day = 1; day <= 15; day++) {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" id="day_${day}" value="${day}">
                <label class="form-check-label" for="day_${day}">${day}</label>
            `;
            daysContainer.appendChild(div);
        }
        
    } else {
        console.log('📅 Ocultando sección de días específicos');
        specificDaysSection.style.display = 'none';
    }
}

// Función para validar la selección de días
function validateDaysSelection() {
    const periodicity = document.getElementById('task_definition_periodicity').value;
    const frequency = parseInt(document.getElementById('task_definition_frequency').value);
    const selectedDays = document.querySelectorAll('#days_selection_container input[type="checkbox"]:checked');
    
    if (periodicity === 'weekly' || periodicity === 'monthly' || periodicity === 'biweekly') {
        if (selectedDays.length !== frequency) {
            alert(`Debe seleccionar exactamente ${frequency} día${frequency > 1 ? 's' : ''} para la periodicidad ${periodicity}.`);
            return false;
        }
    }
    
    return true;
}

// Función para obtener los días seleccionados
function getSelectedDays() {
    const selectedDays = [];
    const checkboxes = document.querySelectorAll('#days_selection_container input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedDays.push(checkbox.value);
    });
    
    return selectedDays;
}

// Función para establecer los días seleccionados
function setSelectedDays(days) {
    if (!days || !Array.isArray(days)) return;
    
    const checkboxes = document.querySelectorAll('#days_selection_container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = days.includes(checkbox.value);
    });
}

console.log('✅ Funciones de periodicidad cargadas correctamente');
