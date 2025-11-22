"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_orden_examen_detalle', {
      atr_id_orden_detalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      atr_id_examen: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_examen', key: 'atr_id_examen' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      atr_id_orden_exa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_orden_examen', key: 'atr_id_orden_exa' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atr_observacion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      atr_id_consulta: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tbl_consulta_medica', key: 'atr_id_consulta' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('tbl_orden_examen_detalle');
  }
};
