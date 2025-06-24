// Configuración de la conexión a MySQL usando variables de entorno
require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,   // Nombre de la base de datos
  process.env.MYSQL_USER,       // Usuario
  process.env.MYSQL_PASSWORD,   // Contraseña
  {
    host: process.env.MYSQL_HOST,  // Host (por ejemplo 127.0.0.1)
    dialect: 'mysql',
    logging: (sql) => logger.debug(`[SQL] ${sql}`),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
    }
    // Si necesitas puerto distinto al 3306, podrías añadir:
    // port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  }
);

module.exports = sequelize;
