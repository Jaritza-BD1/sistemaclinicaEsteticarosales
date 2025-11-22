// src/redux/hooks/usePayments.js
import { useDispatch, useSelector } from 'react-redux';
import { loadPendingPayments, payAppointmentThunk, clearPaymentError, clearPendingPayments } from '../appointments/appointmentsSlice';

export const usePayments = () => {
  const dispatch = useDispatch();
  const {
    pendingPayments,
    paymentStatus,
    paymentError
  } = useSelector(state => state.appointments);

  const fetchPendingPayments = (params = {}) => {
    dispatch(loadPendingPayments(params));
  };

  const payAppointment = (appointmentId, paymentData = {}) => {
    dispatch(payAppointmentThunk({ appointmentId, paymentData }));
  };

  const clearError = () => {
    dispatch(clearPaymentError());
  };

  const clearPayments = () => {
    dispatch(clearPendingPayments());
  };

  return {
    // State
    pendingPayments,
    isLoading: paymentStatus === 'loading',
    isSuccess: paymentStatus === 'succeeded',
    isError: paymentStatus === 'failed',
    error: paymentError,

    // Actions
    fetchPendingPayments,
    payAppointment,
    clearError,
    clearPayments
  };
};