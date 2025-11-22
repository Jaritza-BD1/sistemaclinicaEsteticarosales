const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin, hasAnyRole } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const examCtrl = require('../Controllers/examController');

// Configuración de multer para subir archivos de resultados
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const id = req.params.id || 'temp';
      const dir = path.join(__dirname, '..', 'uploads', 'exams', String(id));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB por archivo
});

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(limiter);

// Rate limit específico para descargas/listado de attachments
const attachmentsLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Demasiadas solicitudes de archivos. Intente más tarde.' });

// Rutas para estadísticas
router.get('/stats', examCtrl.getStats);

// Rutas para obtener exámenes por entidad
router.get('/patient/:patientId', [param('patientId').isInt()], validateRequest, examCtrl.getByPatient);
router.get('/doctor/:doctorId', [param('doctorId').isInt()], validateRequest, examCtrl.getByDoctor);

// Listar attachments (metadatos)
router.get('/:id/attachments', [param('id').isInt()], attachmentsLimiter, validateRequest, examCtrl.listAttachments);

// Descargar attachment (control de acceso en controller)
router.get('/:id/attachments/:filename', [param('id').isInt()], attachmentsLimiter, validateRequest, examCtrl.downloadAttachment);

// Descargar todos los attachments como ZIP
router.get('/:id/attachments/zip', [param('id').isInt()], attachmentsLimiter, validateRequest, examCtrl.downloadAllAsZip);

// Borrar un attachment (solo admin o uploader)
router.delete('/:id/attachments/:filename', [param('id').isInt()], attachmentsLimiter, validateRequest, examCtrl.deleteAttachment);

// Rutas CRUD principales
router.get('/', examCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, examCtrl.get);

router.post(
  '/',
  [
    body('patientId').isInt().withMessage('ID del paciente es requerido'),
    body('doctorId').isInt().withMessage('ID del médico es requerido'),
    body('examType').isString().trim().isLength({ min: 2 }).withMessage('Tipo de examen es requerido'),
    body('examName').isString().trim().isLength({ min: 2 }).withMessage('Nombre del examen es requerido'),
    body('scheduledDate').optional().isISO8601(),
    body('priority').optional().isIn(['baja', 'normal', 'alta', 'urgente']),
    body('generalObservations').optional().isString().trim(),
    body('specificObservations').optional().isString().trim(),
    body('requiresFasting').optional().isBoolean(),
    body('fastingHours').optional().isInt({ min: 0, max: 72 }),
    body('medicationsToSuspend').optional().isString().trim(),
    body('contraindications').optional().isString().trim(),
    body('preparationInstructions').optional().isString().trim(),
    body('cost').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim()
  ],
  validateRequest,
  examCtrl.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('patientId').optional().isInt(),
    body('doctorId').optional().isInt(),
    body('examType').optional().isString().trim().isLength({ min: 2 }),
    body('examName').optional().isString().trim().isLength({ min: 2 }),
    body('scheduledDate').optional().isISO8601(),
    body('priority').optional().isIn(['baja', 'normal', 'alta', 'urgente']),
    body('generalObservations').optional().isString().trim(),
    body('specificObservations').optional().isString().trim(),
    body('requiresFasting').optional().isBoolean(),
    body('fastingHours').optional().isInt({ min: 0, max: 72 }),
    body('medicationsToSuspend').optional().isString().trim(),
    body('contraindications').optional().isString().trim(),
    body('preparationInstructions').optional().isString().trim(),
    body('cost').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim(),
    body('estado').optional().isIn(['solicitado', 'programado', 'en_proceso', 'completado', 'cancelado'])
  ],
  validateRequest,
  examCtrl.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, examCtrl.delete);

// Ruta para actualizar resultados (acepta multipart/form-data con archivos)
router.put(
  '/:id/results',
  [
    param('id').isInt(),
    body('results').isString().trim().withMessage('Resultados son requeridos'),
    body('interpretation').optional().isString().trim(),
    body('resultsDoctorId').optional().isInt(),
    body('attachments').optional().isArray()
  ],
  // Middleware de subida: campo 'attachments' (array) con máximo 10 archivos
  // Permisos: permitir solo Admin(1), Doctor(2) o Nurse(3)
  hasAnyRole(1, 2, 3),
  upload.array('attachments', 10),
  validateRequest,
  examCtrl.updateResults
);

module.exports = router; 