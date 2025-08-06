export const selectAllAppointments = state => state.appointments.items || [];
export const selectAppointmentById = (state, id) => (state.appointments.items || []).find(app => app.atr_id_cita === Number(id));
