import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createAppointment, updateAppointment } from '../../services/appointmentService';
import { fetchPatients } from '../../services/patientService';
import { fetchDoctors } from '../../services/doctorService';

const validationSchema = Yup.object({
  title: Yup.string().required('El motivo es obligatorio'),
  start: Yup.date().required('La fecha y hora es obligatoria').min(new Date(), 'Debe ser futura'),
  status: Yup.string().required('El estado es obligatorio'),
  patientId: Yup.string().required('El paciente es obligatorio'),
  doctorId: Yup.string().required('El médico es obligatorio'),
});

const AppointmentForm = ({ initialData = {}, onSuccess }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchPatients().then(res => setPatients(res.data));
    fetchDoctors().then(res => setDoctors(res.data));
  }, []);

  const formik = useFormik({
    initialValues: {
      title: initialData.title || '',
      start: initialData.start || '',
      status: initialData.status || '',
      patientId: initialData.patientId || '',
      doctorId: initialData.doctorId || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (initialData.id) {
        await updateAppointment({ id: initialData.id, updatedData: values });
      } else {
        await createAppointment(values);
      }
      setSubmitting(false);
      if (onSuccess) onSuccess();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="app-form">
      <div className="form-group">
        <label>Motivo</label>
        <input
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.title && formik.errors.title ? 'input-error' : ''}
          placeholder="Motivo"
        />
        {formik.touched.title && formik.errors.title && (
          <div className="error">{formik.errors.title}</div>
        )}
      </div>
      <div className="form-group">
        <label>Fecha y hora</label>
        <input
          name="start"
          type="datetime-local"
          value={formik.values.start}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.start && formik.errors.start ? 'input-error' : ''}
          placeholder="Fecha y hora"
        />
        {formik.touched.start && formik.errors.start && (
          <div className="error">{formik.errors.start}</div>
        )}
      </div>
      <div className="form-group">
        <label>Estado</label>
        <input
          name="status"
          value={formik.values.status}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.status && formik.errors.status ? 'input-error' : ''}
          placeholder="Estado"
        />
        {formik.touched.status && formik.errors.status && (
          <div className="error">{formik.errors.status}</div>
        )}
      </div>
      <div className="form-group">
        <label>Paciente</label>
        <select
          name="patientId"
          value={formik.values.patientId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.patientId && formik.errors.patientId ? 'input-error' : ''}
        >
          <option value="">Selecciona un paciente</option>
          {patients.map(p => (
            <option key={p.atr_id_paciente} value={p.atr_id_paciente}>
              {p.atr_nombre} {p.atr_apellido} (ID: {p.atr_id_paciente})
            </option>
          ))}
        </select>
        {formik.touched.patientId && formik.errors.patientId && (
          <div className="error">{formik.errors.patientId}</div>
        )}
      </div>
      <div className="form-group">
        <label>Médico</label>
        <select
          name="doctorId"
          value={formik.values.doctorId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={formik.touched.doctorId && formik.errors.doctorId ? 'input-error' : ''}
        >
          <option value="">Selecciona un médico</option>
          {doctors.map(d => (
            <option key={d.atr_id_medico} value={d.atr_id_medico}>
              {d.atr_nombre} {d.atr_apellido} (ID: {d.atr_id_medico})
            </option>
          ))}
        </select>
        {formik.touched.doctorId && formik.errors.doctorId && (
          <div className="error">{formik.errors.doctorId}</div>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
        Guardar
      </button>
    </form>
  );
};

export default AppointmentForm; 