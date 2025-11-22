'use strict';

const { APPOINTMENT_STATUS } = require('../Config/appointmentStatus');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar estados de cita
    const estados = [
      {
        atr_id_estado: 1,
        atr_nombre_estado: APPOINTMENT_STATUS.PROGRAMADA,
        atr_descripcion: 'Cita programada pero no confirmada aún',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_estado: 2,
        atr_nombre_estado: APPOINTMENT_STATUS.CONFIRMADA,
        atr_descripcion: 'Cita confirmada por el paciente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_estado: 3,
        atr_nombre_estado: APPOINTMENT_STATUS.EN_CONSULTA,
        atr_descripcion: 'Paciente está siendo atendido',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_estado: 4,
        atr_nombre_estado: APPOINTMENT_STATUS.PENDIENTE_PAGO,
        atr_descripcion: 'Consulta terminada, pendiente de pago',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_estado: 5,
        atr_nombre_estado: APPOINTMENT_STATUS.FINALIZADA,
        atr_descripcion: 'Cita completada exitosamente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_estado: 6,
        atr_nombre_estado: APPOINTMENT_STATUS.CANCELADA,
        atr_descripcion: 'Cita cancelada',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        atr_id_estado: 7,
        atr_nombre_estado: APPOINTMENT_STATUS.NO_ASISTIO,
        atr_descripcion: 'Paciente no asistió a la cita',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Verificar si ya existen registros
    const existingEstados = await queryInterface.sequelize.query(
      'SELECT atr_id_estado FROM tbl_estado_cita LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingEstados.length === 0) {
      await queryInterface.bulkInsert('tbl_estado_cita', estados);
      console.log('✅ Estados de cita insertados correctamente');
    } else {
      console.log('⚠️  Estados de cita ya existen, omitiendo inserción');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tbl_estado_cita', null, {});
    console.log('✅ Estados de cita eliminados');
  }
};