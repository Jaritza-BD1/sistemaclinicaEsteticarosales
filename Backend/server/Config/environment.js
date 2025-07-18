require('dotenv').config();

const config = {
  development: {
    port: process.env.PORT || 5000,
    database: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      name: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      dialect: 'mysql',
      logging: true,
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
      }
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '24h'
    },
    email: {
      service: 'gmail',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 3,
      lockTime: 30 * 60 * 1000 // 30 minutos
    }
  },
  production: {
    port: process.env.PORT || 5000,
    database: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      name: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
      }
    },
    frontend: {
      url: process.env.FRONTEND_URL
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    email: {
      service: 'gmail',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 3,
      lockTime: 30 * 60 * 1000
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development']; 