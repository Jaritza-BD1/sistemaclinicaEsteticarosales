// utils/helpers.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Genera token seguro
exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Genera contraseña temporal
exports.generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Valida fortaleza de contraseña
exports.validatePasswordStrength = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Genera hash de contraseña
exports.hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  return bcrypt.hash(password, saltRounds);
};

// Compara contraseña con hash
exports.comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};