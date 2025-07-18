// File: src/components/appointments/ScheduleAppointment.jsx
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { addAppointment } from '../../redux/appointments/appointmentsSlice';

const validationSchema = Yup.object({
  atr_id_paciente: Yup.number().required(),
  atr_id_medico:   Yup.number().required(),
  atr_fecha_cita:  Yup.date().required(),
  atr_hora_cita:   Yup.string().matches(/^\d{2}:\d{2}$/, 'Formato HH:mm').required(),
  atr_id_tipo_cita:Yup.number().required(),
  atr_motivo_cita: Yup.string().max(100).required()
});

export default function ScheduleAppointment() {
  const dispatch = useDispatch();
  const formik   = useFormik({
    initialValues: { atr_id_paciente:'', atr_id_medico:'', atr_fecha_cita:'', atr_hora_cita:'', atr_id_tipo_cita:'', atr_motivo_cita:'' },
    validationSchema,
    onSubmit: async(values,{setSubmitting,setErrors}) => {
      try { await dispatch(addAppointment(values)).unwrap(); }
      catch(err){ setErrors({submit:err.message}); }
      finally { setSubmitting(false); }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="app-form">
      {/* Inputs with formik.getFieldProps and error displays */}
      <button type="submit" disabled={formik.isSubmitting}>Agendar</button>
      {formik.errors.submit && <div className="error">{formik.errors.submit}</div>}
    </form>
  );
}
