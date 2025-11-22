"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tbl_genero', [
      { atr_genero: 'Masculino', created_at: new Date(), updated_at: new Date() },
      { atr_genero: 'Femenino', created_at: new Date(), updated_at: new Date() },
      { atr_genero: 'No Binario', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tbl_genero', null, {});
  }
};
