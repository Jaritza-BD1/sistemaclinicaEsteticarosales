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
      setTreatments(response.data || []);
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
    const newTreatment = await createTreatment(treatmentData);
    setTreatments(prev => [newTreatment, ...prev]);
    return newTreatment;
  };

  const deleteTreatmentToContext = async (id) => {
    await deleteTreatmentApi(id);
    setTreatments(prev => prev.filter(t => t.id !== id && t._id !== id));
  };

  const updateTreatmentToContext = async (id, treatmentData) => {
    const updated = await updateTreatmentApi(id, treatmentData);
    setTreatments(prev => prev.map(t => (t.id === id || t._id === id) ? updated : t));
    return updated;
  };

  return (
    <TreatmentContext.Provider value={{ treatments, loading, error, fetchTreatments: loadTreatments, addTreatment, deleteTreatment: deleteTreatmentToContext, updateTreatment: updateTreatmentToContext }}>
      {children}
    </TreatmentContext.Provider>
  );
}; 