// src/redux/patients/patientsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as patientApi from '../../services/patientService';

// Thunks para operaciones CRUD de pacientes
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await patientApi.fetchPatients();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData, { rejectWithValue }) => {
    try {
      const formattedData = patientApi.formatFormDataForBackend(patientData);
      const response = await patientApi.createPatient(formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, patientData }, { rejectWithValue }) => {
    try {
      const formattedData = patientApi.formatFormDataForBackend(patientData);
      const response = await patientApi.updatePatient(id, formattedData);
      return response.data.data;
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
      const response = await patientApi.getActivePatients();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState: {
    items: [], // Lista principal de pacientes
    activePatients: [], // Lista de pacientes activos para formularios
    status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // Mensaje de error
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPatients: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchPatients
      .addCase(fetchPatients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para createPatient
      .addCase(createPatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updatePatient
      .addCase(updatePatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.atr_id_paciente === action.payload.atr_id_paciente);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para deletePatient
      .addCase(deletePatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.atr_id_paciente !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getActivePatients
      .addCase(getActivePatients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getActivePatients.fulfilled, (state, action) => {
        state.activePatients = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getActivePatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPatients } = patientsSlice.actions;
export default patientsSlice.reducer; 