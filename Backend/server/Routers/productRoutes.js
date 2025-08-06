// backend/server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const productController = require('../Controllers/ProductController');

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(limiter);

// Rutas para estadísticas
router.get('/stats', productController.getProductStats);

// Rutas para obtener productos por categoría
router.get('/category/:category', [param('category').isString().trim()], validateRequest, productController.getProductsByCategory);

// Rutas CRUD principales
router.get('/', productController.getAllProducts);
router.get('/:id', [param('id').isInt()], validateRequest, productController.getProductById);

router.post(
  '/',
  [
    body('nombre').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Nombre del producto es requerido (2-100 caracteres)'),
    body('descripcion').optional().isString().trim(),
    body('codigoBarra').optional().isString().trim().isLength({ max: 50 }),
    body('categoria').optional().isString().trim().isLength({ max: 50 }),
    body('unidadMedida').optional().isString().trim().isLength({ max: 30 }),
    body('proveedor').optional().isString().trim().isLength({ max: 100 }),
    body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
    body('stock').isInt({ min: 0 }).withMessage('Stock debe ser un número entero positivo'),
    body('stockMinimo').optional().isInt({ min: 0 }),
    body('stockMaximo').optional().isInt({ min: 0 })
  ],
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('nombre').optional().isString().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().isString().trim(),
    body('codigoBarra').optional().isString().trim().isLength({ max: 50 }),
    body('categoria').optional().isString().trim().isLength({ max: 50 }),
    body('unidadMedida').optional().isString().trim().isLength({ max: 30 }),
    body('proveedor').optional().isString().trim().isLength({ max: 100 }),
    body('precio').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('stockMinimo').optional().isInt({ min: 0 }),
    body('stockMaximo').optional().isInt({ min: 0 }),
    body('activo').optional().isBoolean()
  ],
  validateRequest,
  productController.updateProduct
);

router.delete('/:id', [param('id').isInt()], validateRequest, productController.deleteProduct);

module.exports = router;