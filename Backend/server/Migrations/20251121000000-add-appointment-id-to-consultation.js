module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_consulta_medica', 'atr_id_cita', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tbl_reserva_cita',
        key: 'atr_id_cita'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_consulta_medica', 'atr_id_cita');
  }
};