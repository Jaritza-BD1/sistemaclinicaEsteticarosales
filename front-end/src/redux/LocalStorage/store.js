import { configureStore } from '@reduxjs/toolkit';
import appointmentsReducer from '../appointments/appointmentsSlice';
import doctorsReducer from '../doctors/doctorsSlice';
import patientsReducer from '../patients/patientsSlice';
import treatmentsReducer from '../treatments/treatmentsSlice';
import examsReducer from '../exams/examsSlice';
import pharmacyReducer from '../pharmacy/pharmacySlice';
import consultationsReducer from '../consultations/consultationsSlice';

const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
    patients: patientsReducer,
    treatments: treatmentsReducer,
    exams: examsReducer,
    pharmacy: pharmacyReducer,
    consultations: consultationsReducer,
    // Puedes agregar más reducers aquí
  },
});

export default store;
