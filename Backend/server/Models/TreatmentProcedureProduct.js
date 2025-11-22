const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const TreatmentProcedureProduct = sequelize.define('TPP', {
  atr_procedimiento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_procedimiento_id'
  },
  atr_product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_product_id'
  },
  atr_cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'atr_cantidad'
  },
  atr_unidad: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'atr_unidad'
  }
}, {
  tableName: 'tbl_tratamiento_procedimiento_producto',
  timestamps: false
});

module.exports = TreatmentProcedureProduct;
