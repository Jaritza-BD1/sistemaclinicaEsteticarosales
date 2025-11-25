import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';

export default function ConfirmDialog({ show, title = 'Confirmar', message = '', onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar', loading = false }) {
  return (
    <Dialog open={!!show} onClose={onCancel} maxWidth="sm" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>
        {typeof message === 'string' ? (
          <Typography>{message}</Typography>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading} variant="outlined">{cancelText}</Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained" color="error" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}>
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

