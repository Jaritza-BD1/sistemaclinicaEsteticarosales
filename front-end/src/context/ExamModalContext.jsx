import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ExamModalContext = createContext(null);

export const ExamModalProvider = ({ children }) => {
  const [createOpen, setCreateOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [currentExamId, setCurrentExamId] = useState(null);

  // listeners for refresh after create
  const refreshListeners = useRef(new Set());

  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const openResults = useCallback((examId = null) => {
    setCurrentExamId(examId || null);
    setResultsOpen(true);
  }, []);
  const closeResults = useCallback(() => {
    setResultsOpen(false);
    setCurrentExamId(null);
  }, []);

  const registerRefresh = useCallback((fn) => {
    refreshListeners.current.add(fn);
    return () => refreshListeners.current.delete(fn);
  }, []);

  const triggerRefresh = useCallback(() => {
    for (const fn of Array.from(refreshListeners.current)) {
      try { fn(); } catch (e) { /* ignore */ }
    }
  }, []);

  const value = {
    createOpen,
    resultsOpen,
    currentExamId,
    openCreate,
    closeCreate,
    openResults,
    closeResults,
    registerRefresh,
    triggerRefresh
  };

  return (
    <ExamModalContext.Provider value={value}>
      {children}
    </ExamModalContext.Provider>
  );
};

export const useExamModal = () => {
  const ctx = useContext(ExamModalContext);
  if (!ctx) throw new Error('useExamModal must be used within ExamModalProvider');
  return ctx;
};

export default ExamModalContext;
