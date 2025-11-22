// models/Token.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const { Op } = require('sequelize');

const Token = sequelize.define('tbl_ms_token', {
  atr_id_token: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_token'
  },
  atr_id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_usuario',
    references: {
      model: 'tbl_ms_usuario',
      key: 'atr_id_usuario'
    }
  },
  atr_codigo: {
    type: DataTypes.STRING(6),
    allowNull: false,
    field: 'atr_codigo',
    validate: {
      isNumeric: {
        msg: 'El código debe contener solo números'
      },
      len: {
        args: [6, 6],
        msg: 'El código debe tener exactamente 6 dígitos'
      }
    }
  },
  atr_tipo: {
    type: DataTypes.ENUM('LOGIN_OTP', 'PASSWORD_RESET_OTP', 'ACCOUNT_VERIFICATION'),
    allowNull: false,
    field: 'atr_tipo'
  },
  atr_fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'atr_fecha_expiracion'
  },
  atr_utilizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'atr_utilizado'
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
  }
}, {
  tableName: 'tbl_ms_token',
  timestamps: false,
  indexes: [
    {
      fields: ['atr_id_usuario']
    },
    {
      name: 'idx_token_code_type_used_expiry',
      fields: ['atr_codigo', 'atr_tipo', 'atr_utilizado', 'atr_fecha_expiracion'],
      where: {
        atr_utilizado: false,
        atr_fecha_expiracion: { [Op.gt]: new Date() }
      }
    }
  ]
});

// Métodos de clase
Token.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

Token.generateExpirationDate = function(minutes = 10) {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
};

// Métodos de instancia
Token.prototype.isExpired = function() {
  return new Date() > this.atr_fecha_expiracion;
};

Token.prototype.isValid = function() {
  return !this.atr_utilizado && !this.isExpired();
};

// Relación con el modelo de Usuario
Token.associate = function(models) {
  Token.belongsTo(models.User, {
    foreignKey: 'atr_id_usuario',
    as: 'usuario'
  });
};

// Hooks
Token.beforeCreate((token) => {
  // Asegurar que el código sea de 6 dígitos
  if (token.atr_codigo && token.atr_codigo.length !== 6) {
    throw new Error('El código debe tener exactamente 6 dígitos');
  }
});

// Método para limpiar tokens expirados
Token.cleanupExpiredTokens = async function() {
  const expirationDate = new Date();
  return await Token.destroy({
    where: {
      atr_fecha_expiracion: { [Op.lt]: expirationDate }
    }
  });
};

module.exports = Token;