// controllers/agenda/agenda.taskManagementController.js

// Obtener definiciones de tareas
const getTaskDefinitions = async (req, res) => {
    try {
        // Simular datos de tareas
        const tasks = [
            {
                _id: '1',
                title: 'Revisar que todos los choferes estén en ruta',
                description: 'Verificar que todos los conductores estén en sus rutas asignadas',
                mode: 'binary',
                periodicity: 'daily',
                target_per_period: 1,
                sla_time: '09:00',
                requires_evidence: true,
                tags: ['rutas']
            },
            {
                _id: '2',
                title: 'Reportarse en grupos de interacción',
                description: 'Participar en los grupos de comunicación del equipo',
                mode: 'counter',
                periodicity: 'daily',
                target_per_period: 3,
                sla_time: '10:00',
                requires_evidence: false,
                tags: ['comunicacion']
            }
        ];

        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Error getting task definitions:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las tareas' });
    }
};

// Crear nueva definición de tarea
const createTaskDefinition = async (req, res) => {
    try {
        // Simular creación de tarea
        const newTask = {
            _id: Date.now().toString(),
            ...req.body,
            created_at: new Date()
        };

        res.json({ success: true, data: newTask, message: 'Tarea creada exitosamente' });
    } catch (error) {
        console.error('Error creating task definition:', error);
        res.status(500).json({ success: false, message: 'Error al crear la tarea' });
    }
};

// Actualizar definición de tarea
const updateTaskDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Simular actualización de tarea
        const updatedTask = {
            _id: id,
            ...req.body,
            updated_at: new Date()
        };

        res.json({ success: true, data: updatedTask, message: 'Tarea actualizada exitosamente' });
    } catch (error) {
        console.error('Error updating task definition:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la tarea' });
    }
};

// Eliminar definición de tarea
const deleteTaskDefinition = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Simular eliminación de tarea
        res.json({ success: true, message: 'Tarea eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting task definition:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar la tarea' });
    }
};

// Asignar tarea a usuario
const assignTaskToUser = async (req, res) => {
    try {
        // Simular asignación de tarea
        const assignment = {
            _id: Date.now().toString(),
            ...req.body,
            created_at: new Date()
        };

        res.json({ success: true, data: assignment, message: 'Tarea asignada exitosamente' });
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ success: false, message: 'Error al asignar la tarea' });
    }
};

// Obtener asignaciones de tareas
const getTaskAssignments = async (req, res) => {
    try {
        // Simular asignaciones
        const assignments = [
            {
                _id: '1',
                task_definition: '1',
                user: '68cede72d2425a798fd91ace',
                activo: true,
                start_date: new Date()
            }
        ];

        res.json({ success: true, data: assignments });
    } catch (error) {
        console.error('Error getting task assignments:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las asignaciones' });
    }
};

// Obtener etiquetas disponibles
const getAvailableTags = async (req, res) => {
    try {
        const tags = [
            'rutas', 'comunicacion', 'finanzas', 'rrhh', 'operaciones',
            'talacheros', 'callcenter', 'logistica', 'administracion',
            'supervision', 'calidad', 'mantenimiento', 'seguridad',
            'inventario', 'facturacion', 'cobranza', 'ventas', 'marketing',
            'tecnologia', 'recursos_humanos', 'contabilidad', 'legal'
        ];

        res.json({ success: true, data: tags });
    } catch (error) {
        console.error('Error getting tags:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las etiquetas' });
    }
};

module.exports = {
    getTaskDefinitions,
    createTaskDefinition,
    updateTaskDefinition,
    deleteTaskDefinition,
    assignTaskToUser,
    getTaskAssignments,
    getAvailableTags
};