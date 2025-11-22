'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_conf_cita', {
      id_conf_cita: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_reserva_cita',
          key: 'atr_id_cita'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_confirmacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      metodo_confirmacion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      estado_confirmacion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Agregar índices
    await queryInterface.addIndex('tbl_conf_cita', ['id_cita']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_conf_cita');
  }
};