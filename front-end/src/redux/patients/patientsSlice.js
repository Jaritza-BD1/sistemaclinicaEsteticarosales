// src/redux/patients/patientsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as patientApi from '../../services/patientService';

// Thunks (public API for components)
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await patientApi.getPatients(filters);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const formattedData = patientApi.formatFormDataForBackend ? patientApi.formatFormDataForBackend(patientData) : patientData;
      const res = await patientApi.createPatient(formattedData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, patientData }, { rejectWithValue }) => {
    try {
      const formattedData = patientApi.formatFormDataForBackend ? patientApi.formatFormDataForBackend(patientData) : patientData;
      const res = await patientApi.updatePatient(id, formattedData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (id, { rejectWithValue }) => {
    try {
      await patientApi.deletePatient(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getActivePatients = createAsyncThunk(
  'patients/getActivePatients',
  async (_, { rejectWithValue }) => {
    try {
      const res = await patientApi.getActivePatients();
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Fetch individual patient (detail)
export const getPatient = createAsyncThunk(
  'patients/getPatient',
  async (id, { rejectWithValue }) => {
    try {
      const response = await patientApi.getPatientById(id);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// History
export const fetchPatientHistory = createAsyncThunk(
  'patients/fetchPatientHistory',
  async ({ id, params } = {}, { rejectWithValue }) => {
    try {
      const res = await patientApi.getPatientHistory(id, params);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  items: [], // Lista principal de pacientes
  activePatients: [], // Lista de pacientes activos para formularios
  currentPatient: null, // paciente cargado en vista detalle
  currentPatientStatus: 'idle',
  currentPatientError: null,
  itemsById: {}, // cache de pacientes por id
  history: null, // historial cargado
  status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
  error: null // Mensaje de error
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearPatients: (state) => { state.items = []; state.itemsById = {}; },
    clearCurrentPatient: (state) => { state.currentPatient = null; state.currentPatientStatus = 'idle'; state.currentPatientError = null; },
    clearHistory: (state) => { state.history = null; }
  },
  extraReducers: (builder) => {
    builder
      // fetchPatients
      .addCase(fetchPatients.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // support for paginated response or plain array
        if (action.payload && action.payload.rows) {
          state.items = action.payload.rows;
          // populate cache
          const map = {};
          (action.payload.rows || []).forEach(p => { if (p && p.atr_id_paciente) map[p.atr_id_paciente] = p; });
          state.itemsById = map;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
          const map = {};
          action.payload.forEach(p => { if (p && p.atr_id_paciente) map[p.atr_id_paciente] = p; });
          state.itemsById = map;
        }
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // createPatient
      .addCase(createPatient.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (action.payload && action.payload.atr_id_paciente) state.itemsById[action.payload.atr_id_paciente] = action.payload;
        state.status = 'succeeded'; state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // updatePatient
      .addCase(updatePatient.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const idx = state.items.findIndex(item => item.atr_id_paciente === action.payload.atr_id_paciente);
        if (idx !== -1) state.items[idx] = action.payload;
        if (action.payload && action.payload.atr_id_paciente) state.itemsById[action.payload.atr_id_paciente] = action.payload;
        if (state.currentPatient && state.currentPatient.atr_id_paciente === action.payload.atr_id_paciente) state.currentPatient = action.payload;
        state.status = 'succeeded'; state.error = null;
      })
      .addCase(updatePatient.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // deletePatient
      .addCase(deletePatient.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.atr_id_paciente !== action.payload);
        if (action.payload && state.itemsById[action.payload]) delete state.itemsById[action.payload];
        state.status = 'succeeded'; state.error = null;
      })
      .addCase(deletePatient.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // getActivePatients
      .addCase(getActivePatients.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(getActivePatients.fulfilled, (state, action) => { state.activePatients = action.payload; state.status = 'succeeded'; state.error = null; })
      .addCase(getActivePatients.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // getPatient (detail)
      .addCase(getPatient.pending, (state) => { state.currentPatientStatus = 'loading'; state.currentPatientError = null; })
      .addCase(getPatient.fulfilled, (state, action) => {
        state.currentPatientStatus = 'succeeded'; state.currentPatient = action.payload || null; state.currentPatientError = null;
        if (action.payload && action.payload.atr_id_paciente) state.itemsById[action.payload.atr_id_paciente] = action.payload;
      })
      .addCase(getPatient.rejected, (state, action) => { state.currentPatientStatus = 'failed'; state.currentPatientError = action.payload; })

      // fetchPatientHistory
      .addCase(fetchPatientHistory.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchPatientHistory.fulfilled, (state, action) => { state.history = action.payload; state.status = 'succeeded'; state.error = null; })
      .addCase(fetchPatientHistory.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  }
});

export const { clearError, clearPatients, clearCurrentPatient, clearHistory } = patientsSlice.actions;
export default patientsSlice.reducer;