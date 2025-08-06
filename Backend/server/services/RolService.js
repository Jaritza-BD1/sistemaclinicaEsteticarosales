// backend/server/services/RolService.js
const { Op } = require('sequelize');
const Rol = require('../Models/Rol');
const logger = require('../utils/logger');
const { generateError, CustomError } = require('../Middlewares/errorHandler');

class RolService {
    /**
     * Obtiene todos los roles con paginación.
     * @param {object} [filters={}] - Filtros opcionales para la búsqueda.
     * @param {number} [filters.page=1] - Número de página (basado en 1).
     * @param {number} [filters.limit=10] - Número de registros por página.
     * @param {string} [filters.search] - Término de búsqueda.
     * @returns {Promise<object>} Objeto con datos y metadatos de paginación.
     */
    static async getAllRoles(filters = {}) {
        try {
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const offset = (page - 1) * limit;

            const whereClause = {};
            if (filters.search) {
                whereClause[Op.or] = [
                    { atr_rol: { [Op.like]: `%${filters.search.toUpperCase()}%` } },
                    { atr_descripcion: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            const { count, rows } = await Rol.findAndCountAll({
                where: whereClause,
                order: [['atr_rol', 'ASC']],
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
            logger.error(`RolService: Error al obtener todos los roles - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener los roles.', error);
        }
    }

    /**
     * Obtiene un rol por su ID.
     * @param {number} id - ID del rol.
     * @returns {Promise<object>} Rol encontrado.
     */
    static async getRolById(id) {
        try {
            const rol = await Rol.findByPk(id);
            if (!rol) {
                throw generateError('NOT_FOUND', 'Rol no encontrado.');
            }
            return rol;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`RolService: Error al obtener rol por ID ${id} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener el rol.', error);
        }
    }

    /**
     * Crea un nuevo rol.
     * @param {object} rolData - Datos del rol a crear.
     * @param {string} createdBy - Usuario que crea el rol.
     * @returns {Promise<object>} Rol creado.
     */
    static async createRol(rolData, createdBy) {
        try {
            // Verificar si ya existe un rol con el mismo nombre
            const existingRol = await Rol.findOne({
                where: { atr_rol: rolData.atr_rol.toUpperCase() }
            });

            if (existingRol) {
                throw generateError('CONFLICT', 'Ya existe un rol con ese nombre.');
            }

            const newRol = await Rol.create({
                ...rolData,
                atr_creado_por: createdBy
            });

            logger.info(`RolService: Rol creado exitosamente - ID: ${newRol.atr_id_rol}, Nombre: ${newRol.atr_rol}`);
            return newRol;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`RolService: Error al crear rol - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al crear el rol.', error);
        }
    }

    /**
     * Actualiza un rol existente.
     * @param {number} id - ID del rol a actualizar.
     * @param {object} rolData - Nuevos datos del rol.
     * @param {string} modifiedBy - Usuario que modifica el rol.
     * @returns {Promise<object>} Rol actualizado.
     */
    static async updateRol(id, rolData, modifiedBy) {
        try {
            const rol = await Rol.findByPk(id);
            if (!rol) {
                throw generateError('NOT_FOUND', 'Rol no encontrado.');
            }

            // Verificar si ya existe otro rol con el mismo nombre
            if (rolData.atr_rol) {
                const existingRol = await Rol.findOne({
                    where: {
                        atr_rol: rolData.atr_rol.toUpperCase(),
                        atr_id_rol: { [Op.ne]: id }
                    }
                });

                if (existingRol) {
                    throw generateError('CONFLICT', 'Ya existe otro rol con ese nombre.');
                }
            }

            await rol.update({
                ...rolData,
                atr_modificado_por: modifiedBy
            });

            logger.info(`RolService: Rol actualizado exitosamente - ID: ${id}, Nombre: ${rol.atr_rol}`);
            return rol;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`RolService: Error al actualizar rol ${id} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al actualizar el rol.', error);
        }
    }

    /**
     * Elimina un rol (desactivación lógica).
     * @param {number} id - ID del rol a eliminar.
     * @param {string} deletedBy - Usuario que elimina el rol.
     * @returns {Promise<object>} Rol eliminado.
     */
    static async deleteRol(id, deletedBy) {
        try {
            const rol = await Rol.findByPk(id);
            if (!rol) {
                throw generateError('NOT_FOUND', 'Rol no encontrado.');
            }

            // Verificar si es el rol de administrador
            if (id === 1) {
                throw generateError('FORBIDDEN', 'No se puede eliminar el rol de administrador.');
            }

            // Para eliminar lógicamente, podríamos usar un campo de estado
            // Como no tenemos atr_activo, simplemente eliminamos el registro
            await rol.destroy();

            logger.info(`RolService: Rol eliminado exitosamente - ID: ${id}, Nombre: ${rol.atr_rol}`);
            return { message: 'Rol eliminado exitosamente' };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`RolService: Error al eliminar rol ${id} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al eliminar el rol.', error);
        }
    }
}

module.exports = RolService;