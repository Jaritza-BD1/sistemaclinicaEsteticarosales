module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_orden_examen", "atr_id_consulta", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tbl_consulta_medica",
        key: "atr_id_consulta"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_orden_examen", "atr_id_consulta");
  }
};