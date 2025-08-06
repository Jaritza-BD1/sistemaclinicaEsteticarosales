// front-end/src/Components/common/FormActions.jsx
import React from 'react';
import {
  Box,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useFormContext } from './BaseForm';

const FormActions = ({
  onSave,
  onCancel,
  onClear,
  onAdd,
  onEdit,
  saveText = 'Guardar',
  cancelText = 'Cancelar',
  clearText = 'Limpiar',
  addText = 'Agregar',
  editText = 'Editar',
  showSave = true,
  showCancel = true,
  showClear = false,
  showAdd = false,
  showEdit = false,
  loading = false,
  disabled = false,
  sx = {},
  ...props
}) => {
  const { isSubmitting, hasErrors, resetForm } = useFormContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  const handleClear = () => {
    resetForm();
    if (onClear) onClear();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'primary.200',
        flexDirection: isMobile ? 'column' : 'row',
        ...sx
      }}
      {...props}
    >
      {/* Botón Limpiar */}
      {showClear && (
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={disabled || isSubmitting}
          sx={{
            borderColor: 'warning.300',
            color: 'warning.main',
            '&:hover': {
              borderColor: 'warning.main',
              backgroundColor: 'warning.50',
            },
          }}
        >
          <ClearIcon sx={{ mr: 1 }} />
          {clearText}
        </Button>
      )}

      {/* Botón Agregar */}
      {showAdd && (
        <Button
          variant="outlined"
          onClick={onAdd}
          disabled={disabled || isSubmitting}
          sx={{
            borderColor: 'info.300',
            color: 'info.main',
            '&:hover': {
              borderColor: 'info.main',
              backgroundColor: 'info.50',
            },
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          {addText}
        </Button>
      )}

      {/* Botón Editar */}
      {showEdit && (
        <Button
          variant="outlined"
          onClick={onEdit}
          disabled={disabled || isSubmitting}
          sx={{
            borderColor: 'info.300',
            color: 'info.main',
            '&:hover': {
              borderColor: 'info.main',
              backgroundColor: 'info.50',
            },
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          {editText}
        </Button>
      )}

      {/* Botón Cancelar */}
      {showCancel && (
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={disabled || isSubmitting}
          sx={{
            borderColor: 'primary.300',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
            },
          }}
        >
          <CancelIcon sx={{ mr: 1 }} />
          {cancelText}
        </Button>
      )}

      {/* Botón Guardar */}
      {showSave && (
        <Button
          type="submit"
          variant="contained"
          onClick={onSave}
          disabled={disabled || isSubmitting || hasErrors}
          sx={{
            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              background: 'grey.300',
              transform: 'none',
            },
            boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
          }}
        >
          <SaveIcon sx={{ mr: 1 }} />
          {isSubmitting ? 'Guardando...' : saveText}
        </Button>
      )}
    </Box>
  );
};

export default FormActions; 