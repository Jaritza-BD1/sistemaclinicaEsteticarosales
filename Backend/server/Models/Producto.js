// backend/server/models/Producto.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db'); // Asegúrate que esta ruta es correcta
const logger = require('../utils/logger'); // Asumiendo que tienes un archivo logger
const User = require('./User'); // <--- ¡Asegúrate que esta ruta es correcta para tu modelo User.js!

const Producto = sequelize.define('Producto', {
    atr_id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'atr_id_producto'
    },
    atr_nombre_producto: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'atr_nombre_producto'
    },
    atr_descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'atr_descripcion'
    },
    atr_codigo_barra: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: 'atr_codigo_barra'
    },
    atr_categoria: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'atr_categoria'
    },
    atr_unidad_medida: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: 'atr_unidad_medida'
    },
    atr_proveedor: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'atr_proveedor'
    },
    atr_precio_venta_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00
        },
        field: 'atr_precio_venta_unitario'
    },
    atr_stock_actual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        },
        field: 'atr_stock_actual'
    },
    atr_stock_minimo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        },
        field: 'atr_stock_minimo'
    },
    atr_stock_maximo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1000,
        validate: {
            min: 0
        },
        field: 'atr_stock_maximo'
    },
    atr_activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'atr_activo'
    },
    atr_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'atr_fecha_creacion'
    },
    atr_fecha_actualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'atr_fecha_actualizacion'
    },
    atr_creado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'atr_creado_por'
    },
    atr_modificado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'atr_modificado_por'
    }
}, {
    tableName: 'tbl_productos',
    timestamps: false,
    createdAt: 'atr_fecha_creacion',
    updatedAt: 'atr_fecha_actualizacion'
});

// Hooks para logging
Producto.afterCreate(async (producto, options) => {
    logger.info(`Producto creado: ID ${producto.atr_id_producto}, Nombre: ${producto.atr_nombre_producto}`);
});

Producto.afterUpdate(async (producto, options) => {
    logger.info(`Producto actualizado: ID ${producto.atr_id_producto}, Nombre: ${producto.atr_nombre_producto}`);
});

Producto.afterDestroy(async (producto, options) => {
    logger.info(`Producto eliminado: ID ${producto.atr_id_producto}, Nombre: ${producto.atr_nombre_producto}`);
});

// *** Definición de Asociaciones ***
// Un producto fue creado por un usuario
Producto.belongsTo(User, {
    foreignKey: 'atr_creado_por',
    targetKey: 'atr_id_usuario', // La clave primaria/única en el modelo User
    as: 'creadoPor'
});

// Un producto fue modificado por un usuario
Producto.belongsTo(User, {
    foreignKey: 'atr_modificado_por',
    targetKey: 'atr_id_usuario', // La clave primaria/única en el modelo User
    as: 'modificadoPor'
});

module.exports = Producto;