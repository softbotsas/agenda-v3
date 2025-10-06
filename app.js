const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const flash = require('express-flash');
const morgan = require('morgan');
const cors = require('cors');
const MethodOverride = require('method-override');
const compression = require('compression');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

const puerto = 3005;

app.set('trust proxy', 1);

// ✅ Timeouts del servidor Node (evitan "prematurely closed connection")
server.headersTimeout = 65_000;
server.keepAliveTimeout = 65_000;
server.requestTimeout = 0;

const io = socketIo(server, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 25_000,
  pingTimeout: 60_000
});

// Importar sessionStore
const sessionStore = require('./sessionStore');

// Configurar motor de vistas EJS
app.set("view engine", "ejs");
app.set("views", [__dirname + "/views", __dirname + "/agendatce-main/src/views"]);

// Archivos estáticos
app.use(express.static(__dirname + "/agendatce-main/public"));

// Middlewares básicos
app.use(cors());
app.use(MethodOverride('_method'));
app.use(morgan('dev'));
app.use(compression());

// Configuración de límites para archivos grandes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SECRET_KEY || 'tu-clave-secreta-agenda',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }
}));

app.use(flash());

// Middleware para hacer disponible la sesión en las vistas
app.use((req, res, next) => {
  res.locals.session = req.session || {};
  next();
});

// Inyectar 'io' en cada petición
app.use((req, res, next) => {
  req.io = io;
  next();
});

// =================================================================
// RUTAS DE LOGIN SIMULADO
// =================================================================

// Ruta principal - mostrar listado de usuarios
app.get('/', (req, res) => {
  res.render('index', { titulo: 'Usuarios del Sistema - Agenda TCE' });
});

// Ruta de login simulada
app.post('/login-simulado', (req, res) => {
  const { userId, role } = req.body;
  
  // Configurar datos de permisos según el rol
  let datos_permi = {};
  
  switch(role) {
    case 'admin':
      datos_permi = {
        name: 'Alejandro Botero',
        correo: 'alejandro@softbot.com',
        perfil: 0, // 0 = Admin
        userId: userId,
        role: 'admin',
        permissions: ['all']
      };
      break;
    case 'supervisor':
      datos_permi = {
        name: 'Yorman salazar',
        correo: '',
        perfil: 1, // 1 = Supervisor
        userId: userId,
        role: 'supervisor',
        permissions: ['read_history', 'manage_tasks']
      };
      break;
    case 'agent':
      datos_permi = {
        name: 'Bersntein',
        correo: '',
        perfil: 2, // 2 = Agente
        userId: userId,
        role: 'agent',
        permissions: ['manage_own_tasks']
      };
      break;
    default:
      return res.status(400).json({ success: false, message: 'Rol no válido' });
  }
  
  // Configurar sesión
  req.session.userId = userId;
  req.session.datos_permi = datos_permi;
  req.session.isLoggedIn = true;
  req.session.loginTime = new Date();
  
  console.log(`✅ Usuario ${role} inició sesión:`, datos_permi);
  
  // Redirigir a la agenda
  res.redirect('/agendatce');
});

// Ruta de logout mejorada
app.get('/logout', (req, res) => {
  const userInfo = req.session.datos_permi;
  console.log(`👋 Usuario ${userInfo?.name || 'desconocido'} cerró sesión`);
  
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Ruta para ver información de la sesión actual (para debugging)
app.get('/session-info', (req, res) => {
  if (!req.session.userId) {
    return res.json({ 
      success: false, 
      message: 'No hay sesión activa',
      redirect: '/'
    });
  }
  
  res.json({
    success: true,
    session: {
      userId: req.session.userId,
      datos_permi: req.session.datos_permi,
      isLoggedIn: req.session.isLoggedIn,
      loginTime: req.session.loginTime,
      sessionID: req.sessionID
    }
  });
});

// Cargar solo las rutas del módulo de agenda
app.use('/agendatce', require('./agendatce-main/src/router/agenda.router'));
app.use('/confirmaciones-guia', require('./router/confirmacionGuia.routes'));
// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('agenda/error', {
    titulo: 'Página no encontrada',
    mensaje: 'La página que buscas no existe'
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('agenda/error', {
    titulo: 'Error del servidor',
    mensaje: 'Ha ocurrido un error interno del servidor'
  });
});

// =================================================================
// CONFIGURACIÓN DE SOCKET.IO
// =================================================================
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('joinRuta', (rutaPreviaId) => {
    socket.join(rutaPreviaId);
    console.log(`Socket ${socket.id} se unió a la sala de la ruta ${rutaPreviaId}`);
  });

  socket.on('leaveRuta', (rutaPreviaId) => {
    socket.leave(rutaPreviaId);
    console.log(`Socket ${socket.id} salió de la sala de la ruta ${rutaPreviaId}`);
  });

  socket.on("rutaPreviaActualizada", (data) => {
    console.log("Recibido evento de ruta actualizada", data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// =================================================================
// ARRANQUE DEL SERVIDOR
// =================================================================
server.listen(puerto, () => {
  console.log("🚀 Sistema de Agenda TCE iniciado en el puerto " + puerto);
  console.log("📋 Accede a: http://localhost/agendatce");
});

module.exports = app;
