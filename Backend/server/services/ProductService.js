// backend/server/services/ProductService.js
const Producto = require('../Models/Producto');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ProductService {
    /**
     * Crea un nuevo producto.
     * @param {object} productData - Datos del producto a crear.
     * @returns {Promise<Producto>} El producto creado.
     * @throws {Error} Si el producto ya existe o hay un error de base de datos.
     */
    static async createProduct(productData) {
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
            stockMaximo, 
            creadoPor 
        } = productData;

        const existingProduct = await Producto.findOne({ where: { atr_nombre_producto: nombre } });
        if (existingProduct) {
            throw new Error('Ya existe un producto con ese nombre.');
        }

        try {
            const product = await Producto.create({
                atr_nombre_producto: nombre,
                atr_descripcion: descripcion,
                atr_codigo_barra: codigoBarra,
                atr_categoria: categoria,
                atr_unidad_medida: unidadMedida,
                atr_proveedor: proveedor,
                atr_precio_venta_unitario: precio,
                atr_stock_actual: stock,
                atr_stock_minimo: stockMinimo || 0,
                atr_stock_maximo: stockMaximo || 1000,
                atr_activo: true,
                atr_creado_por: creadoPor
            });
            logger.info(`Producto creado exitosamente: ${product.atr_nombre_producto}`);
            return product;
        } catch (error) {
            logger.error(`Error al crear producto en ProductService: ${error.message}`);
            throw new Error('No se pudo crear el producto.');
        }
    }

    /**
     * Obtiene todos los productos.
     * @returns {Promise<Array<Producto>>} Lista de todos los productos.
     * @throws {Error} Si hay un error al obtener los productos.
     */
    static async getAllProducts() {
        try {
            const products = await Producto.findAll({
                where: { atr_activo: true },
                order: [['atr_nombre_producto', 'ASC']]
            });
            return products;
        } catch (error) {
            logger.error(`Error al obtener todos los productos en ProductService: ${error.message}`);
            throw new Error('No se pudieron obtener los productos.');
        }
    }

    /**
     * Obtiene un producto por su ID.
     * @param {number} id - ID del producto.
     * @returns {Promise<Producto>} El producto encontrado.
     * @throws {Error} Si el producto no es encontrado.
     */
    static async getProductById(id) {
        try {
            const product = await Producto.findByPk(id);
            if (!product) {
                throw new Error('Producto no encontrado.');
            }
            return product;
        } catch (error) {
            logger.error(`Error al obtener producto por ID ${id} en ProductService: ${error.message}`);
            throw new Error(error.message || 'No se pudo obtener el producto.');
        }
    }

    /**
     * Actualiza un producto existente.
     * @param {number} id - ID del producto a actualizar.
     * @param {object} updateData - Datos a actualizar del producto.
     * @returns {Promise<Producto>} El producto actualizado.
     * @throws {Error} Si el producto no es encontrado o hay un error al actualizar.
     */
    static async updateProduct(id, updateData) {
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
            stockMaximo, 
            activo, 
            modificadoPor 
        } = updateData;

        const product = await Producto.findByPk(id);
        if (!product) {
            throw new Error('Producto no encontrado.');
        }

        // Verificar si el nuevo nombre ya existe en otro producto
        if (nombre && nombre !== product.atr_nombre_producto) {
            const existingProduct = await Producto.findOne({
                where: {
                    atr_nombre_producto: nombre,
                    atr_id_producto: { [Op.ne]: id }
                }
            });
            if (existingProduct) {
                throw new Error('Ya existe otro producto con ese nombre.');
            }
        }

        try {
            const updateFields = {};
            
            if (nombre !== undefined) updateFields.atr_nombre_producto = nombre;
            if (descripcion !== undefined) updateFields.atr_descripcion = descripcion;
            if (codigoBarra !== undefined) updateFields.atr_codigo_barra = codigoBarra;
            if (categoria !== undefined) updateFields.atr_categoria = categoria;
            if (unidadMedida !== undefined) updateFields.atr_unidad_medida = unidadMedida;
            if (proveedor !== undefined) updateFields.atr_proveedor = proveedor;
            if (precio !== undefined) updateFields.atr_precio_venta_unitario = precio;
            if (stock !== undefined) updateFields.atr_stock_actual = stock;
            if (stockMinimo !== undefined) updateFields.atr_stock_minimo = stockMinimo;
            if (stockMaximo !== undefined) updateFields.atr_stock_maximo = stockMaximo;
            if (activo !== undefined) updateFields.atr_activo = activo;
            
            updateFields.atr_modificado_por = modificadoPor;
            updateFields.atr_fecha_actualizacion = new Date();

            await product.update(updateFields);
            logger.info(`Producto actualizado exitosamente: ${product.atr_nombre_producto}`);
            return product;
        } catch (error) {
            logger.error(`Error al actualizar producto en ProductService: ${error.message}`);
            throw new Error('No se pudo actualizar el producto.');
        }
    }

    /**
     * Elimina (desactiva) un producto.
     * @param {number} id - ID del producto a eliminar.
     * @param {number} eliminadoPor - ID del usuario que elimina el producto.
     * @returns {Promise<boolean>} True si se eliminó correctamente.
     * @throws {Error} Si el producto no es encontrado.
     */
    static async deleteProduct(id, eliminadoPor) {
        const product = await Producto.findByPk(id);
        if (!product) {
            throw new Error('Producto no encontrado.');
        }

        try {
            await product.update({
                atr_activo: false,
                atr_modificado_por: eliminadoPor,
                atr_fecha_actualizacion: new Date()
            });
            logger.info(`Producto eliminado exitosamente: ${product.atr_nombre_producto}`);
            return true;
        } catch (error) {
            logger.error(`Error al eliminar producto en ProductService: ${error.message}`);
            throw new Error('No se pudo eliminar el producto.');
        }
    }

    /**
     * Obtiene estadísticas de productos.
     * @returns {Promise<object>} Estadísticas de productos.
     */
    static async getProductStats() {
        try {
            const totalProducts = await Producto.count({ where: { atr_activo: true } });
            const lowStockProducts = await Producto.count({
                where: {
                    atr_activo: true,
                    atr_stock_actual: { [Op.lte]: Producto.sequelize.col('atr_stock_minimo') }
                }
            });
            const outOfStockProducts = await Producto.count({
                where: {
                    atr_activo: true,
                    atr_stock_actual: 0
                }
            });
            const totalValue = await Producto.sum('atr_precio_venta_unitario', {
                where: { atr_activo: true }
            });

            return {
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                totalValue: totalValue || 0
            };
        } catch (error) {
            logger.error(`Error al obtener estadísticas en ProductService: ${error.message}`);
            throw new Error('No se pudieron obtener las estadísticas.');
        }
    }

    /**
     * Obtiene productos por categoría.
     * @param {string} category - Categoría de productos.
     * @returns {Promise<Array<Producto>>} Lista de productos de la categoría.
     */
    static async getProductsByCategory(category) {
        try {
            const products = await Producto.findAll({
                where: {
                    atr_activo: true,
                    atr_categoria: category
                },
                order: [['atr_nombre_producto', 'ASC']]
            });
            return products;
        } catch (error) {
            logger.error(`Error al obtener productos por categoría en ProductService: ${error.message}`);
            throw new Error('No se pudieron obtener los productos por categoría.');
        }
    }
}

module.exports = ProductService;