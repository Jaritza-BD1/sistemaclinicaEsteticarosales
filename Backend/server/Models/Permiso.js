// backend/server/models/Permiso.js
const { DataTypes } = require('sequelize');
const sequelize  = require('../Config/db');
const logger = require('../utils/logger');
const Rol = require('./Rol');
const Objeto = require('./Objeto');

const Permiso = sequelize.define('Permiso', {
    atr_id_rol: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Rol,
            key: 'atr_id_rol'
        },
        field: 'atr_id_rol'
    },
    atr_id_objeto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Objeto,
            key: 'atr_id_objetos'
        },
        field: 'atr_id_objeto'
    },
    atr_permiso_insercion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'atr_permiso_insercion'
    },
    atr_permiso_eliminacion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'atr_permiso_eliminacion'
    },
    atr_permiso_actualizacion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'atr_permiso_actualizacion'
    },
    atr_permiso_consultar: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'atr_permiso_consultar'
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
    tableName: 'tbl_permisos',
    timestamps: false,
    id: false
});

// Definir las asociaciones
Permiso.belongsTo(Rol, { foreignKey: 'atr_id_rol' });
Rol.hasMany(Permiso, { foreignKey: 'atr_id_rol' });

Permiso.belongsTo(Objeto, { foreignKey: 'atr_id_objeto', targetKey: 'atr_id_objetos' });
Objeto.hasMany(Permiso, { foreignKey: 'atr_id_objeto', sourceKey: 'atr_id_objetos' });

// Hooks para manejar fechas automáticamente
Permiso.beforeCreate((permiso, options) => {
    if (!permiso.atr_fecha_creacion) {
        permiso.atr_fecha_creacion = new Date().toISOString().split('T')[0];
    }
    if (!permiso.atr_fecha_modificacion) {
        permiso.atr_fecha_modificacion = new Date().toISOString().split('T')[0];
    }
});

Permiso.beforeUpdate((permiso, options) => {
    permiso.atr_fecha_modificacion = new Date().toISOString().split('T')[0];
});

module.exports = Permiso;