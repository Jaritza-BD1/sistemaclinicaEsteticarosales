"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_orden_examen', {
      atr_id_orden_exa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      atr_id_paciente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_paciente', key: 'atr_id_paciente' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      atr_id_medico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_medico', key: 'atr_id_medico' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      atr_fecha_solicitud: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      atr_resultados_disponibles: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tbl_orden_examen');
  }
};
