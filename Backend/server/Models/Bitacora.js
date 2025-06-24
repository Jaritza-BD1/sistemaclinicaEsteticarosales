// Models/Bitacora.js

const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db'); // Ajusta la ruta si tu configuración de Sequelize está en otro archivo

const Bitacora = sequelize.define('Bitacora', {
  id: {
    field: 'ID_BITACORA',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    field: 'FECHA',
    type: DataTypes.DATE,
    allowNull: false
  },
  idUsuario: {
    field: 'ID_USUARIO',
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idObjeto: {
    field: 'ID_OBJETO',
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accion: {
    field: 'ACCION',
    type: DataTypes.STRING(20),
    allowNull: false
  },
  descripcion: {
    field: 'DESCRIPCION',
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'TBL_MS_BITACORA',
  timestamps: false,
  // Si quieres que Sequelize trate FECHA como createdAt, podrías:
  // timestamps: true,
  // createdAt: 'FECHA',
  // updatedAt: false
});

module.exports = Bitacora;
