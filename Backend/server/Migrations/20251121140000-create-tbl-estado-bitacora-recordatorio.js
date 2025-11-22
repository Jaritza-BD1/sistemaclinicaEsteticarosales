'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_estado_bitacora_recordatorio', {
      atr_id_estado_recordatorio: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      atr_id_recordatorio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_recordatorio',
          key: 'atr_id_recordatorio'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atr_estado_recordatorio: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      atr_contenido: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      atr_cancelacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    });

    // Agregar índices
    await queryInterface.addIndex('tbl_estado_bitacora_recordatorio', ['atr_id_recordatorio']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_estado_bitacora_recordatorio');
  }
};