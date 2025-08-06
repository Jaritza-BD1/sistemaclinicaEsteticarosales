// backend/server/models/Objeto.js
const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/db');
const logger = require('../utils/logger');

const Objeto = sequelize.define('Objeto', {
    atr_id_objetos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'atr_id_objetos'
    },
    atr_objeto: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'atr_objeto',
        set(value) {
            if (value) {
                this.setDataValue('atr_objeto', value.toUpperCase());
            }
        }
    },
    atr_descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'atr_descripcion'
    },
    atr_tipo_objeto: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'atr_tipo_objeto'
    },
    atr_creado_por: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'atr_creado_por'
    },
    atr_fecha_creacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'atr_fecha_creacion'
    },
    atr_modificado_por: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'atr_modificado_por'
    },
    atr_fecha_modificacion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'atr_fecha_modificacion'
    }
}, {
    tableName: 'tbl_objetos',
    timestamps: false
});

// Hooks para manejar fechas automáticamente
Objeto.beforeCreate((objeto, options) => {
    if (!objeto.atr_fecha_creacion) {
        objeto.atr_fecha_creacion = new Date().toISOString().split('T')[0];
    }
    if (!objeto.atr_fecha_modificacion) {
        objeto.atr_fecha_modificacion = new Date().toISOString().split('T')[0];
    }
});

Objeto.beforeUpdate((objeto, options) => {
    objeto.atr_fecha_modificacion = new Date().toISOString().split('T')[0];
});

module.exports = Objeto;