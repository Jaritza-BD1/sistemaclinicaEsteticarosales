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
        atr_rol VARCHAR(30) NOT NULL UNIQUE,
        atr_descripcion VARCHAR(100),
        atr_activo BOOLEAN DEFAULT TRUE,
        atr_creado_por VARCHAR(15),
        atr_fecha_creacion DATE DEFAULT (CURRENT_DATE),
        atr_modificado_por VARCHAR(15),
        atr_fecha_modificacion DATE DEFAULT (CURRENT_DATE),
        atr_id_bitacora INT
      ) ENGINE=InnoDB;
    `);

    // Insertar roles básicos si no existen
    await connection.query(`
      INSERT IGNORE INTO tbl_ms_roles (atr_id_rol, atr_rol, atr_descripcion, atr_activo, atr_creado_por)
      VALUES 
        (1, 'ADMINISTRADOR', 'Rol con acceso completo al sistema', TRUE, 'SYSTEM'),
        (2, 'USUARIO', 'Rol de usuario estándar con acceso limitado', TRUE, 'SYSTEM');
    `);

    // Crear tabla de objetos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tbl_objetos (
        atr_id_objetos INT AUTO_INCREMENT PRIMARY KEY,
        atr_objeto VARCHAR(100) NOT NULL UNIQUE,
        atr_descripcion VARCHAR(100),
        atr_tipo_objeto ENUM('PANTALLA', 'REPORTE', 'FUNCION', 'PROCESO'),
        atr_url VARCHAR(255),
        atr_activo BOOLEAN DEFAULT TRUE,
        atr_creado_por VARCHAR(15),
        atr_fecha_creacion DATE DEFAULT (CURRENT_DATE),
        atr_modificado_por VARCHAR(15),
        atr_fecha_modificacion DATE DEFAULT (CURRENT_DATE)
      ) ENGINE=InnoDB;
    `);

    // Insertar objetos básicos si no existen
    await connection.query(`
      INSERT IGNORE INTO tbl_objetos (atr_id_objetos, atr_objeto, atr_descripcion, atr_tipo_objeto, atr_activo, atr_creado_por)
      VALUES 
        (1, 'GESTION_ROLES', 'Gestión de roles del sistema', 'PANTALLA', TRUE, 'SYSTEM'),
        (2, 'GESTION_PERMISOS', 'Gestión de permisos del sistema', 'PANTALLA', TRUE, 'SYSTEM'),
        (3, 'GESTION_USUARIOS', 'Gestión de usuarios del sistema', 'PANTALLA', TRUE, 'SYSTEM'),
        (4, 'GESTION_CITAS', 'Gestión de citas médicas', 'PANTALLA', TRUE, 'SYSTEM'),
        (5, 'GESTION_PACIENTES', 'Gestión de pacientes', 'PANTALLA', TRUE, 'SYSTEM'),
        (6, 'GESTION_DOCTORES', 'Gestión de doctores', 'PANTALLA', TRUE, 'SYSTEM'),
        (7, 'REPORTES', 'Generación de reportes', 'REPORTE', TRUE, 'SYSTEM'),
        (8, 'BITACORA', 'Consulta de bitácora del sistema', 'PANTALLA', TRUE, 'SYSTEM');
    `);

    // Crear tabla de permisos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tbl_permisos (
        atr_id_rol INT NOT NULL,
        atr_id_objeto INT NOT NULL,
        atr_permiso_insercion BOOLEAN DEFAULT FALSE,
        atr_permiso_eliminacion BOOLEAN DEFAULT FALSE,
        atr_permiso_actualizacion BOOLEAN DEFAULT FALSE,
        atr_permiso_consultar BOOLEAN DEFAULT FALSE,
        atr_activo BOOLEAN DEFAULT TRUE,
        atr_creado_por VARCHAR(15),
        atr_fecha_creacion DATE DEFAULT (CURRENT_DATE),
        atr_modificado_por VARCHAR(15),
        atr_fecha_modificacion DATE DEFAULT (CURRENT_DATE),
        PRIMARY KEY (atr_id_rol, atr_id_objeto),
        FOREIGN KEY (atr_id_rol) REFERENCES tbl_ms_roles(atr_id_rol),
        FOREIGN KEY (atr_id_objeto) REFERENCES tbl_objetos(atr_id_objetos)
      ) ENGINE=InnoDB;
    `);

    // Insertar permisos básicos para el administrador
    await connection.query(`
      INSERT IGNORE INTO tbl_permisos (atr_id_rol, atr_id_objeto, atr_permiso_insercion, atr_permiso_eliminacion, atr_permiso_actualizacion, atr_permiso_consultar, atr_activo, atr_creado_por)
      VALUES 
        (1, 1, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 2, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 3, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 4, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 5, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 6, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 7, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM'),
        (1, 8, TRUE, TRUE, TRUE, TRUE, TRUE, 'SYSTEM');
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
        atr_intentos_fallidos INT DEFAULT 0,
        atr_avatar VARCHAR(255)
      ) ENGINE=InnoDB;
    `);

    // Agregar columna de avatar si no existe
    await connection.query(`
      ALTER TABLE tbl_ms_usuario ADD COLUMN IF NOT EXISTS atr_avatar VARCHAR(255) NULL;
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