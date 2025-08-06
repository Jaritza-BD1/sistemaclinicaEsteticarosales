// backend/server/controllers/ProductController.js
const ProductService = require('../services/ProductService');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

class ProductController {
    /**
     * Crea un nuevo producto.
     * POST /api/products
     */
    static async createProduct(req, res) {
        const { 
            nombre, 
            descripcion, 
            codigoBarra, 
            categoria, 
            unidadMedida, 
            proveedor,
            precio, 
            stock, 
            stockMinimo, 
            stockMaximo 
        } = req.body;
        
        const creadoPor = req.user ? req.user.atr_id_usuario : null; 

        try {
            const product = await ProductService.createProduct({ 
                nombre, 
                descripcion, 
                codigoBarra, 
                categoria, 
                unidadMedida, 
                proveedor,
                precio, 
                stock, 
                stockMinimo, 
                stockMaximo, 
                creadoPor 
            });
            
            return ResponseService.success(res, 'Producto creado exitosamente', product, 201);
        } catch (error) {
            logger.error(`Error en ProductController.createProduct: ${error.message}`);
            if (error.message.includes('Ya existe un producto con ese nombre')) {
                return ResponseService.conflict(res, error.message);
            }
            return ResponseService.error(res, 'Error al crear el producto', error.message);
        }
    }

    /**
     * Obtiene todos los productos.
     * GET /api/products
     */
    static async getAllProducts(req, res) {
        try {
            const products = await ProductService.getAllProducts();
            return ResponseService.success(res, 'Productos obtenidos exitosamente', products);
        } catch (error) {
            logger.error(`Error en ProductController.getAllProducts: ${error.message}`);
            return ResponseService.error(res, 'Error al obtener los productos', error.message);
        }
    }

    /**
     * Obtiene un producto por su ID.
     * GET /api/products/:id
     */
    static async getProductById(req, res) {
        const { id } = req.params;
        try {
            const product = await ProductService.getProductById(id);
            return ResponseService.success(res, 'Producto obtenido exitosamente', product);
        } catch (error) {
            logger.error(`Error en ProductController.getProductById (${id}): ${error.message}`);
            if (error.message.includes('Producto no encontrado')) {
                return ResponseService.notFound(res, error.message);
            }
            return ResponseService.error(res, 'Error al obtener el producto', error.message);
        }
    }

    /**
     * Actualiza un producto existente.
     * PUT /api/products/:id
     */
    static async updateProduct(req, res) {
        const { id } = req.params;
        const updateData = req.body;
        updateData.modificadoPor = req.user ? req.user.atr_id_usuario : null;

        try {
            const updatedProduct = await ProductService.updateProduct(id, updateData);
            return ResponseService.success(res, 'Producto actualizado exitosamente', updatedProduct);
        } catch (error) {
            logger.error(`Error en ProductController.updateProduct (${id}): ${error.message}`);
            if (error.message.includes('Producto no encontrado')) {
                return ResponseService.notFound(res, error.message);
            }
            if (error.message.includes('Ya existe otro producto con ese nombre')) {
                return ResponseService.conflict(res, error.message);
            }
            return ResponseService.error(res, 'Error al actualizar el producto', error.message);
        }
    }

    /**
     * Elimina (desactiva) un producto.
     * DELETE /api/products/:id
     */
    static async deleteProduct(req, res) {
        const { id } = req.params;
        const eliminadoPor = req.user ? req.user.atr_id_usuario : null;

        try {
            await ProductService.deleteProduct(id, eliminadoPor);
            return ResponseService.success(res, 'Producto eliminado exitosamente');
        } catch (error) {
            logger.error(`Error en ProductController.deleteProduct (${id}): ${error.message}`);
            if (error.message.includes('Producto no encontrado')) {
                return ResponseService.notFound(res, error.message);
            }
            return ResponseService.error(res, 'Error al eliminar el producto', error.message);
        }
    }

    /**
     * Obtiene estadísticas de productos.
     * GET /api/products/stats
     */
    static async getProductStats(req, res) {
        try {
            const stats = await ProductService.getProductStats();
            return ResponseService.success(res, 'Estadísticas obtenidas exitosamente', stats);
        } catch (error) {
            logger.error(`Error en ProductController.getProductStats: ${error.message}`);
            return ResponseService.error(res, 'Error al obtener estadísticas', error.message);
        }
    }

    /**
     * Obtiene productos por categoría.
     * GET /api/products/category/:category
     */
    static async getProductsByCategory(req, res) {
        const { category } = req.params;
        try {
            const products = await ProductService.getProductsByCategory(category);
            return ResponseService.success(res, 'Productos obtenidos exitosamente', products);
        } catch (error) {
            logger.error(`Error en ProductController.getProductsByCategory (${category}): ${error.message}`);
            return ResponseService.error(res, 'Error al obtener productos por categoría', error.message);
        }
    }
}

module.exports = ProductController;