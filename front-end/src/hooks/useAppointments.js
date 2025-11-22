// src/hooks/useAppointments.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAppointments as apiFetchAppointments,
  getCalendarAppointments as apiGetCalendarAppointments,
  createAppointment as apiCreateAppointment,
  updateAppointment as apiUpdateAppointment,
  getAppointment as apiGetAppointment,
  deleteAppointment as apiDeleteAppointment,
  updateAppointmentStatus as apiUpdateAppointmentStatus,
  rescheduleAppointment as apiRescheduleAppointment,
  getPatients as apiGetPatients,
  getDoctors as apiGetDoctors,
  formatAppointmentForCalendar,
  formatFormDataForBackend,
} from '../services/appointmentService';
import { APPOINTMENT_STATUS } from '../config/appointmentStatus';

// Normaliza respuestas del backend (admite {data: {data: [...]}} o {data: [...]})
const unwrapList = (res) => res?.data?.data ?? res?.data ?? [];
const unwrapItem = (res) => res?.data?.data ?? res?.data ?? res;

const getEventColor = (status) => {
  switch (status) {
    case APPOINTMENT_STATUS.PROGRAMADA:
      return '#2196f3'; // Blue
    case APPOINTMENT_STATUS.CONFIRMADA:
      return '#4caf50'; // Green
    case APPOINTMENT_STATUS.EN_CONSULTA:
      return '#ff9800'; // Orange
    case APPOINTMENT_STATUS.FINALIZADA:
      return '#9c27b0'; // Purple
    case APPOINTMENT_STATUS.CANCELADA:
      return '#f44336'; // Red
    case APPOINTMENT_STATUS.NO_ASISTIO:
      return '#795548'; // Brown
    case APPOINTMENT_STATUS.PENDIENTE_PAGO:
      return '#ff5722'; // Deep Orange
    default:
      return '#607d8b'; // Blue Grey
  }
};

export default function useAppointments(options = {}) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(options.initialSearch || '');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadAppointments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchAppointments(filters);
      const list = unwrapList(res).map((a) => formatAppointmentForCalendar(a));
      setAppointments(list);
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendarAppointments = useCallback(async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetCalendarAppointments(start, end);
      const list = unwrapList(res);
      
      // Add colors to events based on status
      const eventsWithColors = list.map(event => ({
        ...event,
        backgroundColor: getEventColor(event.extendedProps?.statusName || event.extendedProps?.status),
        borderColor: getEventColor(event.extendedProps?.statusName || event.extendedProps?.status),
        textColor: '#ffffff'
      }));
      
      return eventsWithColors;
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar las citas del calendario');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      const res = await apiGetPatients();
      setPatients(unwrapList(res));
    } catch (e) {
      // opcional: mantener error global
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    try {
      const res = await apiGetDoctors();
      setDoctors(unwrapList(res));
    } catch (e) {
      // opcional: mantener error global
    }
  }, []);

  const getAppointmentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetAppointment(id);
      return unwrapItem(res);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo obtener la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAppointment = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = formatFormDataForBackend(formData);
      const res = await apiCreateAppointment(payload);
      const created = formatAppointmentForCalendar(unwrapItem(res));
      setAppointments((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo crear la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAppointment = useCallback(async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = formatFormDataForBackend(formData);
      const res = await apiUpdateAppointment(id, payload);
      const updated = formatAppointmentForCalendar(unwrapItem(res));
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      return updated;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo actualizar la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo eliminar la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiUpdateAppointmentStatus(id, APPOINTMENT_STATUS.CONFIRMADA);
      const confirmed = formatAppointmentForCalendar(unwrapItem(res));
      setAppointments((prev) => prev.map((a) => (a.id === confirmed.id ? confirmed : a)));
      return confirmed;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo confirmar la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const rescheduleAppointment = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRescheduleAppointment(id, data);
      const r = formatAppointmentForCalendar(unwrapItem(res));
      setAppointments((prev) => prev.map((a) => (a.id === r.id ? r : a)));
      return r;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo reprogramar la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiUpdateAppointmentStatus(id, APPOINTMENT_STATUS.CANCELADA);
      const canceled = formatAppointmentForCalendar(unwrapItem(res));
      setAppointments((prev) => prev.map((a) => (a.id === canceled.id ? canceled : a)));
      return canceled;
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo cancelar la cita';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase();
    if (!q) return appointments;
    return appointments.filter((r) =>
      (r.title || '').toLowerCase().includes(q) ||
      String(r.status || '').toLowerCase().includes(q)
    );
  }, [appointments, search]);

  return {
    // estado
    appointments,
    patients,
    doctors,
    loading,
    error,
    search,
    filtered,
    selectedPatient,

    // setters
    setSearch,
    setSelectedPatient,
    reload: loadAppointments,
    loadCalendar: loadCalendarAppointments,

    // acciones
    createAppointment,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    confirmAppointment,
    rescheduleAppointment,
    cancelAppointment,
  };
}

