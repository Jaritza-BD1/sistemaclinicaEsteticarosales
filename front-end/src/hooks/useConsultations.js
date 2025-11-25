import { useSelector, useDispatch } from 'react-redux';
import {
  fetchConsultationByAppointment,
  fetchConsultation,
  createConsultation,
  updateConsultation,
  finishConsultation,
  addExams,
  fetchExams,
  addPrescription,
  fetchPrescriptions,
  updatePrescriptionStatus,
  addTreatments,
  fetchTreatments,
  updateTreatmentSession,
  clearConsultationData,
  clearErrors,
  selectConsultationById,
  selectConsultationByAppointment,
  selectConsultationsByPatient,
  selectExamsByConsultation,
  selectPrescriptionsByConsultation,
  selectTreatmentsByConsultation,
  selectConsultationLoading,
  selectConsultationErrors
} from '../redux/consultations/consultationsSlice';

export const useConsultations = () => {
  const dispatch = useDispatch();

  // Selectores
  const selectConsultation = (consultationId) => (state) => selectConsultationById(state, consultationId);
  const selectConsultationFromAppointment = (appointmentId) => (state) => selectConsultationByAppointment(state, appointmentId);
  const selectPatientConsultations = (patientId) => (state) => selectConsultationsByPatient(state, patientId);
  const selectConsultationExams = (consultationId) => (state) => selectExamsByConsultation(state, consultationId);
  const selectConsultationPrescriptions = (consultationId) => (state) => selectPrescriptionsByConsultation(state, consultationId);
  const selectConsultationTreatments = (consultationId) => (state) => selectTreatmentsByConsultation(state, consultationId);
  const loading = useSelector(selectConsultationLoading);
  const errors = useSelector(selectConsultationErrors);

  // Acciones
  const fetchByAppointment = (appointmentId) => dispatch(fetchConsultationByAppointment(appointmentId));
  const fetchById = (consultationId) => dispatch(fetchConsultation(consultationId));
  const create = (data) => dispatch(createConsultation(data));
  const update = (id, data) => dispatch(updateConsultation({ id, data }));
  const finish = (consultationId, data) => dispatch(finishConsultation({ consultationId, data }));
  const addExamsToConsultation = (consultationId, exams) => dispatch(addExams({ consultationId, exams }));
  const fetchConsultationExams = (consultationId) => dispatch(fetchExams(consultationId));
  const addPrescriptionToConsultation = (consultationId, prescription) => dispatch(addPrescription({ consultationId, prescription }));
  const fetchConsultationPrescriptions = (consultationId) => dispatch(fetchPrescriptions(consultationId));
  const updatePrescription = (prescriptionId, data) => dispatch(updatePrescriptionStatus({ prescriptionId, data }));
  const addTreatmentsToConsultation = (consultationId, treatments) => dispatch(addTreatments({ consultationId, treatments }));
  const fetchConsultationTreatments = (consultationId) => dispatch(fetchTreatments(consultationId));
  const updateSession = (sessionId, data) => dispatch(updateTreatmentSession({ sessionId, data }));
  const clearData = (consultationId) => dispatch(clearConsultationData(consultationId));
  const clearAllErrors = () => dispatch(clearErrors());

  return {
    // Selectores
    selectConsultation,
    selectConsultationFromAppointment,
    selectPatientConsultations,
    selectConsultationExams,
    selectConsultationPrescriptions,
    selectConsultationTreatments,
    loading,
    errors,

    // Acciones
    fetchByAppointment,
    fetchById,
    create,
    update,
    finish,
    addExamsToConsultation,
    fetchConsultationExams,
    addPrescriptionToConsultation,
    fetchConsultationPrescriptions,
    updatePrescription,
    addTreatmentsToConsultation,
    fetchConsultationTreatments,
    updateSession,
    clearData,
    clearAllErrors
  };
};

// Convenience hooks: selector wrappers that call `useSelector` internally
// These provide a safer API so components don't need to call `useSelector` themselves.
export const useConsultationFromAppointment = (appointmentId) =>
  useSelector(state => selectConsultationByAppointment(state, appointmentId));

export const useConsultationById = (consultationId) =>
  useSelector(state => selectConsultationById(state, consultationId));

export const useConsultationExams = (consultationId) =>
  useSelector(state => selectExamsByConsultation(state, consultationId));

export const useConsultationPrescriptions = (consultationId) =>
  useSelector(state => selectPrescriptionsByConsultation(state, consultationId));

export const useConsultationTreatments = (consultationId) =>
  useSelector(state => selectTreatmentsByConsultation(state, consultationId));