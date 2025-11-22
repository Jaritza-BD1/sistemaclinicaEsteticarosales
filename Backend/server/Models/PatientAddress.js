const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientAddress = sequelize.define('tbl_direccion_paciente', {
  atr_id_direccion_p: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_direccion_p'
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_paciente',
    references: {
      model: 'tbl_paciente',
      key: 'atr_id_paciente'
    }
  },
  atr_direccion_completa: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'atr_direccion_completa',
    validate: {
      notEmpty: { msg: 'La dirección es requerida' }
    }
  }
}, { tableName: 'tbl_direccion_paciente', timestamps: false });

module.exports = PatientAddress;