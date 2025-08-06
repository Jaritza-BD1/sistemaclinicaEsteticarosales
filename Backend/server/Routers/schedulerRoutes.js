const express = require('express');
const router = express.Router();
const schedulerController = require('../Controllers/schedulerController');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Aplicar middleware de autenticación y autorización
router.use(authenticate);
router.use(isAdmin);

// Rutas para jobs automáticos
router.post('/jobs', schedulerController.createJob);
router.get('/jobs', schedulerController.getJobs);
router.get('/jobs/stats', schedulerController.getJobStats);
router.put('/jobs/:jobId', schedulerController.updateJob);
router.delete('/jobs/:jobId', schedulerController.deleteJob);
router.post('/jobs/:jobId/start', schedulerController.startJob);
router.post('/jobs/:jobId/stop', schedulerController.stopJob);
router.post('/jobs/:jobId/execute', schedulerController.executeJob);

module.exports = router; 