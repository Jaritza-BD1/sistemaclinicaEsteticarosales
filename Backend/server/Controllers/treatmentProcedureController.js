const { TreatmentProcedure, TreatmentProcedureProduct, Treatment, Doctor, Producto } = require('../Models');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');
const sequelize = require('../Config/db');
const fs = require('fs').promises;
const path = require('path');

// Listar procedimientos por tratamiento
exports.listByTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const procedures = await TreatmentProcedure.findAll({
      where: { atr_id_tratamiento: treatmentId },
      include: [
        { model: Doctor, as: 'Medico', attributes: ['atr_id_medico','atr_nombre','atr_apellido'] },
        { model: TreatmentProcedureProduct, as: 'products', include: [{ model: Producto, as: 'product', attributes: ['atr_id_producto','atr_nombre_producto'] }] }
      ],
      order: [['atr_programado_para','ASC']]
    });

    return ResponseService.success(res, procedures);
  } catch (error) {
    logger.error('Error listando procedimientos:', error);
    return ResponseService.internalError(res, 'Error al obtener procedimientos');
  }
};

// Obtener un procedimiento por id
exports.get = async (req, res) => {
  try {
    const { treatmentId, procId } = req.params;
    const procedure = await TreatmentProcedure.findOne({
      where: { atr_id_procedimiento: procId, atr_id_tratamiento: treatmentId },
      include: [
        { model: Doctor, as: 'Medico', attributes: ['atr_id_medico','atr_nombre','atr_apellido'] },
        { model: TreatmentProcedureProduct, as: 'products', include: [{ model: Producto, as: 'product', attributes: ['atr_id_producto','atr_nombre_producto'] }] }
      ]
    });

    if (!procedure) return ResponseService.notFound(res, 'Procedimiento no encontrado');
    return ResponseService.success(res, procedure);
  } catch (error) {
    logger.error('Error obteniendo procedimiento:', error);
    return ResponseService.internalError(res, 'Error al obtener procedimiento');
  }
};

// Crear procedimiento
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { treatmentId } = req.params;
    const {
      atr_procedimiento_tipo,
      atr_procedimiento_codigo,
      atr_procedimiento_nombre,
      atr_area,
      atr_programado_para,
      atr_id_medico,
      atr_recomendaciones,
      products // array { productId, cantidad, unidad }
    } = req.body;

    // Validaciones mínimas
    const treatment = await Treatment.findByPk(treatmentId);
    if (!treatment) {
      await t.rollback();
      return ResponseService.badRequest(res, 'Tratamiento no encontrado');
    }

    const procedure = await TreatmentProcedure.create({
      atr_id_tratamiento: treatmentId,
      atr_procedimiento_tipo,
      atr_procedimiento_codigo,
      atr_procedimiento_nombre,
      atr_area,
      atr_programado_para,
      atr_id_medico,
      atr_recomendaciones,
      atr_estado: 'PROGRAMADO'
    }, { transaction: t });

    // Registrar productos si vienen
    if (Array.isArray(products) && products.length) {
      for (const p of products) {
        await TreatmentProcedureProduct.create({
          atr_procedimiento_id: procedure.atr_id_procedimiento,
          atr_product_id: p.productId || p.product_id || p.atr_product_id,
          atr_cantidad: p.cantidad || p.qty || 0,
          atr_unidad: p.unidad || p.unit || null
        }, { transaction: t });
      }
    }

    await t.commit();

    const created = await TreatmentProcedure.findByPk(procedure.atr_id_procedimiento, {
      include: [
        { model: Doctor, as: 'Medico', attributes: ['atr_id_medico','atr_nombre','atr_apellido'] },
        { model: TreatmentProcedureProduct, as: 'products', include: [{ model: Producto, as: 'product', attributes: ['atr_id_producto','atr_nombre_producto'] }] }
      ]
    });

    return ResponseService.created(res, created);
  } catch (error) {
    // rollback and cleanup any uploaded files
    try { await t.rollback(); } catch (e) { logger.warn('Rollback falló', e); }
    // delete files if any (created by multer) - check req.files
    try {
      const files = req.files || {};
      const uploadsRoot = path.join(__dirname, '..', 'uploads');
      const toDelete = [];
      Object.values(files).forEach(arr => {
        arr.forEach(f => toDelete.push(path.join(uploadsRoot, f.filename)));
      });
      for (const p of toDelete) {
        try {
          await fs.unlink(p);
          logger.info('Archivo eliminado tras rollback', { file: p, procedureId: procId || null, treatmentId: treatmentId || null });
        } catch (e) {
          logger.warn('No se pudo eliminar archivo tras rollback', { file: p, error: e.message });
        }
      }
    } catch (e) {
      logger.warn('Error limpiando archivos tras fallo en create', e);
    }

    logger.error('Error creando procedimiento:', error);
    return ResponseService.internalError(res, 'Error al crear procedimiento');
  }
};

// Actualizar procedimiento
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { treatmentId, procId } = req.params;
    const updates = req.body;

    const procedure = await TreatmentProcedure.findOne({ where: { atr_id_procedimiento: procId, atr_id_tratamiento: treatmentId } });
    if (!procedure) {
      await t.rollback();
      return ResponseService.notFound(res, 'Procedimiento no encontrado');
    }

    await procedure.update(updates, { transaction: t });

    // Manejo simple de productos: si envían `products` reemplazamos los existentes
    if (Array.isArray(updates.products)) {
      await TreatmentProcedureProduct.destroy({ where: { atr_procedimiento_id: procId }, transaction: t });
      for (const p of updates.products) {
        await TreatmentProcedureProduct.create({
          atr_procedimiento_id: procId,
          atr_product_id: p.productId || p.product_id || p.atr_product_id,
          atr_cantidad: p.cantidad || p.qty || 0,
          atr_unidad: p.unidad || p.unit || null
        }, { transaction: t });
      }
    }

    await t.commit();

    const updated = await TreatmentProcedure.findByPk(procId, {
      include: [
        { model: Doctor, as: 'Medico', attributes: ['atr_id_medico','atr_nombre','atr_apellido'] },
        { model: TreatmentProcedureProduct, as: 'products', include: [{ model: Producto, as: 'product', attributes: ['atr_id_producto','atr_nombre_producto'] }] }
      ]
    });

    return ResponseService.success(res, updated);
  } catch (error) {
    // rollback and attempt to cleanup uploaded files
    try { await t.rollback(); } catch (e) { logger.warn('Rollback falló', e); }
    try {
      const files = req.files || {};
      const uploadsRoot = path.join(__dirname, '..', 'uploads');
      const toDelete = [];
      Object.values(files).forEach(arr => {
        arr.forEach(f => toDelete.push(path.join(uploadsRoot, f.filename)));
      });
      for (const p of toDelete) {
        try { await fs.unlink(p); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      logger.warn('Error limpiando archivos tras fallo en update', e);
    }

    logger.error('Error actualizando procedimiento:', error);
    return ResponseService.internalError(res, 'Error al actualizar procedimiento');
  }
};

// Ejecutar procedimiento (marcar como COMPLETADO y registrar datos)
exports.execute = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { treatmentId, procId } = req.params;
    let {
      ejecutadoEl,
      profesionalId,
      resultado,
      imagen_pre,
      imagen_post,
      productosConsumidos // array { productId, cantidad }
    } = req.body;

    // Si vienen archivos multipart en req.files (subidos por multer), preferirlos
    const files = req.files || {};
    if (files.imagen_pre && files.imagen_pre[0]) {
      imagen_pre = `/uploads/procedures/${files.imagen_pre[0].filename}`;
    }
    if (files.imagen_post && files.imagen_post[0]) {
      imagen_post = `/uploads/procedures/${files.imagen_post[0].filename}`;
    }

    const procedure = await TreatmentProcedure.findOne({ where: { atr_id_procedimiento: procId, atr_id_tratamiento: treatmentId } });
    if (!procedure) {
      await t.rollback();
      return ResponseService.notFound(res, 'Procedimiento no encontrado');
    }

    await procedure.update({
      atr_ejecutado_el: ejecutadoEl || new Date(),
      atr_id_medico: profesionalId || procedure.atr_id_medico,
      atr_resultado: resultado || procedure.atr_resultado,
      atr_imagen_pre: imagen_pre || procedure.atr_imagen_pre,
      atr_imagen_post: imagen_post || procedure.atr_imagen_post,
      atr_estado: 'COMPLETADO'
    }, { transaction: t });

    // Registrar consumo de productos si aplican
    if (Array.isArray(productosConsumidos) && productosConsumidos.length) {
      // Eliminamos registros anteriores y registramos los consumidos
      await TreatmentProcedureProduct.destroy({ where: { atr_procedimiento_id: procId }, transaction: t });
      for (const p of productosConsumidos) {
        await TreatmentProcedureProduct.create({
          atr_procedimiento_id: procId,
          atr_product_id: p.productId || p.product_id || p.atr_product_id,
          atr_cantidad: p.cantidad || p.qty || 0,
          atr_unidad: p.unidad || p.unit || null
        }, { transaction: t });

        // Opcional: decrementar stock en Producto (si se quiere activar)
        if (p.productId && p.cantidad) {
          try {
            const prod = await Producto.findByPk(p.productId);
            if (prod && typeof prod.atr_stock_actual === 'number') {
              await prod.update({ atr_stock_actual: Math.max(0, prod.atr_stock_actual - p.cantidad) }, { transaction: t });
            }
          } catch (e) {
            logger.warn('No fue posible decrementar stock del producto', e);
          }
        }
      }
    }

    await t.commit();

    const executed = await TreatmentProcedure.findByPk(procId, {
      include: [
        { model: Doctor, as: 'Medico', attributes: ['atr_id_medico','atr_nombre','atr_apellido'] },
        { model: TreatmentProcedureProduct, as: 'products', include: [{ model: Producto, as: 'product', attributes: ['atr_id_producto','atr_nombre_producto'] }] }
      ]
    });

    return ResponseService.success(res, executed);
  } catch (error) {
    // rollback and cleanup uploaded files
    try { await t.rollback(); } catch (e) { logger.warn('Rollback falló', e); }
    try {
      const files = req.files || {};
      const uploadsRoot = path.join(__dirname, '..', 'uploads');
      const toDelete = [];
      Object.values(files).forEach(arr => {
        arr.forEach(f => toDelete.push(path.join(uploadsRoot, f.filename)));
      });
      for (const p of toDelete) {
        try { await fs.unlink(p); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      logger.warn('Error limpiando archivos tras fallo en execute', e);
    }

    logger.error('Error ejecutando procedimiento:', error);
    return ResponseService.internalError(res, 'Error al ejecutar procedimiento');
  }
};
