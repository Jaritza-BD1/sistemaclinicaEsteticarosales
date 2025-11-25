// src/redux/doctors/doctorsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as doctorApi from '../../services/doctorService';

// Thunks para operaciones CRUD de médicos
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await doctorApi.fetchDoctors(params);
      // Normalizar distintas estructuras: { data: { data: [...], meta: {...} } } o { data: [...], meta: {...} } o array
      let items = [];
      let meta = {};
      if (!response) {
        items = [];
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response.data) {
        // response.data puede ser el array o un objeto con data/meta
        items = response.data.data ?? response.data.items ?? response.data;
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

export const createDoctor = createAsyncThunk(
  'doctors/createDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const formattedData = doctorApi.formatFormDataForBackend(doctorData);
      const response = await doctorApi.createDoctor(formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateDoctor = createAsyncThunk(
  'doctors/updateDoctor',
  async ({ id, doctorData }, { rejectWithValue }) => {
    try {
      const formattedData = doctorApi.formatFormDataForBackend(doctorData);
      const response = await doctorApi.updateDoctor(id, formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  'doctors/deleteDoctor',
  async (id, { rejectWithValue }) => {
    try {
      await doctorApi.deleteDoctor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getActiveDoctors = createAsyncThunk(
  'doctors/getActiveDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await doctorApi.getActiveDoctors();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState: {
    items: [], // Lista principal de médicos
    activeDoctors: [], // Lista de médicos activos para formularios
    status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // Mensaje de error
    // Meta para paginación server-side
    total: 0,
    page: 1,
    pageSize: 10,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDoctors: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchDoctors
      .addCase(fetchDoctors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items ?? [];
        // actualizar meta si viene
        state.total = action.payload.meta?.total ?? state.total;
        state.page = action.meta?.arg?.page ?? action.payload.meta?.page ?? state.page;
        state.pageSize = action.meta?.arg?.pageSize ?? action.payload.meta?.pageSize ?? state.pageSize;
        state.error = null;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para createDoctor
      .addCase(createDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updateDoctor
      .addCase(updateDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.atr_id_medico === action.payload.atr_id_medico);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para deleteDoctor
      .addCase(deleteDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.atr_id_medico !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getActiveDoctors
      .addCase(getActiveDoctors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getActiveDoctors.fulfilled, (state, action) => {
        state.activeDoctors = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getActiveDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDoctors } = doctorsSlice.actions;
export default doctorsSlice.reducer; 