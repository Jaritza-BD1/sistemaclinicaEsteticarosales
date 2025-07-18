const { DataTypes } = require('sequelize'); // Importa DataTypes de sequelize
const sequelize = require('../Config/db'); // Asume que tienes tu instancia de Sequelize en Config/database.js

const Bitacora = sequelize.define('tbl_ms_bitacora', {
    atr_id_bitacora: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'atr_id_bitacora'
    },
    atr_fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'atr_fecha'
    },
    atr_id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'atr_id_usuario'
    },
    atr_id_objetos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'atr_id_objetos'
    },
    atr_accion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'atr_accion'
    },
    atr_descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'atr_descripcion'
    },
    ip_origen: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_origen'
    }
}, {
    tableName: 'tbl_ms_bitacora',
    timestamps: false
});

module.exports = Bitacora;
