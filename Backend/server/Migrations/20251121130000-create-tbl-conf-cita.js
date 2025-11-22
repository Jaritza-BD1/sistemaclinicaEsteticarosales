'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_conf_cita', {
      atr_id_conf_cita: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      atr_id_cita: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_reserva_cita',
          key: 'atr_id_cita'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atr_fecha_hora_confirmacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      atr_medio: {
        type: Sequelize.ENUM('llamada', 'WhatsApp', 'email', 'otro'),
        allowNull: false
      },
      atr_confirmado_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbl_ms_usuario',
          key: 'atr_id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      atr_notas: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Agregar índices
    await queryInterface.addIndex('tbl_conf_cita', ['atr_id_cita']);
    await queryInterface.addIndex('tbl_conf_cita', ['atr_confirmado_por']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_conf_cita');
  }
};