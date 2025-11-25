import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../Components/common/ConfirmDialog';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [note, setNote] = useState({ open: false, title: '', message: '', severity: 'info', onConfirm: null });

  const severityToTitle = (severity) => {
    switch ((severity || '').toString().toLowerCase()) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      default: return 'Información';
    }
  };

  // notify: { message, severity = 'info', onConfirm = null }
  const notify = useCallback(({ message, severity = 'info', onConfirm = null }) => {
    setNote({ open: true, title: severityToTitle(severity), message, severity, onConfirm });
  }, []);

  const handleClose = useCallback(() => setNote(prev => ({ ...prev, open: false })), []);

  const handleConfirm = useCallback(() => {
    setNote(prev => {
      try {
        if (typeof prev.onConfirm === 'function') prev.onConfirm();
      } catch (e) {
        // swallow
      }
      return { ...prev, open: false };
    });
  }, []);

  return (
    <NotificationsContext.Provider value={{ notify }}>
      {children}
      <ConfirmDialog
        show={note.open}
        title={note.title}
        message={note.message}
        onConfirm={handleConfirm}
        onCancel={handleClose}
        confirmText="Aceptar"
        cancelText="Cerrar"
        loading={false}
      />
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};

export default NotificationsContext;
