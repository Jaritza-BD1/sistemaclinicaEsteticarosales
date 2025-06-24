// server.js
require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const crypto        = require('crypto');  // Para generar tokens seguros
const authLimiter    = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { Sequelize, Op } = require('sequelize');
const xss           = require('xss');
const nodemailer    = require('nodemailer');  // Para enviar emails
const adminRoutes   = require('./Routers/adminRoutes');
const User      = require('./Models/User');
const Parametro = require('./Models/Parametro');


const app = express();

// ==================== CORS CONFIGURATION ====================

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:5001','http://localhost:5000', 
];

const corsOptions = {
  origin: (origin, callback) => {
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origen ${origin} no permitido`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Aplica CORS a todas las rutas
app.use(cors(corsOptions));

// Preflight para todas las rutas
app.options('/', cors(corsOptions));

// Logging de cada petición y su origen
app.use((req, res, next) => {
  console.log(`➤ ${req.method} ${req.originalUrl} — Origin: ${req.headers.origin}`);
  next();
});

// ==================== GLOBAL MIDDLEWARES ====================
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  ['body','query','params'].forEach(key => {
    if (req[key]) {
      Object.keys(req[key]).forEach(field => {
        if (typeof req[key][field] === 'string') {
          req[key][field] = xss(req[key][field]);
        }
      });
    }
  });
  next();
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ==================== EMAIL TRANSPORTER ====================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==================== DATABASE CONFIGURATION ====================
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'clinica_rosales',
  process.env.MYSQL_USER     || 'root',
  process.env.MYSQL_PASSWORD || 'CocheTangoSombrillaBrújula42!',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max:10, min:2, acquire:30000, idle:10000 },
    define: { timestamps:true, paranoid:true, underscored:true }
  }
);

// ==================== USER MODEL ====================
app.get('/api/users', async (req, res) => {
  try {
    const usuarios = await User.findAll();
    res.json(usuarios);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});


// ==================== PARAMS MODEL ====================
app.get('/api/params/:key', async (req, res) => {
  try {
    const param = await Parametro.findOne({
      where: { atr_parametro: req.params.key }
    });
    if (!param) return res.status(404).json({ error: 'Parámetro no existe' });
    res.json({ value: param.atr_valor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ==================== AUDIT LOG ====================
const auditLog = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[AUDIT] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

// ==================== JWT CONFIGURATION ====================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no configurado');
  process.exit(1);
}

const generateToken = user =>
  jwt.sign({ 
    id: user.id, 
    username: user.username, 
    role: user.role 
  }, JWT_SECRET, { expiresIn: '8h' });

// ==================== AUTH MIDDLEWARE ====================
const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.scope('withPassword').findByPk(decoded.id);
    
    if (!user) {
      return res.status(403).json({ error: 'Usuario no encontrado' });
    }
    
    // Solo permitir usuarios activos
    if (user.status !== 'Activo') {
      let errorMsg = 'Cuenta no activa';
      if (user.status === 'Bloqueado') errorMsg = 'Cuenta bloqueada';
      if (user.status === 'Pendiente Verificación') errorMsg = 'Verifica tu email primero';
      if (user.status === 'Pendiente Aprobación') errorMsg = 'Cuenta pendiente de aprobación';
      
      return res.status(403).json({ error: errorMsg });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ==================== ADMIN MIDDLEWARE ====================
const isAdmin = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

// ==================== HELPER FUNCTIONS ====================
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verificación de Cuenta',
    html: `
      <h2>¡Gracias por registrarte!</h2>
      <p>Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Después de la verificación, tu cuenta quedará pendiente de aprobación por un administrador.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

const sendApprovalEmail = async (email) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  
  const mailOptions = {
    from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Cuenta Aprobada',
    html: `
      <h2>¡Tu cuenta ha sido aprobada!</h2>
      <p>Ahora puedes iniciar sesión en nuestro sistema:</p>
      <p><a href="${loginUrl}">Iniciar Sesión</a></p>
      <p>Gracias por unirte a Clínica Estética Rosales.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register',
  authLimiter,
  auditLog,
  body('username').trim().notEmpty().isLength({ min:4, max:15 })
    .matches(/^[A-Z0-9]+$/).withMessage('Solo mayúsculas y números'),
  body('name').trim().notEmpty().isLength({ max:100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min:8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Debe contener mayúscula, minúscula, número y carácter especial')
    .not().matches(/\s/).withMessage('No se permiten espacios'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { username, name, email, password } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [
            { username: username.toUpperCase() },
            { email }
          ]
        }
      });
      
      if (existingUser) {
        return res.status(409).json({
          error: existingUser.username === username.toUpperCase() 
            ? 'El usuario ya existe' 
            : 'El email ya está registrado'
        });
      }
      
      // Generar token de verificación
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      
      // Crear usuario
      const user = await User.create({
        username: username.toUpperCase(),
        name,
        email,
        password,
        status: 'Pendiente Verificación',
        verification_token: verificationToken,
        token_expiry: tokenExpiry,
        first_login: true
      });
      
      // Enviar email de verificación
      await sendVerificationEmail(email, verificationToken);
      
      res.status(201).json({ 
        message: 'Usuario registrado. Por favor verifica tu email.' 
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
);

app.get('/api/auth/verify', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido' });
  }
  
  try {
    const user = await User.scope('withToken').findOne({
      where: {
        verification_token: token,
        token_expiry: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    
    // Actualizar estado del usuario
    await user.update({
      status: 'Pendiente Aprobación',
      verification_token: null,
      token_expiry: null
    });
    
    res.json({ 
      message: 'Email verificado. Tu cuenta está pendiente de aprobación.' 
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/auth/login',
  authLimiter,
  auditLog,
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { username, password } = req.body;
      const usernameUpper = username.toUpperCase();
      
      // Obtener el parámetro de intentos máximos
      const maxAttemptsParam = await Param.findByPk('ADMIN_INTENTOS_INVALIDOS');
      const maxAttempts = maxAttemptsParam ? parseInt(maxAttemptsParam.value) || 3 : 3;
      
      // Buscar usuario
      const user = await User.scope('withPassword').findOne({ 
        where: { username: usernameUpper } 
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      // Verificar estado de la cuenta
      if (user.status === 'Pendiente Verificación') {
        return res.status(403).json({ error: 'Verifica tu email primero' });
      }
      
      if (user.status === 'Pendiente Aprobación') {
        return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });
      }
      
      if (user.status === 'Bloqueado') {
        return res.status(403).json({ error: 'Cuenta bloqueada. Contacta al administrador' });
      }
      
      if (user.status !== 'Activo') {
        return res.status(403).json({ error: 'Cuenta inactiva' });
      }
      
      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        // Incrementar intentos fallidos
        const newAttempts = user.failed_attempts + 1;
        await user.update({ failed_attempts: newAttempts });
        
        // Bloquear cuenta si supera el límite
        if (newAttempts >= maxAttempts) {
          await user.update({ status: 'Bloqueado' });
          return res.status(403).json({ 
            error: `Cuenta bloqueada por superar ${maxAttempts} intentos fallidos` 
          });
        }
        
        const remaining = maxAttempts - newAttempts;
        return res.status(401).json({ 
          error: `Credenciales inválidas. Intentos restantes: ${remaining}` 
        });
      }
      
      // Reiniciar intentos fallidos
      if (user.failed_attempts > 0) {
        await user.update({ failed_attempts: 0 });
      }
      
      // Actualizar última conexión
      await user.update({ 
        last_connection: new Date() 
      });
      
      // Generar token JWT
      const token = generateToken(user);
      
      // Manejar primer ingreso
      if (user.first_login) {
        return res.json({ 
          firstLogin: true,
          token,
          message: 'Primer ingreso. Debes cambiar tu contraseña.'
        });
      }
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
);

// ==================== ADMIN ROUTES ====================
// Obtener usuarios pendientes de aprobación
app.get('/api/admin/pending-users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: 'Pendiente Aprobación' },
      attributes: ['id', 'username', 'name', 'email', 'createdAt']
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios pendientes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Aprobar usuario
app.post('/api/admin/approve-user/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (user.status !== 'Pendiente Aprobación') {
      return res.status(400).json({ 
        error: 'El usuario no está pendiente de aprobación' 
      });
    }
    
    // Actualizar estado del usuario
    await user.update({ 
      status: 'Activo',
      approved: true
    });
    
    // Enviar email de activación
    await sendApprovalEmail(user.email);
    
    res.json({ message: 'Usuario aprobado exitosamente' });
  } catch (error) {
    console.error('Error aprobando usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== PASSWORD ROUTES ====================
// Cambio de contraseña (primer ingreso)
app.post('/api/auth/change-password', 
  authenticate,
  body('newPassword').isLength({ min:8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage('Debe contener mayúscula, minúscula, número y carácter especial')
    .not().matches(/\s/).withMessage('No se permiten espacios'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { newPassword } = req.body;
      const user = req.user;
      
      // Actualizar contraseña y marcar primer ingreso como completado
      await user.update({
        password: newPassword,
        first_login: false
      });
      
      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
);

// ==================== PARAMETER ROUTES ====================
app.get('/api/params/:key', async (req, res) => {
  try {
    const param = await Param.findByPk(req.params.key);
    if (!param) {
      return res.status(404).json({ error: 'Parámetro no encontrado' });
    }
    res.json(param);
  } catch (error) {
    console.error('Error obteniendo parámetro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== PROTECTED ROUTES ====================
app.get('/api/auth/profile', authenticate, auditLog, async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status
  });
});

app.get('/api/dashboard', authenticate, auditLog, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Acceso autorizado', 
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    } 
  });
});

app.use('/api/admin', authenticate, isAdmin, adminRoutes);

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint no encontrado' });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const payload = {
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
  
  console.error(`[ERROR] ${error.message}`, {
    status,
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    body: req.body
  });
  
  res.status(status).json(payload);
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión DB establecida');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ });
      console.log('🔃 Modelos sincronizados');
      
        // Crear parámetro de intentos máximos si no existe
        const maxAttemptsParam = await Parametro.findOne({
          where: { atr_parametro: 'ADMIN_INTENTOS_INVALIDOS' }
        });
        if (!maxAttemptsParam) {
          await Parametro.create({
            atr_parametro:  'ADMIN_INTENTOS_INVALIDOS',
            atr_valor:      '3',
            atr_descripcion:'Intentos máximos de login fallidos'
          });
          console.log('🔧 Parámetro ADMIN_INTENTOS_INVALIDOS creado');
        }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => { 
  await sequelize.close(); 
  process.exit(0); 
});

process.on('SIGINT', async () => { 
  await sequelize.close(); 
  process.exit(0); 
});


