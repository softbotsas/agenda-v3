# 🚀 Setup Inicial - Sistema de Agenda TCE

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **MongoDB** (local o en la nube)
- **Git** (para clonar el repositorio)

## 🛠️ Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/softbotsas/agendatce.git
cd agendatce
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/agenda_tce

# Puerto del servidor
PORT=3000

# Configuración de sesiones
SESSION_SECRET=tu_secreto_super_seguro_aqui

# Configuración de uploads
UPLOAD_PATH=./uploads
```

### 4. Crear Datos Iniciales
Ejecuta el script de seed para crear el usuario administrador:
```bash
node seed.js
```

### 5. Iniciar el Servidor
```bash
npm start
```

### 6. Acceder al Sistema
- Ve a: http://localhost:3000/agenda/login
- **Email**: admin@tce.com
- **Perfil**: Administrador (acceso completo)

## 👤 Usuario Administrador Creado

El script de seed crea automáticamente:

- **👤 Usuario**: Administrador
- **📧 Email**: admin@tce.com
- **🔑 Perfil**: Administrador (perfil_usuario: 1)
- **🏢 Departamento**: Sin departamento
- **🏷️ Etiquetas**: 11 etiquetas básicas predefinidas

## 🎯 Primeros Pasos

1. **Cambiar credenciales**: Ve a Configuración > Empleados y edita el usuario administrador
2. **Crear departamentos**: Configuración > Departamentos
3. **Crear usuarios**: Configuración > Empleados
4. **Definir tareas**: Configuración > Tareas
5. **Asignar tareas**: Configuración > Tareas > Asignar usuarios

## 📊 Estructura de Datos Creada

### Departamentos
- **Sin departamento**: Departamento por defecto

### Etiquetas Básicas
- **Prioridad**: Urgente, Importante, Normal, Baja
- **Área**: Operaciones, Logística, Administración, RRHH
- **Frecuencia**: Diario, Semanal, Mensual

### Usuarios
- **Administrador**: admin@tce.com (acceso completo)

## 🔧 Comandos Útiles

```bash
# Ejecutar seed (crear datos iniciales)
node seed.js

# Iniciar servidor en modo desarrollo
npm start

# Ver logs del servidor
npm start | tee server.log
```

## 🆘 Solución de Problemas

### Error de Conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
mongod --version

# En Windows (si tienes MongoDB como servicio)
net start MongoDB
```

### Puerto en Uso
```bash
# Cambiar puerto en .env
PORT=3001
```

### Permisos de Archivos (Linux/Mac)
```bash
# Dar permisos de escritura a uploads
chmod 755 uploads/
```

## 📞 Soporte

Si tienes problemas con el setup inicial:

1. Verifica que MongoDB esté ejecutándose
2. Revisa que el archivo `.env` esté configurado correctamente
3. Asegúrate de que todas las dependencias estén instaladas
4. Revisa los logs del servidor para errores específicos

---

**¡Listo! Tu Sistema de Agenda TCE está configurado y listo para usar.** 🎉
