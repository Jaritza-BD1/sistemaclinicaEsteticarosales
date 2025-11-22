-- Migration: alter columnas atr_id_paciente to allow NULL and set FK ON DELETE SET NULL
-- Run in your DB: mysql -u user -p -h host database < this_file.sql

-- Allergies table
ALTER TABLE `tbl_alergias_paciente`
  MODIFY COLUMN `atr_id_paciente` INT NULL,
  DROP FOREIGN KEY IF EXISTS `tbl_alergias_paciente_ibfk_1`;

ALTER TABLE `tbl_alergias_paciente`
  ADD CONSTRAINT `fk_alergias_paciente_paciente` FOREIGN KEY (`atr_id_paciente`) REFERENCES `tbl_paciente`(`atr_id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Vaccines table
ALTER TABLE `tbl_vacunas_paciente`
  MODIFY COLUMN `atr_id_paciente` INT NULL,
  DROP FOREIGN KEY IF EXISTS `tbl_vacunas_paciente_ibfk_1`;

ALTER TABLE `tbl_vacunas_paciente`
  ADD CONSTRAINT `fk_vacunas_paciente_paciente` FOREIGN KEY (`atr_id_paciente`) REFERENCES `tbl_paciente`(`atr_id_paciente`) ON DELETE SET NULL ON UPDATE CASCADE;
