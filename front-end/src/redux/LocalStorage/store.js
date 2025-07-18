import { configureStore } from '@reduxjs/toolkit';
import appointmentsReducer from '../appointments/appointmentsSlice';

const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    // Puedes agregar más reducers aquí
  },
});

export default store;
