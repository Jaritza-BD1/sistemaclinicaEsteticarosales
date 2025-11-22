"use strict";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_horario_medico', {
      atr_id_horario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      atr_id_medico: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tbl_medico', key: 'atr_id_medico' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atr_dia: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      atr_hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      atr_hora_fin: {
        type: Sequelize.TIME,
        allowNull: false
      },
      atr_creado_por: { type: Sequelize.STRING(15), allowNull: true },
      atr_fecha_creacion: { type: Sequelize.DATE, allowNull: true },
      atr_estado: { type: Sequelize.ENUM('ACTIVO','INACTIVO'), allowNull: false, defaultValue: 'ACTIVO' }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_horario_medico');
  }
};
