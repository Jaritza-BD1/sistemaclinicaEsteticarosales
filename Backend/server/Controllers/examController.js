const { Exam, Patient, Doctor, User, Especialidad } = require('../Models');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');
const xss = require('xss');
const path = require('path');
const fs = require('fs');
const PatientEmail = require('../Models/PatientEmail');
const archiver = require('archiver');
const bitacoraService = require('../services/bitacoraService');
const Objeto = require('../Models/Objeto');

exports.list = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [
            { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return ResponseService.success(res, exams);
  } catch (error) {
    logger.error('Error listando exámenes:', error);
    return ResponseService.internalError(res, 'Error al obtener la lista de exámenes');
  }
};

exports.get = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        },
        {
          model: Doctor,
          as: 'resultsDoctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });
    
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }
    
    return ResponseService.success(res, exam);
  } catch (error) {
    logger.error('Error obteniendo examen:', error);
    return ResponseService.internalError(res, 'Error al obtener el examen');
  }
};

exports.create = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      examType,
      examName,
      scheduledDate,
      priority = 'normal',
      generalObservations,
      specificObservations,
      requiresFasting = false,
      fastingHours,
      medicationsToSuspend,
      contraindications,
      preparationInstructions,
      cost,
      location
    } = req.body;

    // Verificar que el paciente existe
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return ResponseService.badRequest(res, 'Paciente no encontrado');
    }

    // Verificar que el médico existe
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return ResponseService.badRequest(res, 'Médico no encontrado');
    }

    const exam = await Exam.create({
      atr_id_paciente: patientId,
      atr_id_medico: doctorId,
      atr_tipo_examen: examType,
      atr_nombre_examen: examName,
      atr_fecha_programada: scheduledDate,
      atr_prioridad: priority,
      atr_observaciones_generales: generalObservations,
      atr_observaciones_especificas: specificObservations,
      atr_requiere_ayuno: requiresFasting,
      atr_horas_ayuno: fastingHours,
      atr_medicamentos_suspender: medicationsToSuspend,
      atr_contraindicaciones: contraindications,
      atr_instrucciones_preparacion: preparationInstructions,
      atr_costo: cost,
      atr_ubicacion: location,
      atr_estado: 'solicitado'
    });

    // Obtener el examen con las relaciones
    const examWithRelations = await Exam.findByPk(exam.atr_id_examen, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });

    return ResponseService.created(res, examWithRelations);
  } catch (error) {
    logger.error('Error creando examen:', error);
    return ResponseService.internalError(res, 'Error al crear el examen');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }

    // Si el examen ya está completado, solo admin puede sobrescribir
    if (exam.atr_estado === 'completado' && req.user?.atr_id_rol !== 1) {
      return ResponseService.forbidden(res, 'No se puede modificar resultados de un examen completado');
    }

    // Verificar que el paciente existe si se está actualizando
    if (updateData.patientId) {
      const patient = await Patient.findByPk(updateData.patientId);
      if (!patient) {
        return ResponseService.badRequest(res, 'Paciente no encontrado');
      }
    }

    // Verificar que el médico existe si se está actualizando
    if (updateData.doctorId) {
      const doctor = await Doctor.findByPk(updateData.doctorId);
      if (!doctor) {
        return ResponseService.badRequest(res, 'Médico no encontrado');
      }
    }

    await exam.update(updateData);

    // Obtener el examen actualizado con las relaciones
    const updatedExam = await Exam.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        },
        {
          model: Doctor,
          as: 'resultsDoctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });

    return ResponseService.success(res, updatedExam);
  } catch (error) {
    logger.error('Error actualizando examen:', error);
    return ResponseService.internalError(res, 'Error al actualizar el examen');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findByPk(id);
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }
    
    await exam.destroy();
    
    return ResponseService.success(res, { message: 'Examen eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando examen:', error);
    return ResponseService.internalError(res, 'Error al eliminar el examen');
  }
};

// Actualizar resultados del examen
exports.updateResults = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      results,
      interpretation,
      resultsDoctorId,
      attachments
    } = req.body;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }

    // Verificar que el médico de resultados existe si se proporciona
    if (resultsDoctorId) {
      const doctor = await Doctor.findByPk(resultsDoctorId);
      if (!doctor) {
        return ResponseService.badRequest(res, 'Médico de resultados no encontrado');
      }
    }

    // Sanitizar textos básicos para evitar XSS
    const safeResults = results ? xss(results) : null;
    const safeInterpretation = interpretation ? xss(interpretation) : null;

    // Procesar archivos subidos (multer) y combinarlos con attachments del body
    let uploadedFilesMeta = [];
    try {
      const files = req.files || [];
      uploadedFilesMeta = files.map(f => ({
        name: f.originalname,
        filename: f.filename,
        url: `/uploads/exams/${id}/${f.filename}`,
        size: f.size,
        mime: f.mimetype,
        uploadedBy: req.user?.atr_id_usuario || req.user?.id || null,
        uploadedAt: new Date()
      }));
    } catch (e) {
      logger.warn('No se procesaron archivos subidos:', e.message || e);
    }

    // Parsear attachments existentes en la base (si hay) y attachments enviados en body
    const parseExisting = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch (e) { return [];} 
    };

    const existingAttachments = parseExisting(exam.atr_archivos_adjuntos);
    let bodyAttachments = [];
    try { bodyAttachments = attachments ? (typeof attachments === 'string' ? JSON.parse(attachments) : attachments) : []; } catch (e) { bodyAttachments = []; }

    const totalFilesCount = existingAttachments.length + bodyAttachments.length + uploadedFilesMeta.length;
    const MAX_FILES = 10;
    if (totalFilesCount > MAX_FILES) {
      return ResponseService.badRequest(res, `Límite de archivos alcanzado. Máximo permitido: ${MAX_FILES}`);
    }

    const attachmentsCombined = [...existingAttachments, ...bodyAttachments, ...uploadedFilesMeta];

    await exam.update({
      atr_resultados: safeResults,
      atr_interpretacion: safeInterpretation,
      atr_medico_resultados: resultsDoctorId,
      atr_archivos_adjuntos: attachmentsCombined,
      atr_fecha_resultados: new Date(),
      atr_estado: 'completado'
    });

    // Obtener el examen actualizado con las relaciones
    const updatedExam = await Exam.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        },
        {
          model: Doctor,
          as: 'resultsDoctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });

    return ResponseService.success(res, updatedExam);
  } catch (error) {
    logger.error('Error actualizando resultados del examen:', error);
    return ResponseService.internalError(res, 'Error al actualizar los resultados');
  }
};

// Descargar un attachment de un examen con control de acceso
exports.downloadAttachment = async (req, res) => {
  try {
    const { id, filename } = req.params;

    const exam = await Exam.findByPk(id);
    if (!exam) return ResponseService.notFound(res, 'Examen no encontrado');

    // Permisos: admin(1), doctor(2) y nurse(3) pueden acceder
    const role = req.user?.atr_id_rol;
    if (role === 1 || role === 2 || role === 3) {
      // allowed
    } else if (role === 6) {
      // role patient: verificar que el email del usuario corresponda al paciente del examen
      const userEmail = req.user?.atr_correo_electronico;
      if (!userEmail) return ResponseService.forbidden(res, 'Acceso denegado');
      const record = await PatientEmail.findOne({ where: { atr_correo: userEmail } });
      if (!record || record.atr_id_paciente !== exam.atr_id_paciente) {
        return ResponseService.forbidden(res, 'Acceso denegado');
      }
    } else {
      return ResponseService.forbidden(res, 'Acceso denegado');
    }

    const parseExisting = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch (e) { return [];} 
    };

    const attachments = parseExisting(exam.atr_archivos_adjuntos);
    const attachment = attachments.find(a => a.filename === filename || a.name === filename || a.url?.endsWith(filename));
    if (!attachment) return ResponseService.notFound(res, 'Archivo no encontrado en la orden');

    const filePath = path.join(__dirname, '..', 'uploads', 'exams', String(id), attachment.filename || attachment.name);
    if (!fs.existsSync(filePath)) return ResponseService.notFound(res, 'Archivo físico no encontrado');

    // Set caching headers (private) and handle If-Modified-Since
    try {
      const stats = fs.statSync(filePath);
      const mtime = stats.mtime.toUTCString();

      // If client has the same version, respond 304
      const ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
        res.status(304).end();
        return;
      }

      res.setHeader('Cache-Control', 'private, max-age=3600'); // 1 hour
      res.setHeader('Last-Modified', mtime);
    } catch (e) {
      // ignore stat errors, continue to send file
    }

    return res.sendFile(filePath, { headers: { 'Content-Disposition': `attachment; filename="${attachment.name || attachment.filename}"` } });
    // Registrar en bitácora (no bloquear la descarga si falla la bitácora)
    try {
      let objeto = await Objeto.findOne({ where: { atr_objeto: 'GESTION_EXAMENES' } });
      if (!objeto) {
        objeto = await Objeto.create({ atr_objeto: 'GESTION_EXAMENES', atr_descripcion: 'Gestión de exámenes', atr_tipo_objeto: 'PANTALLA', atr_creado_por: req.user?.atr_usuario || 'SYSTEM' });
      }
      await bitacoraService.registrarEvento({
        atr_id_usuario: req.user?.atr_id_usuario || null,
        atr_id_objetos: objeto.atr_id_objetos,
        atr_accion: 'Descarga',
        atr_descripcion: `Descarga archivo ${attachment.name || attachment.filename} del examen ${id}`,
        ip_origen: req.ip
      });
    } catch (e) {
      logger.warn('No se pudo registrar en bitácora la descarga:', e.message || e);
    }
  } catch (error) {
    logger.error('Error descargando attachment:', error);
    return ResponseService.internalError(res, 'Error al descargar el archivo');
  }
};

// Eliminar un attachment (solo admin o uploader)
exports.deleteAttachment = async (req, res) => {
  try {
    const { id, filename } = req.params;

    const exam = await Exam.findByPk(id);
    if (!exam) return ResponseService.notFound(res, 'Examen no encontrado');

    const parseExisting = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch (e) { return [];} 
    };

    const attachments = parseExisting(exam.atr_archivos_adjuntos);
    const index = attachments.findIndex(a => a.filename === filename || a.name === filename || a.url?.endsWith(filename));
    if (index === -1) return ResponseService.notFound(res, 'Archivo no encontrado en la orden');

    const attachment = attachments[index];

    // Permission: admin or uploader only
    const role = req.user?.atr_id_rol;
    const userId = req.user?.atr_id_usuario;
    if (!(role === 1 || attachment.uploadedBy === userId)) {
      return ResponseService.forbidden(res, 'No tienes permisos para eliminar este archivo');
    }

    // Delete file on disk
    const filePath = path.join(__dirname, '..', 'uploads', 'exams', String(id), attachment.filename || attachment.name);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { logger.warn('No se pudo borrar archivo físico:', e); }

    // Remove from attachments array and update exam
    attachments.splice(index, 1);
    await exam.update({ atr_archivos_adjuntos: attachments });

    // Registrar en bitácora (no bloquear la respuesta si falla la bitácora)
    try {
      let objeto = await Objeto.findOne({ where: { atr_objeto: 'GESTION_EXAMENES' } });
      if (!objeto) {
        objeto = await Objeto.create({ atr_objeto: 'GESTION_EXAMENES', atr_descripcion: 'Gestión de exámenes', atr_tipo_objeto: 'PANTALLA', atr_creado_por: req.user?.atr_usuario || 'SYSTEM' });
      }
      await bitacoraService.registrarEvento({
        atr_id_usuario: req.user?.atr_id_usuario || null,
        atr_id_objetos: objeto.atr_id_objetos,
        atr_accion: 'Delete',
        atr_descripcion: `Eliminó archivo ${attachment.name || attachment.filename} del examen ${id}`,
        ip_origen: req.ip
      });
    } catch (e) {
      logger.warn('No se pudo registrar en bitácora la eliminación:', e.message || e);
    }

    return ResponseService.success(res, { message: 'Archivo eliminado' });
  } catch (error) {
    logger.error('Error eliminando attachment:', error);
    return ResponseService.internalError(res, 'Error al eliminar el archivo');
  }
};

// Listar attachments (metadatos) de una orden con control de acceso
exports.listAttachments = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByPk(id);
    if (!exam) return ResponseService.notFound(res, 'Examen no encontrado');

    // Misma lógica de permisos que en downloadAttachment
    const role = req.user?.atr_id_rol;
    if (!(role === 1 || role === 2 || role === 3 || role === 6)) {
      return ResponseService.forbidden(res, 'Acceso denegado');
    }

    if (role === 6) {
      const userEmail = req.user?.atr_correo_electronico;
      if (!userEmail) return ResponseService.forbidden(res, 'Acceso denegado');
      const record = await PatientEmail.findOne({ where: { atr_correo: userEmail } });
      if (!record || record.atr_id_paciente !== exam.atr_id_paciente) {
        return ResponseService.forbidden(res, 'Acceso denegado');
      }
    }

    const parseExisting = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch (e) { return [];} 
    };

    const attachments = parseExisting(exam.atr_archivos_adjuntos).map(a => ({
      name: a.name || a.filename || null,
      filename: a.filename || null,
      url: a.url || null,
      size: a.size || null,
      mime: a.mime || null,
      uploadedBy: a.uploadedBy || null,
      uploadedAt: a.uploadedAt || null
    }));

    return ResponseService.success(res, attachments);
  } catch (error) {
    logger.error('Error listando attachments:', error);
    return ResponseService.internalError(res, 'Error al listar los archivos');
  }
};

// Descargar todos los attachments como ZIP
exports.downloadAllAsZip = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByPk(id);
    if (!exam) return ResponseService.notFound(res, 'Examen no encontrado');

    // Permisos: admin, doctor, nurse o paciente dueño
    const role = req.user?.atr_id_rol;
    if (!(role === 1 || role === 2 || role === 3 || role === 6)) {
      return ResponseService.forbidden(res, 'Acceso denegado');
    }
    if (role === 6) {
      const userEmail = req.user?.atr_correo_electronico;
      if (!userEmail) return ResponseService.forbidden(res, 'Acceso denegado');
      const record = await PatientEmail.findOne({ where: { atr_correo: userEmail } });
      if (!record || record.atr_id_paciente !== exam.atr_id_paciente) {
        return ResponseService.forbidden(res, 'Acceso denegado');
      }
    }

    const parseExisting = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch (e) { return [];} 
    };

    const attachments = parseExisting(exam.atr_archivos_adjuntos);
    if (!attachments || attachments.length === 0) return ResponseService.notFound(res, 'No hay archivos para descargar');

    const zipName = `exam_${id}_attachments_${Date.now()}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => { throw err; });

    archive.pipe(res);

    // Registrar en bitácora el inicio de descarga ZIP (no bloquear si falla)
    try {
      let objeto = await Objeto.findOne({ where: { atr_objeto: 'GESTION_EXAMENES' } });
      if (!objeto) {
        objeto = await Objeto.create({ atr_objeto: 'GESTION_EXAMENES', atr_descripcion: 'Gestión de exámenes', atr_tipo_objeto: 'PANTALLA', atr_creado_por: req.user?.atr_usuario || 'SYSTEM' });
      }
      await bitacoraService.registrarEvento({
        atr_id_usuario: req.user?.atr_id_usuario || null,
        atr_id_objetos: objeto.atr_id_objetos,
        atr_accion: 'Descarga ZIP',
        atr_descripcion: `Descarga ZIP de ${attachments.length} archivos del examen ${id}`,
        ip_origen: req.ip
      });
    } catch (e) {
      logger.warn('No se pudo registrar en bitácora la descarga ZIP:', e.message || e);
    }

    for (const a of attachments) {
      const filename = a.filename || a.name;
      const filePath = path.join(__dirname, '..', 'uploads', 'exams', String(id), filename || '');
      if (filename && fs.existsSync(filePath)) {
        archive.file(filePath, { name: a.name || filename });
      }
    }

    await archive.finalize();
    // response will be sent by piping archive
  } catch (error) {
    logger.error('Error generando ZIP de attachments:', error);
    return ResponseService.internalError(res, 'Error al generar ZIP');
  }
};

// Obtener exámenes por paciente
exports.getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const exams = await Exam.findAll({
      where: { atr_id_paciente: patientId },
      include: [
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return ResponseService.success(res, exams);
  } catch (error) {
    logger.error('Error obteniendo exámenes por paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener exámenes del paciente');
  }
};

// Obtener exámenes por médico
exports.getByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const exams = await Exam.findAll({
      where: { atr_id_medico: doctorId },
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return ResponseService.success(res, exams);
  } catch (error) {
    logger.error('Error obteniendo exámenes por médico:', error);
    return ResponseService.internalError(res, 'Error al obtener exámenes del médico');
  }
};

// Obtener estadísticas de exámenes
exports.getStats = async (req, res) => {
  try {
    const totalExams = await Exam.count();
    const requestedExams = await Exam.count({ where: { atr_estado: 'solicitado' } });
    const inProcessExams = await Exam.count({ where: { atr_estado: 'en_proceso' } });
    const completedExams = await Exam.count({ where: { atr_estado: 'completado' } });
    const cancelledExams = await Exam.count({ where: { atr_estado: 'cancelado' } });

    const stats = {
      total: totalExams,
      requested: requestedExams,
      inProcess: inProcessExams,
      completed: completedExams,
      cancelled: cancelledExams
    };

    return ResponseService.success(res, stats);
  } catch (error) {
    logger.error('Error obteniendo estadísticas de exámenes:', error);
    return ResponseService.internalError(res, 'Error al obtener estadísticas');
  }
}; 