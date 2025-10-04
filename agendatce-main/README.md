# Sistema de Agenda TCE - Checklist para Líderes

Sistema de checklist y seguimiento de tareas desarrollado con Node.js, Express, Mongoose y EJS

## 🎯 Objetivo del Sistema

Este sistema permite a Laisa y Alejandra:
- **Marcar tareas** (binarias ✅ o contables 🔢)
- **Subir evidencias** (boletas, capturas, etc.)
- **Registrar comentarios** sobre las tareas realizadas
- **Seguir SLAs** (tiempos límite para completar tareas)
- **Generar KPIs** de cumplimiento y productividad

## 🚀 Características Principales

### Vista Líder (Hoy)
- **Tarjetas de tareas** con botones "Hecho" o "+1"
- **Semáforo SLA** (🟢 Verde, 🟡 Amarillo, 🔴 Rojo)
- **Evidencias obligatorias/opcionales** según la tarea
- **Comentarios** en cada acción
- **Progreso visual** para tareas contables

### Vista Representante (Dashboard)
- **% de cumplimiento** diario/semanal
- **Metas vs. real** por período
- **Tareas atrasadas** por SLA
- **Filtros** por persona y fecha
- **Exportación** a CSV/PDF
- **KPIs del equipo** (Laisa y Alejandra)

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: MongoDB con Mongoose
- **Vistas**: EJS con componentes parciales
- **Sesiones**: Express-session con MongoDB Store
- **UI**: Bootstrap 5 + Font Awesome
- **API**: RESTful endpoints

## 📁 Estructura del Proyecto

```
src/
├── models/agenda/                    # Esquemas de MongoDB
│   ├── agenda.TaskDefinition.js     # Definiciones de tareas
│   ├── agenda.TaskAssignment.js     # Asignaciones a usuarios
│   ├── agenda.TaskLog.js           # Registros de actividades
│   └── agenda.User.js              # Usuarios del sistema
├── controllers/agenda/              # Controladores de agenda
│   ├── agenda.configController.js
│   ├── agenda.dashboardController.js
│   ├── agenda.taskController.js
│   └── agenda.taskManagementController.js
├── services/agenda/                 # Servicios (KPIs, importación)
│   ├── agenda.importService.js
│   ├── agenda.kpiService.js
│   └── agenda.taskService.js
├── router/
│   └── agenda.router.js             # Rutas de la agenda
└── views/agenda/                    # Vistas EJS
    └── agenda.index.ejs             # Vista principal

views/
├── templantes/                      # Componentes EJS reutilizables
└── auth/                           # Vistas de autenticación
```

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [tu-repositorio]
   cd [nombre-del-proyecto]
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar MongoDB**
   - Asegúrate de tener MongoDB ejecutándose
   - Configura la URL en el archivo `.env`

5. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

6. **Acceder al sistema**
   - URL: `http://localhost:3000/agenda/`

## 📋 Variables de Entorno

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agenda_tce
SECRET_KEY=tu-clave-secreta-aqui
NODE_ENV=development
```

## 🎯 Funcionalidades del Sistema

### Gestión de Tareas
- **Crear tareas** con título, descripción, periodicidad
- **Modos**: Binaria (Hecho/No hecho) o Contable (Contador)
- **Periodicidad**: Diaria, semanal, mensual, lunes-jueves, quincenal
- **SLAs**: Hora límite para completar tareas
- **Evidencias**: Requerir o no archivos/capturas
- **Etiquetas**: Categorización (RRHH, Comunicación, Rutas, etc.)

### Asignación de Tareas
- **Generales**: Cualquier empleado puede realizarlas
- **Específicas**: Asignadas a Laisa y/o Alejandra
- **Flexibilidad**: Cambiar asignaciones dinámicamente

### Seguimiento y KPIs
- **Cumplimiento**: % de tareas completadas vs. total
- **Puntualidad**: Tareas completadas dentro del SLA
- **Productividad**: Número de acciones por día/semana
- **Tendencias**: Comparación de rendimiento entre períodos

### Reportes y Exportación
- **Dashboard en tiempo real** con métricas clave
- **Filtros por fecha** y usuario
- **Exportación CSV/PDF** de reportes
- **Historial completo** de actividades

## 🔧 Desarrollo

El proyecto sigue una arquitectura modular con prefijos consistentes:

- **Models**: `agenda.ModelName.js` - Esquemas de MongoDB
- **Controllers**: `agenda.controllerName.js` - Lógica de negocio
- **Services**: `agenda.serviceName.js` - Cálculos y procesamiento
- **Router**: `agenda.router.js` - API RESTful
- **Views**: `agenda.viewName.ejs` - Interfaz EJS

## 📊 Modelos de Datos

### TaskDefinition
```javascript
{
  title: String,           // "Revisar que todos los choferes estén en ruta"
  description: String,     // Descripción detallada
  mode: String,           // "binary" | "counter"
  periodicity: String,    // "daily" | "weekly" | "monThu" | etc.
  target_per_period: Number, // Meta para tareas contables
  sla_time: String,       // "09:00" (hora límite)
  requires_evidence: Boolean,
  tags: [String]          // ["rutas", "comunicacion"]
}
```

### TaskAssignment
```javascript
{
  task_definition: ObjectId, // Referencia a TaskDefinition
  user: ObjectId,           // Usuario asignado
  activo: Boolean,          // Si está activa la asignación
  start_date: Date,         // Fecha de inicio
  end_date: Date           // Fecha de fin (opcional)
}
```

### TaskLog
```javascript
{
  task_assignment: ObjectId, // Referencia a TaskAssignment
  user: ObjectId,           // Usuario que registró
  action_type: String,      // "completed" | "increment"
  value: Number,            // Valor registrado
  comment: String,          // Comentario del usuario
  evidence_files: [String], // Archivos adjuntos
  log_date: Date           // Fecha y hora del registro
}
```

## 🎯 Usuarios del Sistema

- **Laisa Rodriguez**: Líder de operaciones
- **Alejandra Martinez**: Coordinadora de equipos

## 📝 Estado Actual del Proyecto (Diciembre 2024)

### ✅ **SISTEMA FUNCIONAL Y ESTABLE**
- **✅ Sistema de autenticación** completo y funcional
- **✅ Login de usuarios** con selección de usuarios disponibles
- **✅ Dashboard principal** con métricas en tiempo real
- **✅ Gestión de tareas** (crear, editar, eliminar, completar)
- **✅ Sistema de asignaciones** (generales y específicas)
- **✅ Logging de actividades** (completar, incrementar, comentarios)
- **✅ Historial completo** de actividades con filtros
- **✅ Actividad reciente** en dashboard
- **✅ Tareas del día** con filtrado por usuario
- **✅ Tareas atrasadas** con gestión de SLAs
- **✅ Sistema "No Aplica"** para tareas no realizables
- **✅ Completado retroactivo** de tareas atrasadas
- **✅ Subida de evidencias** con archivos adjuntos
- **✅ Sistema de etiquetas** con categorías
- **✅ Gestión de usuarios** completa
- **✅ Base de datos** MongoDB con datos reales
- **✅ APIs RESTful** completamente funcionales

### 🔧 **Correcciones Recientes Aplicadas**
- **✅ Problemas de login** resueltos (campos undefined)
- **✅ Mapeo de usuarios** corregido (name vs nombre)
- **✅ "Usuario eliminado"** en historial solucionado
- **✅ Actividad reciente** con nombres correctos
- **✅ Headers de usuario** mostrando nombres reales
- **✅ Compatibilidad** entre frontend y backend

### 🚀 **Funcionalidades Operativas**
1. **Login seguro** con selección de usuarios
2. **Dashboard interactivo** con KPIs en tiempo real
3. **Gestión completa de tareas** (CRUD)
4. **Seguimiento de SLAs** con colores indicativos
5. **Evidencias y comentarios** en cada acción
6. **Reportes y filtros** por fecha/usuario
7. **Historial detallado** de todas las actividades
8. **Sistema de notificaciones** visuales

### 📋 **Próximas Mejoras**
1. **Gráficos avanzados** en dashboard
2. **Exportación PDF/Excel** de reportes
3. **Notificaciones por email** de SLAs
4. **Métricas de productividad** avanzadas
5. **API de integración** con sistemas externos

## 📚 Documentación Adicional

### **📋 [PROGRESO_AGENDA.md](PROGRESO_AGENDA.md)**
Documentación completa del progreso realizado, funcionalidades implementadas, problemas resueltos y tareas pendientes.

### **🛠️ [GUIA_TECNICA.md](GUIA_TECNICA.md)**
Guía técnica detallada con configuración del entorno, modelos de datos, APIs disponibles, debugging y solución de problemas.

### **📚 [DOCUMENTACION_TECNICA_AGENDA.md](DOCUMENTACION_TECNICA_AGENDA.md)**
Documentación técnica completa del sistema estable actual, incluyendo arquitectura, flujos de autenticación, servicios, APIs, problemas conocidos y mejores prácticas.

### **🚨 [PROBLEMAS_RESUELTOS_Y_SOLUCIONES.md](PROBLEMAS_RESUELTOS_Y_SOLUCIONES.md)**
Documentación detallada de todos los problemas críticos que se resolvieron, sus causas raíz, soluciones aplicadas y mejores prácticas para prevenir su recurrencia.

### **⚡ [GUIA_RAPIDA_DESARROLLADOR.md](GUIA_RAPIDA_DESARROLLADOR.md)**
Guía rápida para desarrolladores con comandos esenciales, checklist de desarrollo, patrones de código y soluciones a problemas comunes.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Add NuevaFuncionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request


## 👨‍💻 Autor

**Alejandro Botero**
- Empresa: SoftBot
- GitHub: [@softbotsas](https://github.com/softbotsas)

---

**⚠️ RECORDATORIO: Este es un Sistema de Agenda/Checklist, NO un sistema de nómina.**

**📅 Última actualización**: Septiembre 2025
