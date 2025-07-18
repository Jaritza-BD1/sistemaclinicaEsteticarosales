export const selectAllAppointments   = state => state.appointments.list;
export const selectAppointmentById   = (state,id) => state.appointments.list.find(app => app.atr_id_cita === Number(id));
