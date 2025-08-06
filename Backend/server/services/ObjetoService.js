// backend/server/services/ObjetoService.js
const { Op } = require('sequelize');
const Objeto = require('../Models/Objeto');
const logger = require('../utils/logger');
const { generateError, CustomError } = require('../Middlewares/errorHandler');

class ObjetoService {
    /**
     * Obtiene todos los objetos con paginación.
     * @param {object} [filters={}] - Filtros opcionales para la búsqueda.
     * @param {number} [filters.page=1] - Número de página (basado en 1).
     * @param {number} [filters.limit=10] - Número de registros por página.
     * @param {string} [filters.search] - Término de búsqueda.
     * @returns {Promise<object>} Objeto con datos y metadatos de paginación.
     */
    static async getAllObjetos(filters = {}) {
        try {
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const offset = (page - 1) * limit;

            const whereClause = {};
            if (filters.search) {
                whereClause[Op.or] = [
                    { atr_objeto: { [Op.like]: `%${filters.search.toUpperCase()}%` } },
                    { atr_descripcion: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            const { count, rows } = await Objeto.findAndCountAll({
                where: whereClause,
                order: [['atr_objeto', 'ASC']],
                limit: limit,
                offset: offset
            });

            const totalPages = Math.ceil(count / limit);

            return {
                data: rows,
                meta: {
                    total: count,
                    page: page,
                    limit: limit,
                    pages: totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            logger.error(`ObjetoService: Error al obtener todos los objetos - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener los objetos.', error);
        }
    }

    /**
     * Obtiene un objeto por su ID.
     * @param {number} id - ID del objeto.
     * @returns {Promise<object>} Objeto encontrado.
     */
    static async getObjetoById(id) {
        try {
            const objeto = await Objeto.findByPk(id);
            if (!objeto) {
                throw generateError('NOT_FOUND', 'Objeto no encontrado.');
            }
            return objeto;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`ObjetoService: Error al obtener objeto por ID ${id} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener el objeto.', error);
        }
    }

    /**
     * Crea un nuevo objeto.
     * @param {object} objetoData - Datos del objeto a crear.
     * @param {string} createdBy - Usuario que crea el objeto.
     * @returns {Promise<object>} Objeto creado.
     */
    static async createObjeto(objetoData, createdBy) {
        try {
            // Verificar si ya existe un objeto con el mismo nombre
            const existingObjeto = await Objeto.findOne({
                where: { atr_objeto: objetoData.atr_objeto.toUpperCase() }
            });

            if (existingObjeto) {
                throw generateError('CONFLICT', 'Ya existe un objeto con ese nombre.');
            }

            const newObjeto = await Objeto.create({
                ...objetoData,
                atr_creado_por: createdBy
            });

            logger.info(`ObjetoService: Objeto creado exitosamente - ID: ${newObjeto.atr_id_objetos}, Nombre: ${newObjeto.atr_objeto}`);
            return newObjeto;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`ObjetoService: Error al crear objeto - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al crear el objeto.', error);
        }
    }

    /**
     * Actualiza un objeto existente.
     * @param {number} id - ID del objeto a actualizar.
     * @param {object} objetoData - Nuevos datos del objeto.
     * @param {string} modifiedBy - Usuario que modifica el objeto.
     * @returns {Promise<object>} Objeto actualizado.
     */
    static async updateObjeto(id, objetoData, modifiedBy) {
        try {
            const objeto = await Objeto.findByPk(id);
            if (!objeto) {
                throw generateError('NOT_FOUND', 'Objeto no encontrado.');
            }

            // Verificar si ya existe otro objeto con el mismo nombre
            if (objetoData.atr_objeto) {
                const existingObjeto = await Objeto.findOne({
                    where: {
                        atr_objeto: objetoData.atr_objeto.toUpperCase(),
                        atr_id_objetos: { [Op.ne]: id }
                    }
                });

                if (existingObjeto) {
                    throw generateError('CONFLICT', 'Ya existe otro objeto con ese nombre.');
                }
            }

            await objeto.update({
                ...objetoData,
                atr_modificado_por: modifiedBy
            });

            logger.info(`ObjetoService: Objeto actualizado exitosamente - ID: ${id}, Nombre: ${objeto.atr_objeto}`);
            return objeto;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`ObjetoService: Error al actualizar objeto ${id} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al actualizar el objeto.', error);
        }
    }

    /**
     * Elimina un objeto.
     * @param {number} id - ID del objeto a eliminar.
     * @param {string} deletedBy - Usuario que elimina el objeto.
     * @returns {Promise<object>} Objeto eliminado.
     */
    static async deleteObjeto(id, deletedBy) {
        try {
            const objeto = await Objeto.findByPk(id);
            if (!objeto) {
                throw generateError('NOT_FOUND', 'Objeto no encontrado.');
            }

            await objeto.destroy();

            logger.info(`ObjetoService: Objeto eliminado exitosamente - ID: ${id}, Nombre: ${objeto.atr_objeto}`);
            return { message: 'Objeto eliminado exitosamente' };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`ObjetoService: Error al eliminar objeto ${id} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al eliminar el objeto.', error);
        }
    }
}

module.exports = ObjetoService;