// src/redux/exams/examsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as examApi from '../../services/examService';

// Thunks para operaciones CRUD de exámenes
export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await examApi.fetchExams();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createExam = createAsyncThunk(
  'exams/createExam',
  async (examData, { rejectWithValue }) => {
    try {
      const formattedData = examApi.formatFormDataForBackend(examData);
      const response = await examApi.createExam(formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateExam = createAsyncThunk(
  'exams/updateExam',
  async ({ id, examData }, { rejectWithValue }) => {
    try {
      const formattedData = examApi.formatFormDataForBackend(examData);
      const response = await examApi.updateExam(id, formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteExam = createAsyncThunk(
  'exams/deleteExam',
  async (id, { rejectWithValue }) => {
    try {
      await examApi.deleteExam(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateExamResults = createAsyncThunk(
  'exams/updateExamResults',
  async ({ id, resultsData }, { rejectWithValue }) => {
    try {
      const formattedData = examApi.formatResultsForBackend(resultsData);
      const response = await examApi.updateExamResults(id, formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getExamStats = createAsyncThunk(
  'exams/getExamStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await examApi.getExamStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getExamsByPatient = createAsyncThunk(
  'exams/getExamsByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await examApi.getExamsByPatient(patientId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getExamsByDoctor = createAsyncThunk(
  'exams/getExamsByDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await examApi.getExamsByDoctor(doctorId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const examsSlice = createSlice({
  name: 'exams',
  initialState: {
    items: [], // Lista principal de exámenes
    stats: null, // Estadísticas de exámenes
    patientExams: [], // Exámenes por paciente
    doctorExams: [], // Exámenes por médico
    status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // Mensaje de error
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExams: (state) => {
      state.items = [];
    },
    clearPatientExams: (state) => {
      state.patientExams = [];
    },
    clearDoctorExams: (state) => {
      state.doctorExams = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchExams
      .addCase(fetchExams.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para createExam
      .addCase(createExam.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createExam.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updateExam
      .addCase(updateExam.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.atr_id_examen === action.payload.atr_id_examen);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para deleteExam
      .addCase(deleteExam.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.atr_id_examen !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteExam.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updateExamResults
      .addCase(updateExamResults.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateExamResults.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.atr_id_examen === action.payload.atr_id_examen);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateExamResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getExamStats
      .addCase(getExamStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getExamStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getExamStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getExamsByPatient
      .addCase(getExamsByPatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getExamsByPatient.fulfilled, (state, action) => {
        state.patientExams = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getExamsByPatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getExamsByDoctor
      .addCase(getExamsByDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getExamsByDoctor.fulfilled, (state, action) => {
        state.doctorExams = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getExamsByDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearExams, 
  clearPatientExams, 
  clearDoctorExams 
} = examsSlice.actions;
export default examsSlice.reducer; 