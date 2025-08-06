const express = require('express');
const router = express.Router();
const backupController = require('../Controllers/backupController');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Middleware de autenticación y autorización para todas las rutas
router.use(authenticate);
router.use(isAdmin);

// Probar conexión a la base de datos
router.post('/test-connection', backupController.testConnection);

// Crear backup
router.post('/create', backupController.createBackup);

// Obtener servidores disponibles
router.get('/servers', backupController.getAvailableServers);

// Obtener bases de datos disponibles
router.get('/databases', backupController.getAvailableDatabases);

// Restaurar backup
router.post('/restore', backupController.restoreBackup);

// Obtener historial de backups
router.get('/history', backupController.getBackupHistory);

// Eliminar backup
router.delete('/:backupId', backupController.deleteBackup);

// Descargar backup
router.get('/download/:backupId', backupController.downloadBackup);

module.exports = router; 