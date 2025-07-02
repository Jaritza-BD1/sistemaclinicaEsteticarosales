// migrations/initDB.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function runMigrations() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD
    });
    

    // Crear base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`);
    await connection.query(`USE ${process.env.MYSQL_DATABASE}`);

    // Crear tabla de roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tbl_ms_roles (
        atr_id_rol INT AUTO_INCREMENT PRIMARY KEY,
        atr_nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        atr_descripcion_rol VARCHAR(255),
        atr_estado_rol VARCHAR(20) DEFAULT 'Activo',
        atr_fecha_creacion DATE DEFAULT (CURRENT_DATE),
        atr_fecha_modificacion DATE
      ) ENGINE=InnoDB;
    `);

    // Insertar roles básicos si no existen
    await connection.query(`
      INSERT IGNORE INTO tbl_ms_roles (atr_id_rol, atr_nombre_rol, atr_descripcion_rol, atr_estado_rol)
      VALUES 
        (1, 'Administrador', 'Rol con acceso completo al sistema', 'Activo'),
        (2, 'Usuario', 'Rol de usuario estándar con acceso limitado', 'Activo');
    `);

    // Crear tabla de usuarios principal
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tbl_ms_usuario (
        atr_id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        atr_usuario VARCHAR(15) NOT NULL UNIQUE,
        atr_nombre_usuario VARCHAR(100) NOT NULL,
        atr_estado_usuario VARCHAR(100) NOT NULL DEFAULT 'Pendiente Verificación',
        atr_contrasena VARCHAR(200) NOT NULL,
        atr_id_rol INT NOT NULL DEFAULT 2,
        atr_fecha_ultima_conexion DATETIME,
        atr_primer_ingreso TINYINT(1) DEFAULT 1,
        atr_fecha_vencimiento DATE,
        atr_correo_electronico VARCHAR(50) NOT NULL UNIQUE,
        atr_creado_por VARCHAR(15),
        atr_fecha_creacion DATE,
        atr_modificado_por VARCHAR(15),
        atr_fecha_modificacion DATE,
        atr_reset_token VARCHAR(255),
        atr_reset_expiry DATETIME,
        atr_verification_token VARCHAR(255),
        atr_token_expiry DATETIME,
        atr_intentos_fallidos INT DEFAULT 0
      ) ENGINE=InnoDB;
    `);

  
    // Insertar parámetros esenciales
    await connection.query(`
      INSERT IGNORE INTO tbl_parametros (atr_parametro, atr_valor)
      VALUES 
        ('ADMIN_INTENTOS_INVALIDOS', '3'),
        ('RESET_TOKEN_EXPIRY', '24'),
        ('VERIFICATION_TOKEN_EXPIRY', '24');
    `);

    // Insertar usuario admin si no existe
    const [rows] = await connection.query(
      'SELECT atr_id_usuario FROM tbl_ms_usuario WHERE atr_usuario = ?', 
      ['ADMIN']
    );

    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await connection.query(
        `INSERT INTO tbl_ms_usuario (
          atr_usuario, 
          atr_nombre_usuario, 
          atr_contrasena, 
          atr_correo_electronico,
          atr_estado_usuario,
          atr_id_rol,
          atr_primer_ingreso,
          atr_fecha_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'ADMIN',
          'Administrador del Sistema',
          hashedPassword,
          'admin@clinica.com',
          'Activo', // Estado activo
          1,        // Rol de administrador
          0,        // No es primer ingreso
          new Date().toISOString().split('T')[0] // Fecha de creación
        ]
      );
      console.log('Usuario admin creado');
    }

    console.log('Migraciones completadas con éxito');
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
  } finally {
    if (connection) await connection.end();
  }
}

runMigrations();