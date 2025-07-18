import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/appointmentService';

export const listAppointments = createAsyncThunk('appointments/list', api.fetchAppointments);
export const addAppointment    = createAsyncThunk('appointments/add', api.createAppointment);
export const confirmApp        = createAsyncThunk('appointments/confirm', api.confirmAppointment);
export const rescheduleApp     = createAsyncThunk('appointments/reschedule', async ({id,data}) => api.rescheduleAppointment(id,data));
export const cancelApp         = createAsyncThunk('appointments/cancel', async ({id,reason}) => api.cancelAppointment(id,reason));

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(listAppointments.pending, state => { state.status = 'loading'; })
      .addCase(listAppointments.fulfilled, (state,action) => { state.list = action.payload.data; state.status = 'succeeded'; })
      .addCase(listAppointments.rejected, (state,action) => { state.status = 'failed'; state.error = action.error.message; });
  }
});

export default appointmentsSlice.reducer;