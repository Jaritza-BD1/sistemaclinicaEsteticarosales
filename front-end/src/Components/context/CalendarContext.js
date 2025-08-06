// src/contexts/CalendarContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. Crea el Contexto
export const CalendarContext = createContext(null);

// 2. Crea el Componente Proveedor
export const CalendarProvider = ({ children }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Funciones para interactuar con el estado del modal y el evento seleccionado
  const openEditModal = useCallback((event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedEvent(null);
  }, []);

  // Provee el estado y las funciones a los componentes hijos
  const contextValue = {
    showEditModal,
    selectedEvent,
    openEditModal,
    closeEditModal,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};