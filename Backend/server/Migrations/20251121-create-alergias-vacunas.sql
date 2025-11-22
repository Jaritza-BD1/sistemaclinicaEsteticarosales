-- Migration: create tbl_alergias_paciente and tbl_vacunas_paciente
-- Run this against the target database (e.g., mysql -u user -p -h host database < file.sql)

CREATE TABLE IF NOT EXISTS `tbl_alergias_paciente` (
  `atr_id_alergia` INT NOT NULL AUTO_INCREMENT,
  `atr_alergia` VARCHAR(100) NOT NULL,
  `atr_id_paciente` INT NOT NULL,
  PRIMARY KEY (`atr_id_alergia`),
  INDEX `idx_alergias_paciente_paciente` (`atr_id_paciente`),
  CONSTRAINT `fk_alergias_paciente_paciente` FOREIGN KEY (`atr_id_paciente`) REFERENCES `tbl_paciente`(`atr_id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_vacunas_paciente` (
  `atr_id_vacuna` INT NOT NULL AUTO_INCREMENT,
  `atr_id_paciente` INT NOT NULL,
  `atr_vacuna` VARCHAR(100) NOT NULL,
  `atr_fecha_vacunacion` DATE NULL,
  PRIMARY KEY (`atr_id_vacuna`),
  INDEX `idx_vacunas_paciente_paciente` (`atr_id_paciente`),
  CONSTRAINT `fk_vacunas_paciente_paciente` FOREIGN KEY (`atr_id_paciente`) REFERENCES `tbl_paciente`(`atr_id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
