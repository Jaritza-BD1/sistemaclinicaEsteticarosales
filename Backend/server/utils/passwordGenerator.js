// Backend/src/utils/passwordGenerator.js

const crypto = require('crypto');

/**
 * Genera una contraseña temporal robusta de longitud `length`.
 * - uso de crypto.randomBytes
 * - Devuelve una cadena base64 recortada al largo deseado.
 */
function generateTempPassword(length = 12) {
  const raw = crypto.randomBytes(Math.ceil((length * 3) / 4)).toString('base64');
  return raw.slice(0, length);
}

module.exports = { generateTempPassword };

