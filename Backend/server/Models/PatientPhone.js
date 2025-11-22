const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientPhone = sequelize.define('tbl_telefono_paciente', {
  atr_id_telefono: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_telefono'
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
  atr_telefono: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: 'atr_telefono',
    validate: {
      notEmpty: { msg: 'El teléfono es requerido' },
      is: {
        args: /^[0-9+()\-\s]{6,30}$/,
        msg: 'Formato de teléfono inválido'
      }
    }
  }
}, { tableName: 'tbl_telefono_paciente', timestamps: false });

module.exports = PatientPhone;