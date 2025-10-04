# 📋 Sistema de Agenda TCE - Documentación Técnica

## 🎯 **Estado Actual del Sistema**
**Versión:** Estable (Diciembre 2024)  
**Última Actualización:** Sistema funcional con login, dashboard, tareas y historial operativos

---

## 🏗️ **Arquitectura del Sistema**

### **Estructura de Archivos (Prefijo `agenda.`)**
```
src/
├── controllers/agenda/
│   ├── agenda.authController.js      # Autenticación y login
│   ├── agenda.configController.js    # Configuración del sistema
│   ├── agenda.dashboardController.js # Dashboard principal
│   ├── agenda.taskController.js      # Controlador de tareas
│   └── agenda.taskManagementController.js # Gestión de tareas
├── models/
│   ├── agenda.User.js               # Modelo de usuarios
│   ├── agenda.TaskDefinition.js     # Definiciones de tareas
│   ├── agenda.TaskAssignment.js     # Asignaciones de tareas
│   ├── agenda.TaskLog.js           # Logs de actividades
│   ├── agenda.Tag.js               # Etiquetas de tareas
│   └── agenda.Department.js        # Departamentos
├── services/agenda/
│   ├── agenda.userService.js       # Lógica de negocio usuarios
│   ├── agenda.taskService.js       # Lógica de negocio tareas
│   ├── agenda.kpiService.js        # Cálculos de KPIs
│   └── agenda.importService.js     # Importación de datos
├── views/agenda/
│   ├── index.ejs                   # Vista principal
│   ├── main.ejs                    # Layout principal
│   ├── login.ejs                   # Vista de login
│   └── sections/                   # Secciones modulares
└── router/
    └── agenda.router.js            # Rutas del sistema
```

---

## 🔐 **Sistema de Autenticación**

### **Flujo de Login**
1. **Carga de usuarios disponibles** (`GET /agenda/auth/available-users`)
   - Servicio: `UserService.getAllUsers()`
   - Retorna: `{ success: true, data: [usuarios] }`
   - Mapeo: `user.nombre` → `user.name` (compatibilidad)

2. **Selección de usuario** (`POST /agenda/auth/login`)
   - Parámetro: `userId` (ObjectId del usuario)
   - Validación: `UserService.getUserById(userId)`
   - Sesión: `req.session.userId = userId`

3. **Autenticación de rutas** (Middleware `authenticateToken`)
   - Verifica: `req.session.userId`
   - Pobla: `req.user` con datos del usuario
   - Redirección: `/agenda/login` si no autenticado

### **Estructura de Usuario**
```javascript
// Modelo en BD (agenda.User)
{
  _id: ObjectId,
  nombre: String,        // Campo principal del nombre
  email: String,         // Email del usuario
  cargo: String,         // Cargo/posición
  perfil_usuario: Number, // 1=Admin, 2=Supervisor, 3=Empleado
  departamento: ObjectId,
  departamento_name: String,
  activo: Boolean,
  color: String,         // Color para UI
  notificaciones: Object
}

// Mapeo para Frontend
{
  _id: ObjectId,
  name: String,          // Alias de 'nombre' para compatibilidad
  nombre: String,        // Campo original
  correo: String,        // Alias de 'email'
  cargo: String,
  perfil_usuario: Number,
  role_name: String      // "Admin", "Supervisor", "Empleado"
}
```

---

## 📊 **Sistema de Tareas**

### **Modelos de Datos**

#### **TaskDefinition** (Definición de Tareas)
```javascript
{
  _id: ObjectId,
  title: String,                    // Título de la tarea
  description: String,              // Descripción detallada
  mode: String,                     // "binary" | "counter"
  periodicity: String,              // "daily" | "weekly" | "monthly" | "monThu" | "biweekly"
  target_per_period: Number,        // Meta para tareas contables
  sla_time: String,                 // Hora límite "HH:MM"
  requires_evidence: Boolean,       // Requiere evidencia
  tags: [String],                   // Etiquetas
  assigned_users: [ObjectId],       // Usuarios asignados (legacy)
  specific_user: ObjectId,          // Usuario específico (nuevo)
  activo: Boolean
}
```

#### **TaskAssignment** (Asignaciones)
```javascript
{
  _id: ObjectId,
  task_definition: ObjectId,        // Referencia a TaskDefinition
  user: ObjectId,                   // Usuario asignado
  activo: Boolean,
  start_date: Date,
  end_date: Date
}
```

#### **TaskLog** (Logs de Actividad)
```javascript
{
  _id: ObjectId,
  task_assignment: ObjectId,        // Referencia a TaskAssignment
  user: ObjectId,                   // Usuario que registró
  action_type: String,              // "completed" | "increment"
  value: Number,                    // Valor (1 para binary, contador para counter)
  comment: String,                  // Comentario
  evidence_files: [String],         // Archivos de evidencia
  log_date: Date                    // Fecha del log
}
```

### **Lógica de Filtrado de Tareas**
```javascript
// Criterios para mostrar tareas al usuario:
1. assigned_users.includes(userId) OR specific_user === userId
2. taskDefinition.activo === true
3. taskAssignment.activo === true (si existe)
4. Verificación de periodicidad (daily, weekly, etc.)
```

---

## 🔧 **Servicios Principales**

### **UserService** (`agenda.userService.js`)

#### **Funciones Principales:**
- `getAllUsers()` - Obtiene todos los usuarios activos
- `getUserById(id)` - Obtiene usuario por ID
- `createUser(userData)` - Crea nuevo usuario
- `updateUser(id, userData)` - Actualiza usuario
- `deleteUser(id)` - Elimina usuario (soft delete)

#### **Mapeo de Datos:**
```javascript
// BD → Frontend
{
  nombre: user.nombre → name: user.nombre,    // Compatibilidad
  email: user.email → correo: user.email,     // Compatibilidad
  // Todos los demás campos se mantienen
}
```

### **TaskService** (`agenda.taskService.js`)

#### **Funciones Principales:**
- `getTodayTasks(userId)` - Tareas del día
- `getOverdueTasks(userId)` - Tareas atrasadas
- `completeTask(assignmentId, userId, data)` - Completar tarea
- `incrementTask(assignmentId, userId, data)` - Incrementar contador
- `getAllHistory(userId)` - Historial completo
- `getRecentActivity(userId)` - Actividad reciente

#### **Filtrado de Tareas:**
```javascript
// Lógica de filtrado
const isAssigned = taskDef.assigned_users.includes(userId);
const isSpecific = taskDef.specific_user === userId;
const isActive = taskDef.activo && (!assignment || assignment.activo);

return (isAssigned || isSpecific) && isActive;
```

---

## 🌐 **APIs y Rutas**

### **Rutas de Autenticación**
```
GET  /agenda/auth/available-users    # Lista usuarios disponibles
POST /agenda/auth/login              # Iniciar sesión
POST /agenda/auth/logout             # Cerrar sesión
GET  /agenda/auth/current-user       # Usuario actual
```

### **Rutas de Tareas**
```
GET  /agenda/api/tasks/today         # Tareas del día
GET  /agenda/api/tasks/overdue       # Tareas atrasadas
POST /agenda/api/tasks/complete      # Completar tarea
POST /agenda/api/tasks/increment     # Incrementar tarea
POST /agenda/api/tasks/not-applicable # Marcar como no aplica
POST /agenda/api/tasks/retroactive   # Completar retroactivamente
```

### **Rutas del Dashboard**
```
GET  /agenda/api/dashboard/stats     # Estadísticas generales
GET  /agenda/api/dashboard/weekly    # Tareas semanales
GET  /agenda/api/dashboard/priority  # Tareas prioritarias
GET  /agenda/api/activity/recent     # Actividad reciente
GET  /agenda/api/history             # Historial completo
```

---

## 🎨 **Frontend y Vistas**

### **Estructura de Vistas**
- **`index.ejs`** - Vista principal con dashboard
- **`main.ejs`** - Layout base con navegación
- **`login.ejs`** - Formulario de login
- **`sections/`** - Componentes modulares

### **JavaScript del Cliente**
```javascript
// Funciones principales en main.ejs
- loadUserInfo()           // Carga información del usuario
- updateUserInfo(user)     // Actualiza UI con datos del usuario
- loadTodayTasks()         // Carga tareas del día
- completeTask(id, data)   // Completa una tarea
- showAddTaskModal()       // Muestra modal de nueva tarea
```

### **Manejo de Datos del Usuario**
```javascript
// Campos esperados en el frontend:
user.name || user.nombre    // Nombre del usuario
user.correo                 // Email
user.cargo                  // Cargo
user.role_name              // Rol legible
user.perfil_usuario         // Nivel numérico
```

---

## ⚠️ **Problemas Conocidos y Soluciones**

### **1. Mapeo de Campos de Usuario**
**Problema:** Inconsistencia entre `user.name` vs `user.nombre`  
**Solución:** Mapear ambos campos en el servicio para compatibilidad

### **2. ObjectId Casting**
**Problema:** `CastError` al usar IDs inválidos  
**Solución:** Validar IDs antes de consultas MongoDB

### **3. Populate de Usuarios**
**Problema:** "Usuario eliminado" en historial  
**Solución:** Usar `model: 'agenda.User'` en populate

### **4. FormData vs JSON**
**Problema:** `req.body` undefined con FormData  
**Solución:** Usar JSON para APIs, FormData solo para uploads

---

## 🚀 **Mejores Prácticas**

### **Backend**
1. **Nomenclatura:** Siempre usar prefijo `agenda.`
2. **Servicios:** Separar lógica de negocio de controladores
3. **Mapeo:** Mantener compatibilidad entre BD y frontend
4. **Validación:** Validar todos los inputs antes de BD
5. **Logs:** Usar logs descriptivos para debugging

### **Frontend**
1. **Campos:** Usar `user.name || user.nombre` para compatibilidad
2. **IDs:** Siempre usar `user._id` para identificadores
3. **Modales:** Cargar datos antes de mostrar
4. **Errores:** Manejar errores gracefully

### **Base de Datos**
1. **Índices:** En campos de búsqueda frecuente
2. **Populate:** Especificar modelo explícitamente
3. **Validación:** Usar esquemas Mongoose
4. **Relaciones:** Mantener referencias consistentes

---

## 📝 **Comandos Útiles**

### **Desarrollo**
```bash
npm start                    # Iniciar servidor
npm run dev                  # Modo desarrollo (si existe)
taskkill /f /im node.exe     # Matar procesos Node.js
```

### **Base de Datos**
```bash
# Scripts disponibles en /scripts
node scripts/check-agenda-data.js    # Verificar datos
node scripts/seed-users.js          # Crear usuarios
node scripts/import-tasks.js        # Importar tareas
```

---

## 🔄 **Flujo de Desarrollo**

### **Para Agregar Nueva Funcionalidad:**
1. Crear modelo en `src/models/agenda.*.js`
2. Crear servicio en `src/services/agenda/agenda.*.js`
3. Crear controlador en `src/controllers/agenda/agenda.*.js`
4. Agregar rutas en `src/router/agenda.router.js`
5. Crear vista en `src/views/agenda/`
6. Actualizar documentación

### **Para Debugging:**
1. Revisar logs del servidor
2. Verificar estructura de datos en BD
3. Comprobar mapeo de campos
4. Validar ObjectIds
5. Revisar populate statements

---

**Última actualización:** Diciembre 2024  
**Versión estable:** Sistema funcional con login, dashboard y gestión de tareas
