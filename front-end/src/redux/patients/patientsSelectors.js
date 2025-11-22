// src/redux/patients/patientsSelectors.js
export const selectPatientsState = (state) => state.patients;
export const selectPatientList = (state) => selectPatientsState(state).list;
export const selectPatientsLoading = (state) => selectPatientsState(state).status === 'loading';
export const selectPatientsError = (state) => selectPatientsState(state).error;
export const selectSelectedPatient = (state) => selectPatientsState(state).selectedPatient;
export const selectPatientHistory = (state) => selectPatientsState(state).history;
export const selectPatientsPagination = (state) => ({
  page: selectPatientsState(state).page,
  pageSize: selectPatientsState(state).pageSize,
  total: selectPatientsState(state).total
});

const patientsSelectors = {
  selectPatientsState,
  selectPatientList,
  selectPatientsLoading,
  selectPatientsError,
  selectSelectedPatient,
  selectPatientHistory,
  selectPatientsPagination
};

export default patientsSelectors;
