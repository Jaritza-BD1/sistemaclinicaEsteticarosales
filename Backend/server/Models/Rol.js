// backend/server/models/Rol.js
const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/db');
const logger = require('../utils/logger');

const Rol = sequelize.define('Rol', {
    atr_id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'atr_id_rol'
    },
    atr_rol: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: 'atr_rol',
        set(value) {
            if (value) {
                this.setDataValue('atr_rol', value.toUpperCase());
            }
        }
    },
    atr_descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'atr_descripcion'
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
    },
    atr_id_bitacora: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'atr_id_bitacora'
    }
}, {
    tableName: 'tbl_ms_roles',
    timestamps: false
});

// Hooks para manejar fechas automáticamente
Rol.beforeCreate((rol, options) => {
    if (!rol.atr_fecha_creacion) {
        rol.atr_fecha_creacion = new Date().toISOString().split('T')[0];
    }
    if (!rol.atr_fecha_modificacion) {
        rol.atr_fecha_modificacion = new Date().toISOString().split('T')[0];
    }
});

Rol.beforeUpdate((rol, options) => {
    rol.atr_fecha_modificacion = new Date().toISOString().split('T')[0];
});

module.exports = Rol;