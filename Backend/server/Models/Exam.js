const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const Exam = sequelize.define('Exam', {
  atr_id_examen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'atr_id_paciente'
    }
  },
  atr_id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'atr_id_medico'
    }
  },
  atr_tipo_examen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atr_nombre_examen: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  atr_fecha_solicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  atr_fecha_programada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  atr_fecha_realizacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  atr_prioridad: {
    type: DataTypes.ENUM('baja', 'normal', 'alta', 'urgente'),
    allowNull: false,
    defaultValue: 'normal'
  },
  atr_estado: {
    type: DataTypes.ENUM('solicitado', 'programado', 'en_proceso', 'completado', 'cancelado'),
    allowNull: false,
    defaultValue: 'solicitado'
  },
  atr_observaciones_generales: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_observaciones_especificas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_resultados: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_interpretacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_archivos_adjuntos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  atr_fecha_resultados: {
    type: DataTypes.DATE,
    allowNull: true
  },
  atr_medico_resultados: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Doctors',
      key: 'atr_id_medico'
    }
  },
  atr_costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  atr_ubicacion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  atr_instrucciones_preparacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_requiere_ayuno: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  atr_horas_ayuno: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  atr_medicamentos_suspender: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_contraindicaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Definir las relaciones
Exam.associate = (models) => {
  Exam.belongsTo(models.Patient, {
    foreignKey: 'atr_id_paciente',
    as: 'patient'
  });
  
  Exam.belongsTo(models.Doctor, {
    foreignKey: 'atr_id_medico',
    as: 'doctor'
  });
  
  Exam.belongsTo(models.Doctor, {
    foreignKey: 'atr_medico_resultados',
    as: 'resultsDoctor'
  });
};

module.exports = Exam; 