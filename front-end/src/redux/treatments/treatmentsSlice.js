// src/redux/treatments/treatmentsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as treatmentApi from '../../services/treatmentService';

// Thunks para operaciones CRUD de tratamientos
export const fetchTreatments = createAsyncThunk(
  'treatments/fetchTreatments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await treatmentApi.fetchTreatments();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createTreatment = createAsyncThunk(
  'treatments/createTreatment',
  async (treatmentData, { rejectWithValue }) => {
    try {
      const formattedData = treatmentApi.formatFormDataForBackend(treatmentData);
      const response = await treatmentApi.createTreatment(formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateTreatment = createAsyncThunk(
  'treatments/updateTreatment',
  async ({ id, treatmentData }, { rejectWithValue }) => {
    try {
      const formattedData = treatmentApi.formatFormDataForBackend(treatmentData);
      const response = await treatmentApi.updateTreatment(id, formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteTreatment = createAsyncThunk(
  'treatments/deleteTreatment',
  async (id, { rejectWithValue }) => {
    try {
      await treatmentApi.deleteTreatment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getTreatmentStats = createAsyncThunk(
  'treatments/getTreatmentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await treatmentApi.getTreatmentStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getTreatmentsByPatient = createAsyncThunk(
  'treatments/getTreatmentsByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await treatmentApi.getTreatmentsByPatient(patientId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getTreatmentsByDoctor = createAsyncThunk(
  'treatments/getTreatmentsByDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await treatmentApi.getTreatmentsByDoctor(doctorId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const treatmentsSlice = createSlice({
  name: 'treatments',
  initialState: {
    items: [], // Lista principal de tratamientos
    stats: null, // Estadísticas de tratamientos
    patientTreatments: [], // Tratamientos por paciente
    doctorTreatments: [], // Tratamientos por médico
    status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // Mensaje de error
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTreatments: (state) => {
      state.items = [];
    },
    clearPatientTreatments: (state) => {
      state.patientTreatments = [];
    },
    clearDoctorTreatments: (state) => {
      state.doctorTreatments = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchTreatments
      .addCase(fetchTreatments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para createTreatment
      .addCase(createTreatment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createTreatment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createTreatment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updateTreatment
      .addCase(updateTreatment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTreatment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.atr_id_tratamiento === action.payload.atr_id_tratamiento);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateTreatment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para deleteTreatment
      .addCase(deleteTreatment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteTreatment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.atr_id_tratamiento !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteTreatment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getTreatmentStats
      .addCase(getTreatmentStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getTreatmentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getTreatmentStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getTreatmentsByPatient
      .addCase(getTreatmentsByPatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getTreatmentsByPatient.fulfilled, (state, action) => {
        state.patientTreatments = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getTreatmentsByPatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getTreatmentsByDoctor
      .addCase(getTreatmentsByDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getTreatmentsByDoctor.fulfilled, (state, action) => {
        state.doctorTreatments = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getTreatmentsByDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearTreatments, 
  clearPatientTreatments, 
  clearDoctorTreatments 
} = treatmentsSlice.actions;
export default treatmentsSlice.reducer; 