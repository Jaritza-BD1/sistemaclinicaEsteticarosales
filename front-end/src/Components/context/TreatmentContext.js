import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTreatments, createTreatment, deleteTreatment as deleteTreatmentApi, updateTreatment as updateTreatmentApi } from '../../services/treatmentService';

const TreatmentContext = createContext();

export const useTreatment = () => useContext(TreatmentContext);

export const TreatmentProvider = ({ children }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTreatments = async () => {
    setLoading(true);
    try {
      const response = await fetchTreatments();
      // The backend wraps payloads as { success, message, data }
      const payload = response?.data?.data ?? response?.data ?? [];
      const list = Array.isArray(payload) ? payload : [];

      // Normalize backend treatment objects into the shape the UI expects
      const normalized = list.map(item => {
        const id = item.atr_id_tratamiento ?? item.id ?? item._id;
        const doctor = item.doctor || item.doctor || null;
        const especialidad = (
          (doctor && doctor.Especialidades && doctor.Especialidades.length > 0 && doctor.Especialidades[0].atr_especialidad) ||
          doctor?.atr_especialidad ||
          ''
        );

        return {
          id,
          name: item.atr_tipo_tratamiento || item.atr_nombre || `Tratamiento ${id}`,
          description: item.atr_diagnostico || item.atr_observaciones || item.descripcion || '',
          especialidad,
          costo: item.atr_costo ?? item.costo ?? null,
          duracion: item.atr_numero_sesiones ?? item.duracion ?? null,
          estado: (item.atr_estado || item.estado || 'ACTIVO').toString().toLowerCase(),
          patient: item.patient,
          doctor: doctor,
          raw: item
        };
      });

      setTreatments(normalized);
      setError(null);
    } catch (err) {
      setError('Error al cargar tratamientos');
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  const addTreatment = async (treatmentData) => {
    const resp = await createTreatment(treatmentData);
    const newTreatment = resp?.data?.data ?? resp?.data ?? resp;
    const item = newTreatment;
    const id = item?.atr_id_tratamiento ?? item?.id ?? item?._id;
    const doctor = item?.doctor || null;
    const especialidad = (
      (doctor && doctor.Especialidades && doctor.Especialidades.length > 0 && doctor.Especialidades[0].atr_especialidad) ||
      doctor?.atr_especialidad ||
      ''
    );
    const normalized = {
      id,
      name: item?.atr_tipo_tratamiento || item?.atr_nombre || `Tratamiento ${id}`,
      description: item?.atr_diagnostico || item?.atr_observaciones || item?.descripcion || '',
      especialidad,
      costo: item?.atr_costo ?? item?.costo ?? null,
      duracion: item?.atr_numero_sesiones ?? item?.duracion ?? null,
      estado: (item?.atr_estado || item?.estado || 'ACTIVO').toString().toLowerCase(),
      patient: item?.patient,
      doctor: doctor,
      raw: item
    };
    setTreatments(prev => [normalized, ...prev]);
    return normalized;
  };

  const deleteTreatmentToContext = async (id) => {
    await deleteTreatmentApi(id);
    setTreatments(prev => prev.filter(t => t.id !== id && t._id !== id));
  };

  const updateTreatmentToContext = async (id, treatmentData) => {
    const resp = await updateTreatmentApi(id, treatmentData);
    const updated = resp?.data?.data ?? resp?.data ?? resp;
    const item = updated;
    const newId = item?.atr_id_tratamiento ?? item?.id ?? item?._id;
    const doctor = item?.doctor || null;
    const especialidad = (
      (doctor && doctor.Especialidades && doctor.Especialidades.length > 0 && doctor.Especialidades[0].atr_especialidad) ||
      doctor?.atr_especialidad ||
      ''
    );
    const normalized = {
      id: newId,
      name: item?.atr_tipo_tratamiento || item?.atr_nombre || `Tratamiento ${newId}`,
      description: item?.atr_diagnostico || item?.atr_observaciones || item?.descripcion || '',
      especialidad,
      costo: item?.atr_costo ?? item?.costo ?? null,
      duracion: item?.atr_numero_sesiones ?? item?.duracion ?? null,
      estado: (item?.atr_estado || item?.estado || 'ACTIVO').toString().toLowerCase(),
      patient: item?.patient,
      doctor: doctor,
      raw: item
    };
    setTreatments(prev => prev.map(t => (t.id === id || t._id === id) ? normalized : t));
    return normalized;
  };

  return (
    <TreatmentContext.Provider value={{ treatments, loading, error, fetchTreatments: loadTreatments, addTreatment, deleteTreatment: deleteTreatmentToContext, updateTreatment: updateTreatmentToContext }}>
      {children}
    </TreatmentContext.Provider>
  );
}; 