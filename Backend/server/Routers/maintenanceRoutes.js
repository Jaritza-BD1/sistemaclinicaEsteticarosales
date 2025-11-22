const express = require('express');
const router = express.Router();
const maintenanceController = require('../Controllers/maintenanceController');
const { authenticateAdmin, authenticate } = require('../Middlewares/authMiddlewares');

// Apply authentication: require authentication for maintenance endpoints; granular permissions handled in controller
router.use(authenticate);

// Models list used by frontend to populate menus (must be before dynamic ':model' routes)
router.get('/models', maintenanceController.modelsList);

// Metadata for model (attributes) - must come before list route to avoid conflict with ':model'
router.get('/:model/meta', maintenanceController.meta);

// Unique check endpoint used by frontend async validators
router.get('/:model/unique', maintenanceController.unique);

// Permissions for model (returns CRUD booleans for current user)
router.get('/:model/permissions', maintenanceController.getPermissions);

// List / Search with pagination
router.get('/:model', maintenanceController.list);

// Export CSV (example): /api/admin/maintenance/:model/export?format=csv
// Keep explicit routes before the multi-id catch-all
router.get('/:model/export', maintenanceController.export);

// Get single (supports composite keys passed as multiple path segments)
// Example: /api/admin/maintenance/Permiso/1/2
router.get('/:model/:ids(*)', maintenanceController.getById);

// Create
router.post('/:model', maintenanceController.create);

// Update (supports composite keys)
router.put('/:model/:ids(*)', maintenanceController.update);

// Delete (supports composite keys)
router.delete('/:model/:ids(*)', maintenanceController.remove);

// Note: routes that take variable number of id segments use the ':ids(*)' wildcard.

module.exports = router;
