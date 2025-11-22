// config/security.js
module.exports = {
  OTP: {
    LENGTH: 6,
    EXPIRATION_MINUTES: 10,
    MAX_ATTEMPTS: 3,
    ATTEMPT_WINDOW_MINUTES: 15
  }
};

// En tu archivo de configuración (ej: config/security.js)
module.exports = {
  OTP: {
    MAX_ATTEMPTS: process.env.OTP_MAX_ATTEMPTS || 3,
    ATTEMPT_WINDOW_MINUTES: process.env.OTP_ATTEMPT_WINDOW || 15
  }
};

