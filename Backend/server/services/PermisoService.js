// backend/server/services/PermisoService.js
const { Op } = require('sequelize');
const Permiso = require('../Models/Permiso');
const Rol = require('../Models/Rol');
const Objeto = require('../Models/Objeto');
const logger = require('../utils/logger');
const { generateError, CustomError } = require('../Middlewares/errorHandler');

class PermisoService {
    /**
     * Asigna o actualiza los permisos de un rol para un objeto específico.
     * @param {number} idRol - ID del rol.
     * @param {number} idObjeto - ID del objeto.
     * @param {object} permisoData - Datos de los permisos.
     * @param {string} user - Usuario que realiza la operación.
     * @returns {Promise<object>} Permiso creado o actualizado.
     */
    static async upsertPermiso(idRol, idObjeto, permisoData, user) {
        try {
            // Verificar que el rol y objeto existen
            const [rol, objeto] = await Promise.all([
                Rol.findByPk(idRol),
                Objeto.findByPk(idObjeto)
            ]);

            if (!rol) {
                throw generateError('NOT_FOUND', 'Rol no encontrado.');
            }

            if (!objeto) {
                throw generateError('NOT_FOUND', 'Objeto no encontrado.');
            }

            // Buscar permiso existente
            const existingPermiso = await Permiso.findOne({
                where: {
                    atr_id_rol: idRol,
                    atr_id_objeto: idObjeto
                }
            });

            if (existingPermiso) {
                // Actualizar permiso existente
                await existingPermiso.update({
                    ...permisoData,
                    atr_modificado_por: user
                });
                logger.info(`PermisoService: Permiso actualizado para Rol ${idRol}, Objeto ${idObjeto} por ${user}`);
                return existingPermiso;
            } else {
                // Crear nuevo permiso
                const newPermiso = await Permiso.create({
                    atr_id_rol: idRol,
                    atr_id_objeto: idObjeto,
                    ...permisoData,
                    atr_creado_por: user
                });
                logger.info(`PermisoService: Permiso creado para Rol ${idRol}, Objeto ${idObjeto} por ${user}`);
                return newPermiso;
            }
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`PermisoService: Error al gestionar permiso - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al gestionar el permiso.', error);
        }
    }

    /**
     * Obtiene los permisos de un rol para un objeto específico.
     * @param {number} idRol - ID del rol.
     * @param {number} idObjeto - ID del objeto.
     * @returns {Promise<object>} Permiso encontrado.
     */
    static async getPermisoByRolAndObjeto(idRol, idObjeto) {
        try {
            const permiso = await Permiso.findOne({
                where: {
                    atr_id_rol: idRol,
                    atr_id_objeto: idObjeto
                },
                include: [
                    { model: Rol, as: 'Rol' },
                    { model: Objeto, as: 'Objeto' }
                ]
            });

            if (!permiso) {
                throw generateError('NOT_FOUND', 'Permiso no encontrado.');
            }

            return permiso;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`PermisoService: Error al obtener permiso - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener el permiso.', error);
        }
    }

    /**
     * Obtiene todos los permisos para un rol específico.
     * @param {number} idRol - ID del rol.
     * @returns {Promise<Array>} Lista de permisos.
     */
    static async getPermisosByRol(idRol) {
        try {
            const permisos = await Permiso.findAll({
                where: {
                    atr_id_rol: idRol
                },
                include: [
                    { model: Objeto, as: 'Objeto' }
                ],
                order: [['Objeto', 'atr_objeto', 'ASC']]
            });

            return permisos;
        } catch (error) {
            logger.error(`PermisoService: Error al obtener permisos para rol ${idRol} - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener los permisos.', error);
        }
    }

    /**
     * Obtiene todos los permisos con filtros opcionales.
     * @param {object} [filters={}] - Filtros opcionales.
     * @returns {Promise<Array>} Lista de permisos.
     */
    static async getAllPermisos(filters = {}) {
        try {
            const whereClause = {};
            
            if (filters.idRol) {
                whereClause.atr_id_rol = filters.idRol;
            }
            
            if (filters.idObjeto) {
                whereClause.atr_id_objeto = filters.idObjeto;
            }

            const permisos = await Permiso.findAll({
                where: whereClause,
                include: [
                    { model: Rol, as: 'Rol' },
                    { model: Objeto, as: 'Objeto' }
                ],
                order: [['atr_id_rol', 'ASC'], ['atr_id_objeto', 'ASC']]
            });

            return permisos;
        } catch (error) {
            logger.error(`PermisoService: Error al obtener todos los permisos - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al obtener los permisos.', error);
        }
    }

    /**
     * Desactiva un permiso específico.
     * @param {number} idRol - ID del rol.
     * @param {number} idObjeto - ID del objeto.
     * @param {string} user - Usuario que realiza la operación.
     * @returns {Promise<void>}
     */
    static async deactivatePermiso(idRol, idObjeto, user) {
        try {
            const permiso = await Permiso.findOne({
                where: {
                    atr_id_rol: idRol,
                    atr_id_objeto: idObjeto
                }
            });

            if (!permiso) {
                throw generateError('NOT_FOUND', 'Permiso no encontrado.');
            }

            // Eliminar el permiso físicamente
            await permiso.destroy();
            logger.info(`PermisoService: Permiso eliminado para Rol ${idRol}, Objeto ${idObjeto} por ${user}`);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            logger.error(`PermisoService: Error al desactivar permiso - ${error.message}`);
            throw generateError('INTERNAL_SERVER_ERROR', 'Error al desactivar el permiso.', error);
        }
    }
}

module.exports = PermisoService;