import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPatients,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
  fetchPatientHistory,
  getActivePatients,
  clearError,
  clearHistory,
  clearCurrentPatient
} from '../redux/patients/patientsSlice';
import {
  selectPatientList,
  selectPatientsLoading,
  selectPatientsError,
  selectSelectedPatient,
  selectPatientHistory
} from '../redux/patients/patientsSelectors';

export default function usePatients() {
  const dispatch = useDispatch();
  const list = useSelector(selectPatientList);
  const loading = useSelector(selectPatientsLoading);
  const error = useSelector(selectPatientsError);
  const selectedPatient = useSelector(selectSelectedPatient);
  const history = useSelector(selectPatientHistory);

  const loadPatients = useCallback((filters) => dispatch(fetchPatients(filters)), [dispatch]);
  const create = useCallback((data) => dispatch(createPatient(data)), [dispatch]);
  const loadPatient = useCallback((id) => dispatch(getPatient(id)), [dispatch]);
  const update = useCallback((id, patientData) => dispatch(updatePatient({ id, patientData })), [dispatch]);
  const remove = useCallback((id) => dispatch(deletePatient(id)), [dispatch]);
  const loadHistory = useCallback((id, params) => dispatch(fetchPatientHistory({ id, params })), [dispatch]);
  const loadActive = useCallback(() => dispatch(getActivePatients()), [dispatch]);
  const clearErr = useCallback(() => dispatch(clearError()), [dispatch]);
  const clearHist = useCallback(() => dispatch(clearHistory()), [dispatch]);
  const clearSelected = useCallback(() => dispatch(clearCurrentPatient()), [dispatch]);

  return {
    list,
    loading,
    error,
    selectedPatient,
    history,
    loadPatients,
    create,
    loadPatient,
    update,
    remove,
    loadHistory,
    loadActive,
    clearErr,
    clearHist,
    clearSelected
  };
}
