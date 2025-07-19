// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('tbl_ms_usuario', {
  atr_id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_usuario'
  },
  atr_usuario: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    field: 'atr_usuario',
    set(value) {
      this.setDataValue('atr_usuario', value.toUpperCase());
    },
    validate: {
      len: {
        args: [4, 15],
        msg: 'El usuario debe tener entre 4 y 15 caracteres'
      },
      notContainsSpace(value) {
        if (/\s/.test(value)) {
          throw new Error('El nombre de usuario no puede contener espacios');
        }
      }
    }
  },
  atr_nombre_usuario: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_nombre_usuario'
  },
  atr_estado_usuario: {
    type: DataTypes.ENUM('ACTIVO','BLOQUEADO','PENDIENTE_VERIFICACION','PENDIENTE_APROBACION','RECHAZADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE_VERIFICACION',
    field: 'atr_estado_usuario'
  },
  atr_contrasena: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'atr_contrasena',
    set(value) {
      if (value && value.trim() !== '') {
        const hash = bcrypt.hashSync(value, 10);
        this.setDataValue('atr_contrasena', hash);
      }
    }
  },
  atr_id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    field: 'atr_id_rol'
  },
  atr_fecha_ultima_conexion: {
    type: DataTypes.DATE,
    field: 'atr_fecha_ultima_conexion'
  },
  atr_primer_ingreso: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'atr_primer_ingreso'
  },
  atr_fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    field: 'atr_fecha_vencimiento'
  },
  atr_correo_electronico: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'atr_correo_electronico',
    validate: {
      isEmail: {
        msg: 'Debe ser un correo electrónico válido'
      }
    }
  },
  atr_creado_por: {
    type: DataTypes.STRING(15),
    field: 'atr_creado_por'
  },
  atr_fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'atr_fecha_creacion'
  },
  atr_modificado_por: {
    type: DataTypes.STRING(15),
    field: 'atr_modificado_por'
  },
  atr_fecha_modificacion: {
    type: DataTypes.DATE,
    field: 'atr_fecha_modificacion'
  },
  atr_reset_token: {
    type: DataTypes.STRING(255),
    field: 'atr_reset_token'
  },
  atr_reset_expiry: {
    type: DataTypes.DATE,
    field: 'atr_reset_expiry'
  },
  atr_verification_token: {
    type: DataTypes.STRING(255),
    field: 'atr_verification_token'
  },
  atr_token_expiry: {
    type: DataTypes.DATE,
    field: 'atr_token_expiry'
  },
  atr_intentos_fallidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'atr_intentos_fallidos'
  },
  // Nuevos campos del Componente 2
  atr_is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'atr_is_verified'
  },
  atr_is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'atr_is_approved'
  },
  atr_2fa_secret: {
    type: DataTypes.STRING(32),
    field: 'atr_2fa_secret'
  },
  atr_2fa_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'atr_2fa_enabled'
  },
  atr_email_2fa_code: {
    type: DataTypes.STRING(6),
    field: 'atr_email_2fa_code'
  },
  atr_email_2fa_expiry: {
    type: DataTypes.DATE,
    field: 'atr_email_2fa_expiry'
  },
  atr_avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'atr_avatar',
  }
}, {
  tableName: 'tbl_ms_usuario',
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeCreate: (user) => {
      if (user.atr_usuario) {
        user.atr_usuario = user.atr_usuario.toUpperCase();
      }
      if (!user.atr_fecha_creacion) {
        user.atr_fecha_creacion = new Date();
      }
    },
    beforeUpdate: (user) => {
      user.atr_fecha_modificacion = new Date();
    }
  }
});

// Métodos de instancia
User.prototype.validPassword = async function(password) {
  return bcrypt.compare(password, this.atr_contrasena);
};

User.prototype.incrementFailedAttempts = async function() {
  this.atr_intentos_fallidos += 1;
  await this.save();
};

User.prototype.resetFailedAttempts = async function() {
  this.atr_intentos_fallidos = 0;
  await this.save();
};

User.prototype.lockAccount = async function(lockTime = 30 * 60 * 1000) {
  this.atr_estado_usuario = 'BLOQUEADO'; // Actualizado para coincidir con el ENUM
  this.atr_reset_expiry = new Date(Date.now() + lockTime);
  await this.save();
};

User.prototype.isLocked = function() {
  return (
    this.atr_estado_usuario === 'BLOQUEADO' && // Actualizado para coincidir con el ENUM
    this.atr_reset_expiry > new Date()
  );
};

module.exports = User;
