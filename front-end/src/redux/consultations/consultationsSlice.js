import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as consultationApi from '../../services/consultationService';

// Thunks principales
export const fetchConsultationByAppointment = createAsyncThunk(
  'consultations/fetchByAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await consultationApi.getConsultationByAppointment(appointmentId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchConsultation = createAsyncThunk(
  'consultations/fetch',
  async (consultationId, { rejectWithValue }) => {
    try {
      const response = await consultationApi.getConsultation(consultationId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchAllConsultations = createAsyncThunk(
  'consultations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await consultationApi.fetchAllConsultations(params);
      // normalize response similar to other slices: { items, meta }
      let items = [];
      let meta = {};
      if (!response) {
        items = [];
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response.data) {
        items = response.data.data ?? response.data.items ?? response.data ?? [];
        meta = response.data.meta ?? response.data.pagination ?? {};
      } else {
        items = response.data ?? response;
      }
      return { items, meta };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createConsultation = createAsyncThunk(
  'consultations/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await consultationApi.createConsultation(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateConsultation = createAsyncThunk(
  'consultations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await consultationApi.updateConsultation(id, data);
      return { id, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const finishConsultation = createAsyncThunk(
  'consultations/finish',
  async ({ consultationId, data } = {}, { rejectWithValue }) => {
    try {
      // `data` is optional; backend endpoint currently doesn't require a body for finish
      const response = await consultationApi.finishConsultation(consultationId);
      return { consultationId, result: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Thunks para exámenes
export const addExams = createAsyncThunk(
  'consultations/addExams',
  async ({ consultationId, data }, { rejectWithValue }) => {
    try {
      const response = await consultationApi.createExamOrder(consultationId, data);
      return { consultationId, exams: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchExams = createAsyncThunk(
  'consultations/fetchExams',
  async (consultationId, { rejectWithValue }) => {
    try {
      const response = await consultationApi.getExamOrders(consultationId);
      return { consultationId, exams: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Thunks para recetas
export const addPrescription = createAsyncThunk(
  'consultations/addPrescription',
  async ({ consultationId, data }, { rejectWithValue }) => {
    try {
      const response = await consultationApi.createPrescription(consultationId, data);
      return { consultationId, prescription: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPrescriptions = createAsyncThunk(
  'consultations/fetchPrescriptions',
  async (consultationId, { rejectWithValue }) => {
    try {
      const response = await consultationApi.getPrescriptions(consultationId);
      return { consultationId, prescriptions: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updatePrescriptionStatus = createAsyncThunk(
  'consultations/updatePrescriptionStatus',
  async ({ prescriptionId, data }, { rejectWithValue }) => {
    try {
      const response = await consultationApi.updatePrescriptionStatus(prescriptionId, data);
      return { prescriptionId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Thunks para tratamientos
export const addTreatments = createAsyncThunk(
  'consultations/addTreatments',
  async ({ consultationId, data }, { rejectWithValue }) => {
    try {
      const response = await consultationApi.createTreatments(consultationId, data);
      return { consultationId, treatments: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTreatments = createAsyncThunk(
  'consultations/fetchTreatments',
  async (consultationId, { rejectWithValue }) => {
    try {
      const response = await consultationApi.getTreatments(consultationId);
      return { consultationId, treatments: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateTreatmentSession = createAsyncThunk(
  'consultations/updateTreatmentSession',
  async ({ sessionId, data }, { rejectWithValue }) => {
    try {
      const response = await consultationApi.updateTreatmentSession(sessionId, data);
      return { sessionId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState: {
    // Consultas principales
    consultations: {}, // { [consultationId]: consultation }
    consultationsByAppointment: {}, // { [appointmentId]: consultation }
    consultationsByPatient: {}, // { [patientId]: [consultationIds] }

    // Datos relacionados
    exams: {}, // { [consultationId]: [exams] }
    prescriptions: {}, // { [consultationId]: [prescriptions] }
    treatments: {}, // { [consultationId]: [treatments] }

    // Estados de carga
    loading: {
      fetch: false,
      create: false,
      update: false,
      finish: false,
      exams: false,
      prescriptions: false,
      treatments: false
    },

    // Errores
    errors: {
      fetch: null,
      create: null,
      update: null,
      finish: null,
      exams: null,
      prescriptions: null,
      treatments: null
    }
    ,
    // meta para paginación server-side
    meta: {
      total: 0,
      page: 1,
      pageSize: 10
    }
  },
  reducers: {
    clearConsultationData: (state, action) => {
      const consultationId = action.payload;
      delete state.consultations[consultationId];
      delete state.exams[consultationId];
      delete state.prescriptions[consultationId];
      delete state.treatments[consultationId];
    },
    clearErrors: (state) => {
      state.errors = {
        fetch: null,
        create: null,
        update: null,
        finish: null,
        exams: null,
        prescriptions: null,
        treatments: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchConsultationByAppointment
      .addCase(fetchConsultationByAppointment.pending, (state) => {
        state.loading.fetch = true;
        state.errors.fetch = null;
      })
      .addCase(fetchConsultationByAppointment.fulfilled, (state, action) => {
        const consultation = action.payload;
        if (consultation) {
          state.consultations[consultation.atr_id_consulta] = consultation;
          state.consultationsByAppointment[consultation.atr_id_cita] = consultation.atr_id_consulta;

          // Agregar a lista por paciente
          const patientId = consultation.atr_id_paciente;
          if (!state.consultationsByPatient[patientId]) {
            state.consultationsByPatient[patientId] = [];
          }
          if (!state.consultationsByPatient[patientId].includes(consultation.atr_id_consulta)) {
            state.consultationsByPatient[patientId].unshift(consultation.atr_id_consulta);
          }
        }
        state.loading.fetch = false;
      })
      .addCase(fetchConsultationByAppointment.rejected, (state, action) => {
        state.loading.fetch = false;
        state.errors.fetch = action.payload;
      })

      // fetchConsultation
      .addCase(fetchConsultation.pending, (state) => {
        state.loading.fetch = true;
        state.errors.fetch = null;
      })
      .addCase(fetchConsultation.fulfilled, (state, action) => {
        const consultation = action.payload;
        if (consultation) {
          state.consultations[consultation.atr_id_consulta] = consultation;
        }
        state.loading.fetch = false;
      })
      .addCase(fetchConsultation.rejected, (state, action) => {
        state.loading.fetch = false;
        state.errors.fetch = action.payload;
      })

      // fetchAllConsultations
      .addCase(fetchAllConsultations.pending, (state) => {
        state.loading.fetch = true;
        state.errors.fetch = null;
      })
      .addCase(fetchAllConsultations.fulfilled, (state, action) => {
        const payload = action.payload || { items: [], meta: {} };
        const consultations = payload.items || [];
        // replace consultations map with server result (to keep server-side paging consistent)
        state.consultations = {};
        consultations.forEach(consultation => {
          const id = consultation?.atr_id_consulta ?? consultation?.id;
          if (!id) return;
          state.consultations[id] = consultation;
          // also populate consultationsByPatient for convenience
          const patientId = consultation?.atr_id_paciente ?? consultation?.patientId ?? consultation?.paciente?.atr_id_paciente;
          if (patientId) {
            if (!state.consultationsByPatient[patientId]) state.consultationsByPatient[patientId] = [];
            if (!state.consultationsByPatient[patientId].includes(id)) {
              state.consultationsByPatient[patientId].push(id);
            }
          }
        });
        // update meta
        state.meta = {
          total: payload.meta?.total ?? payload.meta?.count ?? state.meta.total,
          page: action.meta?.arg?.page ?? payload.meta?.page ?? state.meta.page,
          pageSize: action.meta?.arg?.pageSize ?? payload.meta?.pageSize ?? state.meta.pageSize
        };
        state.loading.fetch = false;
      })
      .addCase(fetchAllConsultations.rejected, (state, action) => {
        state.loading.fetch = false;
        state.errors.fetch = action.payload;
      })

      // createConsultation
      .addCase(createConsultation.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        const consultation = action.payload;
        if (consultation) {
          state.consultations[consultation.atr_id_consulta] = consultation;
          state.consultationsByAppointment[consultation.atr_id_cita] = consultation.atr_id_consulta;

          // Agregar a lista por paciente
          const patientId = consultation.atr_id_paciente;
          if (!state.consultationsByPatient[patientId]) {
            state.consultationsByPatient[patientId] = [];
          }
          state.consultationsByPatient[patientId].unshift(consultation.atr_id_consulta);
        }
        state.loading.create = false;
      })
      .addCase(createConsultation.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
      })

      // updateConsultation
      .addCase(updateConsultation.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
      })
      .addCase(updateConsultation.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        if (state.consultations[id]) {
          state.consultations[id] = { ...state.consultations[id], ...data };
        }
        state.loading.update = false;
      })
      .addCase(updateConsultation.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      })

      // finishConsultation
      .addCase(finishConsultation.pending, (state) => {
        state.loading.finish = true;
        state.errors.finish = null;
      })
      .addCase(finishConsultation.fulfilled, (state, action) => {
        const { consultationId, result } = action.payload;
        if (state.consultations[consultationId]) {
          // Actualizar la consulta con los datos finales
          state.consultations[consultationId] = {
            ...state.consultations[consultationId],
            ...result.consulta
          };
        }
        state.loading.finish = false;
      })
      .addCase(finishConsultation.rejected, (state, action) => {
        state.loading.finish = false;
        state.errors.finish = action.payload;
      })

      // addExams
      .addCase(addExams.pending, (state) => {
        state.loading.exams = true;
        state.errors.exams = null;
      })
      .addCase(addExams.fulfilled, (state, action) => {
        const { consultationId, exams } = action.payload;
        if (!state.exams[consultationId]) {
          state.exams[consultationId] = [];
        }
        state.exams[consultationId].push(...exams);
        state.loading.exams = false;
      })
      .addCase(addExams.rejected, (state, action) => {
        state.loading.exams = false;
        state.errors.exams = action.payload;
      })

      // fetchExams
      .addCase(fetchExams.pending, (state) => {
        state.loading.exams = true;
        state.errors.exams = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        const { consultationId, exams } = action.payload;
        state.exams[consultationId] = exams;
        state.loading.exams = false;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading.exams = false;
        state.errors.exams = action.payload;
      })

      // addPrescription
      .addCase(addPrescription.pending, (state) => {
        state.loading.prescriptions = true;
        state.errors.prescriptions = null;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        const { consultationId, prescription } = action.payload;
        if (!state.prescriptions[consultationId]) {
          state.prescriptions[consultationId] = [];
        }
        state.prescriptions[consultationId].push(prescription);
        state.loading.prescriptions = false;
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.loading.prescriptions = false;
        state.errors.prescriptions = action.payload;
      })

      // fetchPrescriptions
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading.prescriptions = true;
        state.errors.prescriptions = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        const { consultationId, prescriptions } = action.payload;
        state.prescriptions[consultationId] = prescriptions;
        state.loading.prescriptions = false;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading.prescriptions = false;
        state.errors.prescriptions = action.payload;
      })

      // updatePrescriptionStatus
      .addCase(updatePrescriptionStatus.fulfilled, (state, action) => {
        const { prescriptionId, data } = action.payload;
        // Actualizar el estado de la receta en todas las consultas
        Object.keys(state.prescriptions).forEach(consultationId => {
          const prescriptions = state.prescriptions[consultationId];
          const index = prescriptions.findIndex(p => p.atr_id_receta === prescriptionId);
          if (index !== -1) {
            prescriptions[index] = { ...prescriptions[index], ...data };
          }
        });
      })

      // addTreatments
      .addCase(addTreatments.pending, (state) => {
        state.loading.treatments = true;
        state.errors.treatments = null;
      })
      .addCase(addTreatments.fulfilled, (state, action) => {
        const { consultationId, treatments } = action.payload;
        if (!state.treatments[consultationId]) {
          state.treatments[consultationId] = [];
        }
        state.treatments[consultationId].push(...treatments);
        state.loading.treatments = false;
      })
      .addCase(addTreatments.rejected, (state, action) => {
        state.loading.treatments = false;
        state.errors.treatments = action.payload;
      })

      // fetchTreatments
      .addCase(fetchTreatments.pending, (state) => {
        state.loading.treatments = true;
        state.errors.treatments = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        const { consultationId, treatments } = action.payload;
        state.treatments[consultationId] = treatments;
        state.loading.treatments = false;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.loading.treatments = false;
        state.errors.treatments = action.payload;
      })

      // updateTreatmentSession
      .addCase(updateTreatmentSession.fulfilled, (state, action) => {
        const { sessionId, data } = action.payload;
        // Actualizar la sesión en todos los tratamientos
        Object.keys(state.treatments).forEach(consultationId => {
          const treatments = state.treatments[consultationId];
          treatments.forEach(treatment => {
            if (treatment.Procedures) {
              const procedureIndex = treatment.Procedures.findIndex(p => p.atr_id_procedimiento === sessionId);
              if (procedureIndex !== -1) {
                treatment.Procedures[procedureIndex] = { ...treatment.Procedures[procedureIndex], ...data };
              }
            }
          });
        });
      });
  }
});

export const { clearConsultationData, clearErrors } = consultationsSlice.actions;
export default consultationsSlice.reducer;

// Selectores
export const selectConsultationById = (state, consultationId) =>
  state.consultations.consultations[consultationId];

export const selectConsultationByAppointment = (state, appointmentId) => {
  const consultationId = state.consultations.consultationsByAppointment[appointmentId];
  return consultationId ? state.consultations.consultations[consultationId] : null;
};

export const selectConsultationsByPatient = (state, patientId) =>
  (state.consultations.consultationsByPatient[patientId] || [])
    .map(id => state.consultations.consultations[id])
    .filter(Boolean);

export const selectExamsByConsultation = (state, consultationId) =>
  state.consultations.exams[consultationId] || [];

export const selectPrescriptionsByConsultation = (state, consultationId) =>
  state.consultations.prescriptions[consultationId] || [];

export const selectTreatmentsByConsultation = (state, consultationId) =>
  state.consultations.treatments[consultationId] || [];

export const selectConsultationLoading = (state) => state.consultations.loading;

export const selectConsultationErrors = (state) => state.consultations.errors;

export const selectAllConsultations = (state) =>
  Object.values(state.consultations.consultations || {}).filter(Boolean);

export const selectConsultationsMeta = (state) => state.consultations.meta || { total: 0, page: 1, pageSize: 10 };
