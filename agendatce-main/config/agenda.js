// Configuración específica del sistema de agenda
const agendaConfig = {
  // Prefijo para todas las rutas de agenda
  prefix: '/agenda',
  
  // Configuración de usuarios del sistema
  users: {
    // IDs de usuarios que pueden usar el sistema
    allowedUsers: ['laisa', 'alejandra', 'admin'],
    
    // Roles de usuario
    roles: {
      LEADER: 'leader',      // Laisa, Alejandra
      REPRESENTATIVE: 'rep', // Representante/Supervisor
      ADMIN: 'admin'         // Administrador
    }
  },
  
  // Configuración de tareas
  tasks: {
    // Tipos de periodicidad permitidos
    periodicities: ['daily', 'weekly', 'monthly', 'monThu', 'biweekly'],
    
    // Modos de tarea permitidos
    modes: ['binary', 'counter'],
    
    // Configuración de SLA
    sla: {
      defaultWarningMinutes: 30,  // Minutos antes del SLA para mostrar advertencia
      maxBreachMinutes: 1440,     // Máximo de minutos de atraso (24 horas)
    }
  },
  
  // Configuración de notificaciones
  notifications: {
    enabled: true,
    types: ['email', 'whatsapp', 'browser'],
    
    // Horarios de recordatorios
    reminders: {
      daily: '08:00',      // Recordatorio diario
      sla_warning: 30,     // Minutos antes del SLA
      overdue: 60,         // Minutos después del SLA
    }
  },
  
  // Configuración de exportación
  export: {
    formats: ['csv', 'pdf', 'excel'],
    maxRecords: 10000,
    
    // Configuración de CSV
    csv: {
      delimiter: ',',
      encoding: 'utf8',
      includeHeaders: true
    }
  },
  
  // Configuración de cache
  cache: {
    enabled: true,
    ttl: 300, // 5 minutos
    maxSize: 100 // Máximo 100 entradas en cache
  },
  
  // Configuración de archivos
  files: {
    // Directorio para evidencias
    evidencePath: 'public/uploads/evidence',
    
    // Tipos de archivo permitidos
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    
    // Tamaño máximo de archivo (en bytes)
    maxSize: 10 * 1024 * 1024, // 10MB
    
    // Configuración de compresión
    compression: {
      enabled: true,
      quality: 80
    }
  },
  
  // Configuración de KPIs
  kpis: {
    // Métricas principales
    primary: ['completion_rate', 'late_rate', 'total_tasks', 'total_increments'],
    
    // Configuración de alertas
    alerts: {
      lowCompletionRate: 60,    // % mínimo de cumplimiento
      highLateRate: 40,         // % máximo de atrasos
      criticalLateRate: 60      // % crítico de atrasos
    }
  },
  
  // Configuración de desarrollo
  development: {
    mockData: false,
    debugMode: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
};

module.exports = agendaConfig;



