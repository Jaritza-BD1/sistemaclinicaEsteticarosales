// File: src/components/appointments/RescheduleAppointment.jsx
import React from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import { rescheduleApp } from '../../redux/appointments/appointmentsSlice';

const schema = Yup.object({ newDate:Yup.date().required(), newTime:Yup.string().matches(/^\d{2}:\d{2}$/).required(), reason:Yup.string().required() });
export default function RescheduleAppointment({appointmentId}){
  const dispatch=useDispatch();
  const formik=useFormik({initialValues:{newDate:'',newTime:'',reason:''},validationSchema:schema,onSubmit:async(values,{setSubmitting})=>{await dispatch(rescheduleApp({id:appointmentId,data:values})).unwrap();setSubmitting(false);}});
  return (<form onSubmit={formik.handleSubmit}>{/* Fields and submit */}</form>);
}
