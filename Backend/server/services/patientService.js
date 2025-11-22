const { Op } = require('sequelize');
const sequelize = require('../Config/db');
const {
  Patient,
  PatientPhone,
  PatientEmail,
  PatientAddress
} = require('../Models');
// Nota: Models/index.js ahora exporta TipoPaciente y el resto de modelos
const { TipoPaciente } = require('../Models');

async function createPatient(payload) {
  const { telefonos = [], correos = [], direcciones = [], alergias = [], vacunas = [], ...patientData } = payload;
  return await sequelize.transaction(async (t) => {
    const paciente = await Patient.create(patientData, { transaction: t });

    if (telefonos && telefonos.length) {
      const phones = telefonos.map(p => ({ ...p, atr_id_paciente: paciente.atr_id_paciente }));
      await PatientPhone.bulkCreate(phones, { transaction: t });
    }

    if (correos && correos.length) {
      const emails = correos.map(e => ({ ...e, atr_id_paciente: paciente.atr_id_paciente }));
      await PatientEmail.bulkCreate(emails, { transaction: t });
    }

    if (direcciones && direcciones.length) {
      const addresses = direcciones.map(a => ({ ...a, atr_id_paciente: paciente.atr_id_paciente }));
      await PatientAddress.bulkCreate(addresses, { transaction: t });
    }

    // manejar alergias
    if (alergias && alergias.length) {
      const Models = require('../Models');
      if (Models.PatientAllergy) {
        const items = alergias.map(a => ({ atr_id_paciente: paciente.atr_id_paciente, atr_alergia: a.atr_alergia || a }));
        await Models.PatientAllergy.bulkCreate(items, { transaction: t });
      }
    }

    // manejar vacunas
    if (vacunas && vacunas.length) {
      const Models = require('../Models');
      if (Models.PatientVaccine) {
        const items = vacunas.map(v => ({ atr_id_paciente: paciente.atr_id_paciente, atr_vacuna: v.atr_vacuna || v, atr_fecha_vacunacion: v.atr_fecha_vacunacion || v.fecha || v.fecha_vacunacion || null }));
        await Models.PatientVaccine.bulkCreate(items, { transaction: t });
      }
    }

    const Models = require('../Models');
    return await Patient.findByPk(paciente.atr_id_paciente, {
      include: [
        { model: PatientPhone, as: 'telefonos' },
        { model: PatientEmail, as: 'correos' },
        { model: PatientAddress, as: 'direcciones' },
        ...(Models.PatientAllergy ? [{ model: Models.PatientAllergy, as: 'alergias', attributes: ['atr_id_alergia','atr_alergia'] }] : []),
        ...(Models.PatientVaccine ? [{ model: Models.PatientVaccine, as: 'vacunas', attributes: ['atr_id_vacuna','atr_vacuna','atr_fecha_vacunacion'] }] : []),
        { model: TipoPaciente, as: 'tipoPaciente', attributes: ['atr_id_tipo_paciente', 'atr_descripcion'] }
      ],
      transaction: t
    });
  });
}

async function listPatients(options = {}) {
  const { q, nombre, identidad, expediente, page = 1, limit = 50 } = options;
  const where = {};

  if (q) {
    const like = `%${q}%`;
    where[Op.or] = [
      { atr_nombre: { [Op.like]: like } },
      { atr_apellido: { [Op.like]: like } },
      { atr_identidad: { [Op.like]: like } },
      { atr_numero_expediente: { [Op.like]: like } }
    ];
  }

  if (nombre) {
    where[Op.or] = where[Op.or] || [];
    where[Op.or].push({ atr_nombre: { [Op.like]: `%${nombre}%` } }, { atr_apellido: { [Op.like]: `%${nombre}%` } });
  }

  if (identidad) where.atr_identidad = identidad;
  if (expediente) where.atr_numero_expediente = expediente;

  const offset = (page - 1) * limit;

  const result = await Patient.findAndCountAll({
    where,
    include: [
      { model: PatientPhone, as: 'telefonos', attributes: ['atr_telefono'] },
      { model: PatientEmail, as: 'correos', attributes: ['atr_correo'] },
      { model: PatientAddress, as: 'direcciones', attributes: ['atr_direccion_completa'] },
      { model: TipoPaciente, as: 'tipoPaciente', attributes: ['atr_id_tipo_paciente', 'atr_descripcion'] }
    ],
    order: [['atr_nombre', 'ASC']],
    limit,
    offset
  });

  return {
    rows: result.rows,
    count: result.count,
    page,
    pageSize: limit,
    pages: limit ? Math.ceil(result.count / limit) : 0
  };
}

async function getPatientById(id) {
  const Models = require('../Models');
  return await Patient.findByPk(id, {
    include: [
      { model: PatientPhone, as: 'telefonos' },
      { model: PatientEmail, as: 'correos' },
      { model: PatientAddress, as: 'direcciones' },
      ...(Models.PatientAllergy ? [{ model: Models.PatientAllergy, as: 'alergias', attributes: ['atr_id_alergia','atr_alergia'] }] : []),
      ...(Models.PatientVaccine ? [{ model: Models.PatientVaccine, as: 'vacunas', attributes: ['atr_id_vacuna','atr_vacuna','atr_fecha_vacunacion'] }] : []),
      { model: TipoPaciente, as: 'tipoPaciente', attributes: ['atr_id_tipo_paciente', 'atr_descripcion'] }
    ]
  });
}

async function updatePatient(id, payload) {
  const { telefonos, correos, direcciones, alergias, vacunas, ...patientData } = payload;
  return await sequelize.transaction(async (t) => {
    const paciente = await Patient.findByPk(id, { transaction: t });
    if (!paciente) return null;
    await paciente.update(patientData, { transaction: t });

    if (telefonos !== undefined) {
      await PatientPhone.destroy({ where: { atr_id_paciente: id }, transaction: t });
      if (telefonos.length) {
        const phones = telefonos.map(p => ({ ...p, atr_id_paciente: id }));
        await PatientPhone.bulkCreate(phones, { transaction: t });
      }
    }

    if (correos !== undefined) {
      await PatientEmail.destroy({ where: { atr_id_paciente: id }, transaction: t });
      if (correos.length) {
        const emails = correos.map(e => ({ ...e, atr_id_paciente: id }));
        await PatientEmail.bulkCreate(emails, { transaction: t });
      }
    }

    if (direcciones !== undefined) {
      await PatientAddress.destroy({ where: { atr_id_paciente: id }, transaction: t });
      if (direcciones.length) {
        const addresses = direcciones.map(a => ({ ...a, atr_id_paciente: id }));
        await PatientAddress.bulkCreate(addresses, { transaction: t });
      }
    }

    // actualizar alergias
    if (alergias !== undefined) {
      const Models = require('../Models');
      if (Models.PatientAllergy) {
        await Models.PatientAllergy.destroy({ where: { atr_id_paciente: id }, transaction: t });
        if (alergias.length) {
          const items = alergias.map(a => ({ atr_id_paciente: id, atr_alergia: a.atr_alergia || a }));
          await Models.PatientAllergy.bulkCreate(items, { transaction: t });
        }
      }
    }

    // actualizar vacunas
    if (vacunas !== undefined) {
      const Models = require('../Models');
      if (Models.PatientVaccine) {
        await Models.PatientVaccine.destroy({ where: { atr_id_paciente: id }, transaction: t });
        if (vacunas.length) {
          const items = vacunas.map(v => ({ atr_id_paciente: id, atr_vacuna: v.atr_vacuna || v, atr_fecha_vacunacion: v.atr_fecha_vacunacion || v.fecha || v.fecha_vacunacion || null }));
          await Models.PatientVaccine.bulkCreate(items, { transaction: t });
        }
      }
    }

    return await getPatientById(id);
  });
}

async function deletePatient(id) {
  return await sequelize.transaction(async (t) => {
    await PatientPhone.destroy({ where: { atr_id_paciente: id }, transaction: t });
    await PatientEmail.destroy({ where: { atr_id_paciente: id }, transaction: t });
    await PatientAddress.destroy({ where: { atr_id_paciente: id }, transaction: t });
    // En lugar de borrar las filas hijas, desvincularlas (poner atr_id_paciente = NULL)
    const Models = require('../Models');
    if (Models.PatientAllergy) {
      await Models.PatientAllergy.update({ atr_id_paciente: null }, { where: { atr_id_paciente: id }, transaction: t });
    }
    if (Models.PatientVaccine) {
      await Models.PatientVaccine.update({ atr_id_paciente: null }, { where: { atr_id_paciente: id }, transaction: t });
    }
    const paciente = await Patient.findByPk(id, { transaction: t });
    if (!paciente) return false;
    await paciente.destroy({ transaction: t });
    return true;
  });
}

module.exports = {
  createPatient,
  listPatients,
  // searchPatients mantiene una interfaz más explícita para el controller
  // acepta { name, identidad, expediente, page, limit }
  searchPatients: async (opts = {}) => {
    const { name, identidad, expediente, page = 1, limit = 50 } = opts;
    return await listPatients({ nombre: name, identidad, expediente, page, limit });
  },
  getPatientById,
  // Devuelve un objeto resumido de historial. Inicialmente incluye patient + citas
  getPatientHistory: async (id, options = {}) => {
    const patientId = parseInt(id, 10);
    if (!patientId) return null;

    const apPage = options.appointments_page ? parseInt(options.appointments_page, 10) : 1;
    const apLimit = options.appointments_limit ? parseInt(options.appointments_limit, 10) : 50;
    const apOffset = (apPage - 1) * apLimit;

    // traer paciente básico con contactos
    const patient = await Patient.findByPk(patientId, {
      attributes: ['atr_id_paciente','atr_nombre','atr_apellido','atr_fecha_nacimiento','atr_identidad','atr_numero_expediente','atr_id_genero'],
      include: [
        { model: PatientPhone, as: 'telefonos', attributes: ['atr_telefono'] },
        { model: PatientEmail, as: 'correos', attributes: ['atr_correo'] },
        { model: PatientAddress, as: 'direcciones', attributes: ['atr_direccion_completa'] }
      ]
    });

    if (!patient) return null;

    // traer citas (appointments) paginadas
    const Models = require('../Models');

    const apPromise = Models.Appointment.findAll({
      where: { atr_id_paciente: patientId },
      attributes: ['atr_id_cita', 'atr_fecha_cita', 'atr_hora_cita', 'atr_motivo_cita', 'atr_id_estado', 'atr_id_medico'],
      include: [{ model: Models.Doctor, as: 'Doctor', attributes: ['atr_id_medico', 'atr_nombre_medico'] }],
      order: [['atr_fecha_cita', 'DESC'], ['atr_hora_cita', 'DESC']],
      limit: apLimit,
      offset: apOffset
    });

    // paginación para consultas, tratamientos y órdenes de examen
    const consPage = options.consultations_page ? parseInt(options.consultations_page, 10) : 1;
    const consLimit = options.consultations_limit ? parseInt(options.consultations_limit, 10) : 50;
    const consOffset = (consPage - 1) * consLimit;

    const trPage = options.treatments_page ? parseInt(options.treatments_page, 10) : 1;
    const trLimit = options.treatments_limit ? parseInt(options.treatments_limit, 10) : 50;
    const trOffset = (trPage - 1) * trLimit;

    const ordPage = options.orders_page ? parseInt(options.orders_page, 10) : 1;
    const ordLimit = options.orders_limit ? parseInt(options.orders_limit, 10) : 20;
    const ordOffset = (ordPage - 1) * ordLimit;

    // consultas médicas con sus tratamientos, exámenes y recetas, paginadas
    const consultasPromise = Models.Consultation.findAll({
      where: { atr_id_paciente: patientId },
      attributes: [
        'atr_id_consulta',
        'atr_fecha_consulta',
        'atr_sintomas_paciente',
        'atr_diagnostico',
        'atr_observaciones',
        'atr_notas_clinicas',
        'atr_peso',
        'atr_altura',
        'atr_temperatura',
        'atr_seguimiento',
        'atr_sig_visit_dia'
      ],
      include: [
        // Doctor que atendió la consulta
        {
          model: Models.Doctor,
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre_medico', 'atr_apellido_medico']
        },
        // Tratamientos asociados a la consulta
        {
          model: Models.Treatment,
          as: 'tratamientos',
          attributes: ['atr_id_tratamiento', 'atr_fecha_inicio', 'atr_fecha_fin', 'atr_diagnostico', 'atr_observaciones'],
          separate: true,
          limit: trLimit,
          offset: trOffset,
          include: [
            { model: Models.TreatmentProcedure, as: 'Procedures' }
          ]
        },
        // Órdenes de examen asociadas a la consulta
        {
          model: Models.OrdenExamen,
          as: 'ordenesExamen',
          attributes: ['atr_id_orden_exa', 'atr_fecha_solicitud', 'atr_resultados_disponibles'],
          separate: true,
          include: [
            {
              model: Models.OrdenExamenDetalle,
              as: 'detalles',
              include: [
                {
                  model: Models.Examen,
                  as: 'examen',
                  attributes: ['atr_id_examen', 'atr_nombre_examen', 'atr_descripcion']
                }
              ]
            }
          ]
        },
        // Recetas médicas asociadas a la consulta
        {
          model: Models.Receta,
          as: 'recetas',
          attributes: ['atr_id_receta', 'atr_fecha_receta'],
          separate: true,
          include: [
            {
              model: Models.Medicamento,
              as: 'medicamentos',
              attributes: ['atr_id_medicamento', 'atr_nombre_medicamento', 'atr_dosis', 'atr_frecuencia', 'atr_duracion']
            }
          ]
        }
      ],
      order: [['atr_fecha_consulta', 'DESC']],
      separate: true,
      limit: consLimit,
      offset: consOffset
    });

    // Ordenes de examen del paciente con detalles y examen
    const ordenesPromise = Models.OrdenExamen.findAll({
      where: { atr_id_paciente: patientId },
      attributes: ['atr_id_orden_exa', 'atr_fecha_solicitud', 'atr_resultados_disponibles', 'atr_id_medico'],
      include: [
        {
          model: Models.OrdenExamenDetalle,
          as: 'detalles',
          include: [ { model: Models.Examen, as: 'examen' } ]
        }
      ],
      order: [['atr_fecha_solicitud', 'DESC']],
      separate: true,
      limit: ordLimit,
      offset: ordOffset
    });

    // Tratamientos generales del paciente (no por consulta)
    const treatmentsPromise = Models.Treatment.findAll({
      where: { atr_id_paciente: patientId },
      include: [{ model: Models.TreatmentProcedure, as: 'Procedures' }],
      order: [['atr_fecha_inicio', 'DESC']],
      separate: true,
      limit: trLimit,
      offset: trOffset
    });

    const [appointments, consultas, ordenesExamen, treatments] = await Promise.all([
      apPromise,
      consultasPromise,
      ordenesPromise,
      treatmentsPromise
    ]);

    // obtener totales para meta (counts)
    const countsPromises = [
      Models.Appointment.count({ where: { atr_id_paciente: patientId } }),
      Models.Consultation.count({ where: { atr_id_paciente: patientId } }),
      Models.Treatment.count({ where: { atr_id_paciente: patientId } }),
      Models.OrdenExamen.count({ where: { atr_id_paciente: patientId } })
    ];

    const [appointmentsTotal, consultationsTotal, treatmentsTotal, ordersTotal] = await Promise.all(countsPromises);

    // Construir respuesta para historial con meta/paginación
    return {
      patient,
      expediente: {
        numero: patient.atr_numero_expediente
      },
      historialConsulta: consultas || [],
      citas: appointments || [],
      examenes: ordenesExamen || [],
      tratamientos: treatments || [],
      meta: {
        counts: {
          appointments: appointmentsTotal,
          consultations: consultationsTotal,
          treatments: treatmentsTotal,
          orders: ordersTotal
        },
        pagination: {
          appointments: { page: apPage, pageSize: apLimit, pages: apLimit ? Math.ceil(appointmentsTotal / apLimit) : 0 },
          consultations: { page: consPage, pageSize: consLimit, pages: consLimit ? Math.ceil(consultationsTotal / consLimit) : 0 },
          treatments: { page: trPage, pageSize: trLimit, pages: trLimit ? Math.ceil(treatmentsTotal / trLimit) : 0 },
          orders: { page: ordPage, pageSize: ordLimit, pages: ordLimit ? Math.ceil(ordersTotal / ordLimit) : 0 }
        },
        retrievedAt: new Date()
      }
    };
  },
  updatePatient,
  deletePatient
};
