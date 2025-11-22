'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar estados iniciales para recordatorios
    await queryInterface.bulkInsert('tbl_estado_bitacora_recordatorio', [
      {
        atr_id_recordatorio: 1, // Este será el primer recordatorio creado
        atr_estado_recordatorio: 'PENDIENTE',
        atr_contenido: 'Estado inicial para recordatorios del sistema',
        atr_cancelacion: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_recordatorio: 1,
        atr_estado_recordatorio: 'ENVIADO',
        atr_contenido: 'Estado para recordatorios enviados',
        atr_cancelacion: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_recordatorio: 1,
        atr_estado_recordatorio: 'ENTREGADO',
        atr_contenido: 'Estado para recordatorios entregados exitosamente',
        atr_cancelacion: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_recordatorio: 1,
        atr_estado_recordatorio: 'REBOTADO',
        atr_contenido: 'Estado para recordatorios que rebotaron',
        atr_cancelacion: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_recordatorio: 1,
        atr_estado_recordatorio: 'ERROR',
        atr_contenido: 'Estado para recordatorios con error en envío',
        atr_cancelacion: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_recordatorio: 1,
        atr_estado_recordatorio: 'CANCELADO',
        atr_contenido: 'Estado para recordatorios cancelados',
        atr_cancelacion: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_recordatorio: 1,
        atr_estado_recordatorio: 'REINTENTO',
        atr_contenido: 'Estado para reintentos automáticos',
        atr_cancelacion: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Eliminar los estados insertados
    await queryInterface.bulkDelete('tbl_estado_bitacora_recordatorio', {
      atr_id_recordatorio: 1,
      atr_estado_recordatorio: {
        [Sequelize.Op.in]: ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'REBOTADO', 'ERROR', 'CANCELADO', 'REINTENTO']
      }
    }, {});
  }
};