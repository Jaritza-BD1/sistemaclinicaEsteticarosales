const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientEmail = sequelize.define('tbl_correo_paciente', {
  atr_id_correo_p: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_correo_p'
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
  atr_correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_correo',
    validate: {
      notEmpty: { msg: 'El correo es requerido' },
      isEmail: { msg: 'Debe ser un correo electrónico válido' }
    }
  }
}, { tableName: 'tbl_correo_paciente', timestamps: false });

module.exports = PatientEmail;