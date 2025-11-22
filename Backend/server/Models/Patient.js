const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Patient = sequelize.define('tbl_paciente', {
  atr_id_paciente: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true,
    field: 'atr_id_paciente'
  },
  atr_nombre: { 
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 255],
        msg: 'El nombre debe tener entre 2 y 255 caracteres'
      }
    },
    field: 'atr_nombre'
  },
  atr_apellido: { 
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El apellido es requerido'
      }
    },
    field: 'atr_apellido'
  },
  atr_fecha_nacimiento: { 
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'La fecha de nacimiento debe ser una fecha válida'
      },
      notInFuture(value) {
        if (!value) return;
        const inputDate = new Date(value);
        const now = new Date();
        // Normalize to date-only comparison
        const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (isNaN(inputDay.getTime())) {
          throw new Error('La fecha de nacimiento debe ser una fecha válida');
        }
        if (inputDay > today) {
          throw new Error('La fecha de nacimiento no puede ser en el futuro');
        }
      }
    },
    field: 'atr_fecha_nacimiento'
  },
  atr_identidad: {
    type: DataTypes.STRING(20),
    unique: {
      msg: 'Este número de identidad ya está registrado'
    },
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El número de identidad es requerido'
      }
    },
    field: 'atr_identidad'
  },
  atr_numero_expediente: {
    type: DataTypes.INTEGER,
    unique: {
      msg: 'Este número de expediente ya está en uso'
    },
    allowNull: true, // Se generará automáticamente si es nulo
    field: 'atr_numero_expediente'
  },
  atr_id_genero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_genero',
      key: 'atr_id_genero'
    },
    field: 'atr_id_genero'
  },
  atr_id_tipo_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_tipo_paciente',
      key: 'atr_id_tipo_paciente'
    },
    field: 'atr_id_tipo_paciente'
  },
  atr_id_consulta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_consulta_medica',
      key: 'atr_id_consulta'
    },
    field: 'atr_id_consulta'
  }
}, { 
  tableName: 'tbl_paciente',
  timestamps: false, // No hay campos de timestamp en la tabla
  hooks: {
    beforeCreate: async (patient/*, options */) => {
      // Generar número de expediente si no se proporciona.
      // Usar Patient.max para evitar dependencias en ordering y valores NULL.
      if (!patient.atr_numero_expediente) {
        try {
          const max = await Patient.max('atr_numero_expediente');
          patient.atr_numero_expediente = max ? (max + 1) : 1000;
        } catch (err) {
          // En caso de error, fallback al número inicial y log para diagnóstico
          console.error('Error generando atr_numero_expediente en Patient.beforeCreate:', err);
          patient.atr_numero_expediente = 1000;
        }
      }
    }
  }
});

// Asociaciones
Patient.associate = (models) => {
  // Relación con Género (si el modelo está registrado centralmente)
  if (models.Genero) {
    Patient.belongsTo(models.Genero, {
      foreignKey: 'atr_id_genero',
      as: 'genero'
    });
  }

  // Relación con Tipo de Paciente (protegida: modelo puede no existir)
  if (models.TipoPaciente) {
    Patient.belongsTo(models.TipoPaciente, {
      foreignKey: 'atr_id_tipo_paciente',
      as: 'tipoPaciente'
    });
  }

  // Relación con la última consulta (solo si existe el modelo ConsultationMedical)
  if (models.ConsultationMedical) {
    Patient.belongsTo(models.ConsultationMedical, {
      foreignKey: 'atr_id_consulta',
      as: 'ultimaConsulta'
    });
  }

  // Relación con el historial de consultas (protegida: modelo opcional)
  if (models.HistoricoConsulta) {
    Patient.hasMany(models.HistoricoConsulta, {
      foreignKey: 'atr_id_paciente',
      as: 'historialConsultas'
    });
  }
};

module.exports = Patient;