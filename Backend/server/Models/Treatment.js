// backend/server/models/Treatment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const Patient = require('./Patient');
const Doctor = require('./Doctor');

const Treatment = sequelize.define('tbl_tratamiento', {
    atr_id_tratamiento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'atr_id_tratamiento'
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
    atr_id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'atr_id_medico',
        references: {
            model: 'tbl_medico',
            key: 'atr_id_medico'
        }
    },
    atr_id_consulta: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'atr_id_consulta',
        references: {
            model: 'tbl_consulta_medica',
            key: 'atr_id_consulta'
        }
    },
    atr_fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'atr_fecha_inicio'
    },
    atr_fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'atr_fecha_fin'
    },
    atr_diagnostico: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'atr_diagnostico'
    },
    atr_observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'atr_observaciones'
    },
    atr_numero_sesiones: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'atr_numero_sesiones',
        defaultValue: 1
    },
    atr_tipo_tratamiento: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'atr_tipo_tratamiento'
    }
}, {
    tableName: 'tbl_tratamiento',
    timestamps: false
});

// Relaciones movidas a `Models/index.js` para centralizar definitions y evitar
// dependencias circulares con otros modelos.

module.exports = Treatment; 