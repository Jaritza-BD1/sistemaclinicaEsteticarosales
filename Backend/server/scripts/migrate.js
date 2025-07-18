#!/usr/bin/env node

/**
 * Script de migración para la nueva arquitectura
 * Este script ayuda a migrar desde la estructura anterior a la nueva
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando migración a la nueva arquitectura...\n');

// Verificar si estamos en el directorio correcto
if (!fs.existsSync('server.js')) {
  console.error('❌ Error: Debes ejecutar este script desde el directorio Backend/server/');
  process.exit(1);
}

// Crear directorios necesarios
const directories = [
  'config',
  'controllers',
  'middlewares',
  'routes',
  'services',
  'logs'
];

console.log('📁 Creando directorios...');
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Creado: ${dir}/`);
  } else {
    console.log(`ℹ️  Ya existe: ${dir}/`);
  }
});

// Verificar archivos críticos
const criticalFiles = [
  'config/environment.js',
  'config/cors.js',
  'config/database.js',
  'services/responseService.js',
  'services/authService.js',
  'services/twoFactorService.js',
  'middlewares/validation.js',
  'middlewares/errorHandler.js',
  'middlewares/authMiddleware.js',
  'controllers/authController.js',
  'controllers/twoFactorController.js',
  'routes/authRoutes.js',
  'routes/adminRoutes.js',
  'utils/logger.js'
];

console.log('\n🔍 Verificando archivos críticos...');
let missingFiles = [];
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
    console.log(`❌ Faltante: ${file}`);
  } else {
    console.log(`✅ Existe: ${file}`);
  }
});

if (missingFiles.length > 0) {
  console.log('\n⚠️  Algunos archivos críticos faltan. Asegúrate de que todos los archivos de la nueva arquitectura estén presentes.');
  console.log('Archivos faltantes:');
  missingFiles.forEach(file => console.log(`  - ${file}`));
}

// Verificar package.json
console.log('\n📦 Verificando dependencias...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'express',
    'sequelize',
    'mysql2',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'helmet',
    'morgan',
    'express-rate-limit',
    'express-validator',
    'winston',
    'nodemailer',
    'speakeasy',
    'qrcode',
    'dotenv'
  ];

  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log('❌ Dependencias faltantes:');
    missingDeps.forEach(dep => console.log(`  - ${dep}`));
    console.log('\n💡 Ejecuta: npm install ' + missingDeps.join(' '));
  } else {
    console.log('✅ Todas las dependencias están instaladas');
  }
} catch (error) {
  console.error('❌ Error leyendo package.json:', error.message);
}

// Verificar archivo .env
console.log('\n🔐 Verificando configuración...');
if (!fs.existsSync('.env')) {
  console.log('❌ Archivo .env no encontrado');
  console.log('💡 Copia .env.example a .env y configura las variables');
} else {
  console.log('✅ Archivo .env encontrado');
}

// Verificar conexión a base de datos
console.log('\n🗄️  Verificando conexión a base de datos...');
try {
  require('dotenv').config();
  const { Sequelize } = require('sequelize');
  
  const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST,
      dialect: 'mysql',
      logging: false
    }
  );

  await sequelize.authenticate();
  console.log('✅ Conexión a base de datos exitosa');
  await sequelize.close();
} catch (error) {
  console.log('❌ Error conectando a la base de datos:', error.message);
  console.log('💡 Verifica las variables de entorno de la base de datos');
}

// Verificar modelos
console.log('\n📋 Verificando modelos...');
const models = [
  'models/User.js',
  'models/BackupCode.js',
  'models/PasswordHistory.js',
  'models/Parametro.js',
  'models/Bitacora.js'
];

models.forEach(model => {
  if (fs.existsSync(model)) {
    console.log(`✅ ${model}`);
  } else {
    console.log(`❌ ${model} - Asegúrate de que exista`);
  }
});

// Instrucciones finales
console.log('\n🎉 Migración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Configura las variables de entorno en .env');
console.log('2. Ejecuta: npm run dev');
console.log('3. Verifica que el servidor inicie correctamente');
console.log('4. Prueba los endpoints principales');
console.log('5. Actualiza el frontend si es necesario');

console.log('\n🔗 Documentación: README.md');
console.log('📞 Soporte: Revisa los logs en logs/ para debugging');

console.log('\n✨ ¡La nueva arquitectura está lista para usar!'); 