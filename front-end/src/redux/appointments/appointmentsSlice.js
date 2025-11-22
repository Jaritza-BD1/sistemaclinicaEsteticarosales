// src/redux/appointments/appointmentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as appointmentApi from '../../services/appointmentService';

// Thunks para operaciones CRUD de citas
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.fetchAppointments();
      // Formatear las citas para el calendario
      const formattedAppointments = response.data.data.map(appointment => 
        appointmentApi.formatAppointmentForCalendar(appointment)
      );
      return formattedAppointments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const formattedData = appointmentApi.formatFormDataForBackend(appointmentData);
      const response = await appointmentApi.createAppointment(formattedData);
      const formattedAppointment = appointmentApi.formatAppointmentForCalendar(response.data.data);
      return formattedAppointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const formattedData = appointmentApi.formatFormDataForBackend(updatedData);
      const response = await appointmentApi.updateAppointment(id, formattedData);
      const formattedAppointment = appointmentApi.formatAppointmentForCalendar(response.data.data);
      return formattedAppointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { rejectWithValue }) => {
    try {
      await appointmentApi.deleteAppointment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Thunks para operaciones específicas
export const confirmApp = createAsyncThunk(
  'appointments/confirm',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.confirmAppointment(id);
      const formattedAppointment = appointmentApi.formatAppointmentForCalendar(response.data.data);
      return formattedAppointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const rescheduleApp = createAsyncThunk(
  'appointments/reschedule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.rescheduleAppointment(id, data);
      const formattedAppointment = appointmentApi.formatAppointmentForCalendar(response.data.data);
      return formattedAppointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const cancelApp = createAsyncThunk(
  'appointments/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.cancelAppointment(id, reason);
      const formattedAppointment = appointmentApi.formatAppointmentForCalendar(response.data.data);
      return formattedAppointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Thunks para datos de formulario
export const fetchPatients = createAsyncThunk(
  'appointments/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.getPatients();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchDoctors = createAsyncThunk(
  'appointments/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.getDoctors();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Thunks para operaciones de pagos
export const loadPendingPayments = createAsyncThunk(
  'appointments/loadPendingPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const pendingPayments = await appointmentApi.fetchPendingPayments(params);
      // Las citas ya vienen formateadas del backend con los campos correctos
      return pendingPayments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const payAppointmentThunk = createAsyncThunk(
  'appointments/payAppointment',
  async ({ appointmentId, paymentData = {} }, { rejectWithValue }) => {
    try {
      const result = await appointmentApi.payAppointment(appointmentId, paymentData);
      // El resultado ya viene formateado del backend
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    items: [], // Lista principal de citas (usada por el calendario)
    patients: [], // Lista de pacientes para formularios
    doctors: [], // Lista de médicos para formularios
    pendingPayments: [], // Lista de citas pendientes de pago
    status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // Mensaje de error
    paymentStatus: 'idle', // Estado de operaciones de pago: 'idle', 'loading', 'succeeded', 'failed'
    paymentError: null, // Mensaje de error específico para pagos
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAppointments: (state) => {
      state.items = [];
    },
    clearPaymentError: (state) => {
      state.paymentError = null;
    },
    clearPendingPayments: (state) => {
      state.pendingPayments = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchAppointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para createAppointment
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updateAppointment
      .addCase(updateAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para deleteAppointment
      .addCase(deleteAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para confirmApp
      .addCase(confirmApp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(confirmApp.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(confirmApp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para rescheduleApp
      .addCase(rescheduleApp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(rescheduleApp.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(rescheduleApp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para cancelApp
      .addCase(cancelApp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(cancelApp.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(cancelApp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para fetchPatients
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patients = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para fetchDoctors
      .addCase(fetchDoctors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para loadPendingPayments
      .addCase(loadPendingPayments.pending, (state) => {
        state.paymentStatus = 'loading';
        state.paymentError = null;
      })
      .addCase(loadPendingPayments.fulfilled, (state, action) => {
        state.pendingPayments = action.payload;
        state.paymentStatus = 'succeeded';
        state.paymentError = null;
      })
      .addCase(loadPendingPayments.rejected, (state, action) => {
        state.paymentStatus = 'failed';
        state.paymentError = action.payload;
      })

      // Casos para payAppointmentThunk
      .addCase(payAppointmentThunk.pending, (state) => {
        state.paymentStatus = 'loading';
        state.paymentError = null;
      })
      .addCase(payAppointmentThunk.fulfilled, (state, action) => {
        // Remover la cita de pendingPayments si existe
        state.pendingPayments = state.pendingPayments.filter(item => item.atr_id_cita !== action.payload.atr_id_cita);
        // Actualizar la cita en items si existe
        const index = state.items.findIndex(item => item.atr_id_cita === action.payload.atr_id_cita);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.paymentStatus = 'succeeded';
        state.paymentError = null;
      })
      .addCase(payAppointmentThunk.rejected, (state, action) => {
        state.paymentStatus = 'failed';
        state.paymentError = action.payload;
      });
  },
});

export const { clearError, clearAppointments, clearPaymentError, clearPendingPayments } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;