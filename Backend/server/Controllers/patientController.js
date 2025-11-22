const {
  Patient,
  PatientPhone,
  PatientEmail,
  PatientAddress,
  Appointment,
  Consultation,
  Treatment,
  TreatmentProcedure,
  OrdenExamen,
  OrdenExamenDetalle,
  Examen,
  Doctor
} = require('../Models');
const patientService = require('../services/patientService');
const validatorLib = require('validator');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

exports.list = async (req, res) => {
  try {
    // Soporta búsqueda por query params: name, identidad, expediente, page, limit
    const name = req.query.name || req.query.q || null;
    const identidad = req.query.identidad || null;
    const expediente = req.query.expediente || null;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;

    const result = await patientService.searchPatients({ name, identidad, expediente, page, limit });
    // result: { rows, count, page, pageSize, pages }
    return ResponseService.paginated(res, result.rows, result.page, result.pageSize, result.count);
  } catch (error) {
    logger.error('Error listando pacientes:', error);
    return ResponseService.internalError(res, 'Error al obtener la lista de pacientes');
  }
};

exports.get = async (req, res) => {
  try {
    const paciente = await patientService.getPatientById(req.params.id);
    if (!paciente) return ResponseService.notFound(res, 'Paciente no encontrado');
    return ResponseService.success(res, paciente);
  } catch (error) {
    logger.error('Error obteniendo paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener el paciente');
  }
};

exports.create = async (req, res) => {
  try {
    // Validaciones básicas a nivel de controlador (complemento a express-validator)
    const { atr_nombre, atr_apellido, atr_identidad, telefonos, correos } = req.body;

    if (!atr_nombre || !atr_apellido || !atr_identidad) {
      return ResponseService.badRequest(res, 'Campos requeridos: atr_nombre, atr_apellido, atr_identidad');
    }

    // Validar atr_numero_expediente si viene: debe ser entero o vacío (null)
    const expediente = req.body.atr_numero_expediente;
    if (expediente !== undefined && expediente !== null && expediente !== '') {
      const s = String(expediente);
      if (!/^\d+$/.test(s)) {
        return ResponseService.badRequest(res, 'atr_numero_expediente debe ser un número entero');
      }
      // normalizar a entero
      req.body.atr_numero_expediente = parseInt(s, 10);
    }

    // Validar que al menos exista un contacto (teléfono o correo) si se envían contactos vacíos
    if ((Array.isArray(telefonos) && telefonos.length === 0) && (Array.isArray(correos) && correos.length === 0)) {
      // no es obligatorio enviar contactos, solo validar si se envían como arrays vacíos
    }

    // Si se envían teléfonos, validar formato mínimo
    if (Array.isArray(telefonos) && telefonos.length > 0) {
      const phoneRegex = /^[0-9+()\-\s]{6,30}$/;
      for (const p of telefonos) {
        if (!p || !p.atr_telefono || typeof p.atr_telefono !== 'string' || !phoneRegex.test(p.atr_telefono)) {
          return ResponseService.badRequest(res, 'Formato inválido de teléfono en `telefonos`');
        }
      }
    }

    // Si se envían correos, validar formato
    if (Array.isArray(correos) && correos.length > 0) {
      for (const e of correos) {
        if (!e || !e.atr_correo || typeof e.atr_correo !== 'string' || !validatorLib.isEmail(e.atr_correo)) {
          return ResponseService.badRequest(res, 'Formato inválido de correo en `correos`');
        }
      }
    }

    // Validar alergias si vienen
    const { alergias } = req.body;
    if (alergias !== undefined) {
      if (!Array.isArray(alergias)) return ResponseService.badRequest(res, 'alergias debe ser un array');
      for (const a of alergias) {
        if (!a || (typeof a === 'object' && !a.atr_alergia) || (typeof a === 'string' && a.trim().length === 0)) {
          return ResponseService.badRequest(res, 'Formato inválido en `alergias`');
        }
      }
    }

    // Validar vacunas si vienen
    const { vacunas } = req.body;
    if (vacunas !== undefined) {
      if (!Array.isArray(vacunas)) return ResponseService.badRequest(res, 'vacunas debe ser un array');
      for (const v of vacunas) {
        const name = v && (v.atr_vacuna || v.vacuna || v.name);
        const date = v && (v.atr_fecha_vacunacion || v.fecha || v.date || v.fecha_vacunacion);
        if (!name || typeof name !== 'string' || name.trim().length === 0) return ResponseService.badRequest(res, 'Cada vacuna debe incluir `atr_vacuna`');
        if (date && !validatorLib.isDate(String(date))) return ResponseService.badRequest(res, 'Formato inválido de fecha en `vacunas`');
      }
    }

    // Crear paciente y contactos dentro del servicio (transacción)
    const paciente = await patientService.createPatient(req.body);
    return ResponseService.created(res, paciente);
  } catch (error) {
    logger.error('Error creando paciente:', error);
    return ResponseService.internalError(res, 'Error al crear el paciente');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Validaciones básicas (si se proveen campos)
    const { atr_nombre, atr_apellido, atr_identidad, telefonos, correos } = req.body;

    if (atr_nombre !== undefined && (typeof atr_nombre !== 'string' || atr_nombre.trim().length < 2)) {
      return ResponseService.badRequest(res, 'atr_nombre debe ser una cadena de al menos 2 caracteres');
    }
    if (atr_apellido !== undefined && (typeof atr_apellido !== 'string' || atr_apellido.trim().length < 2)) {
      return ResponseService.badRequest(res, 'atr_apellido debe ser una cadena de al menos 2 caracteres');
    }
    if (atr_identidad !== undefined && (typeof atr_identidad !== 'string' || atr_identidad.trim().length < 5)) {
      return ResponseService.badRequest(res, 'atr_identidad inválida');
    }

    // Validar teléfonos si vienen
    if (telefonos !== undefined) {
      if (!Array.isArray(telefonos)) return ResponseService.badRequest(res, 'telefonos debe ser un array');
      const phoneRegex = /^[0-9+()\-\s]{6,30}$/;
      for (const p of telefonos) {
        if (!p || !p.atr_telefono || typeof p.atr_telefono !== 'string' || !phoneRegex.test(p.atr_telefono)) {
          return ResponseService.badRequest(res, 'Formato inválido de teléfono en `telefonos`');
        }
      }
    }

    // Validar correos si vienen
    if (correos !== undefined) {
      if (!Array.isArray(correos)) return ResponseService.badRequest(res, 'correos debe ser un array');
      for (const e of correos) {
        if (!e || !e.atr_correo || typeof e.atr_correo !== 'string' || !validatorLib.isEmail(e.atr_correo)) {
          return ResponseService.badRequest(res, 'Formato inválido de correo en `correos`');
        }
      }
    }

    // Validar alergias y vacunas en actualización si vienen
    if (req.body.alergias !== undefined) {
      if (!Array.isArray(req.body.alergias)) return ResponseService.badRequest(res, 'alergias debe ser un array');
    }
    if (req.body.vacunas !== undefined) {
      if (!Array.isArray(req.body.vacunas)) return ResponseService.badRequest(res, 'vacunas debe ser un array');
    }

    const updated = await patientService.updatePatient(id, req.body);
    if (!updated) return ResponseService.notFound(res, 'Paciente no encontrado');
    return ResponseService.success(res, updated);
  } catch (error) {
    logger.error('Error actualizando paciente:', error);
    return ResponseService.internalError(res, 'Error al actualizar el paciente');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await patientService.deletePatient(id);
    if (!removed) return ResponseService.notFound(res, 'Paciente no encontrado');
    return ResponseService.success(res, { message: 'Paciente eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando paciente:', error);
    return ResponseService.internalError(res, 'Error al eliminar el paciente');
  }
};

// Obtener pacientes activos para formularios
exports.getActivePatients = async (req, res) => {
  try {
    const pacientes = await Patient.findAll({
      where: { atr_estado_paciente: 'ACTIVO' },
      attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente'],
      order: [['atr_nombre', 'ASC']]
    });
    
    const formattedPatients = pacientes.map(paciente => ({
      value: paciente.atr_id_paciente,
      label: `${paciente.atr_nombre} ${paciente.atr_apellido}`,
      expediente: paciente.atr_numero_expediente
    }));
    
    return ResponseService.success(res, formattedPatients);
  } catch (error) {
    logger.error('Error obteniendo pacientes activos:', error);
    return ResponseService.internalError(res, 'Error al obtener pacientes activos');
  }
}; 

// Obtener historial resumido del paciente
exports.getHistory = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id, 10);
    if (!patientId) return ResponseService.badRequest(res, 'ID de paciente inválido');

    // Delegate to service which returns a structured history object
    const options = {
      appointments_page: req.query.appointments_page,
      appointments_limit: req.query.appointments_limit
    };

    const history = await patientService.getPatientHistory(patientId, options);
    if (!history) return ResponseService.notFound(res, 'Paciente no encontrado');

    // Map result to requested top-level structure
    const payload = {
      patient: history.patient,
      expediente: history.expediente,
      historialConsulta: history.historialConsulta || [],
      citas: history.citas || [],
      examenes: history.examenes || [],
      tratamientos: history.tratamientos || []
    };

    return ResponseService.success(res, payload);
  } catch (error) {
    logger.error('Error obteniendo historial del paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener historial del paciente');
  }
};

// Obtener tipos de paciente para formularios
exports.getTypes = async (req, res) => {
  try {
    const Models = require('../Models');
    if (!Models.TipoPaciente) return ResponseService.success(res, []);
    const tipos = await Models.TipoPaciente.findAll({ attributes: ['atr_id_tipo_paciente', 'atr_descripcion'], order: [['atr_descripcion','ASC']] });
    const payload = tipos.map(t => ({ value: t.atr_id_tipo_paciente, label: t.atr_descripcion }));
    return ResponseService.success(res, payload);
  } catch (error) {
    logger.error('Error obteniendo tipos de paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener tipos de paciente');
  }
};