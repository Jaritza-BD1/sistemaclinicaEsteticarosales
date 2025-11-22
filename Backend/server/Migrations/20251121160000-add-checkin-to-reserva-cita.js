'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar campo para check-in (hora de llegada real del paciente)
    await queryInterface.addColumn('tbl_reserva_cita', 'atr_fecha_hora_checkin', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha y hora real de llegada del paciente (check-in)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover el campo en caso de rollback
    await queryInterface.removeColumn('tbl_reserva_cita', 'atr_fecha_hora_checkin');
  }
};