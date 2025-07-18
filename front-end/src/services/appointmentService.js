// File: src/services/appointmentService.js
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API = axios.create({ baseURL: '/api/appointments' });
API.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchAppointments = () => API.get('/');
export const createAppointment = data => API.post('/', data);
export const confirmAppointment = id => API.put(`/${id}/confirm`);
export const rescheduleAppointment = (id, data) => API.put(`/${id}/reschedule`, data);
export const cancelAppointment = (id, reason) => API.post(`/${id}/cancel`, { reason });
export const sendReminders = () => API.post('/reminders/send');