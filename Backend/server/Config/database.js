const { Sequelize } = require('sequelize');
const config = require('../Config/environment');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging ? (sql) => logger.debug(`[SQL] ${sql}`) : false,
    pool: config.database.pool,
    define: { 
      timestamps: true, 
      paranoid: true, 
      underscored: true 
    }
  }
);

module.exports = sequelize; 