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
    }
}, {
    tableName: 'tbl_tratamiento',
    timestamps: false
});

// Definir las relaciones
Treatment.belongsTo(Patient, {
    foreignKey: 'atr_id_paciente',
    targetKey: 'atr_id_paciente',
    as: 'patient'
});

Treatment.belongsTo(Doctor, {
    foreignKey: 'atr_id_medico',
    targetKey: 'atr_id_medico',
    as: 'doctor'
});

Patient.hasMany(Treatment, {
    foreignKey: 'atr_id_paciente',
    sourceKey: 'atr_id_paciente',
    as: 'treatments'
});

Doctor.hasMany(Treatment, {
    foreignKey: 'atr_id_medico',
    sourceKey: 'atr_id_medico',
    as: 'treatments'
});

module.exports = Treatment; 