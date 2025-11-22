// front-end/src/Components/common/FormFields.jsx
import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
  Chip,
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Switch } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useFormContext } from './BaseForm';

// Campo de texto básico
export const FormTextField = ({
  name,
  label,
  type = 'text',
  required = false,
  fullWidth = true,
  multiline = false,
  rows = 1,
  placeholder,
  helperText,
  disabled = false,
  sx = {},
  ...props
}) => {
  const { formData, errors, handleChange, debouncedFieldValidation } = useFormContext();
  const theme = useTheme();

  // Validar que name no sea null o undefined
  if (!name) {
    console.error('FormTextField: name prop is required but was', name);
    return null; // No renderizar el componente si no hay name
  }

  const hasError = errors[name];
  const value = formData[name] || '';

  return (
    <TextField
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={() => debouncedFieldValidation(name)}
      error={!!hasError}
      helperText={hasError || helperText}
      required={required}
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.300',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          },
        },
        ...sx
      }}
      {...props}
    />
  );
};

// Campo de contraseña con toggle de visibilidad
export const FormPasswordField = ({
  name,
  label,
  required = false,
  fullWidth = true,
  sx = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { formData, errors, handleChange, debouncedFieldValidation } = useFormContext();

  // Validar que name no sea null o undefined
  if (!name) {
    console.error('FormPasswordField: name prop is required but was', name);
    return null; // No renderizar el componente si no hay name
  }

  const hasError = errors[name];
  const value = formData[name] || '';

  return (
    <TextField
      name={name}
      label={label}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={handleChange}
      onBlur={() => debouncedFieldValidation(name)}
      error={!!hasError}
      helperText={hasError}
      required={required}
      fullWidth={fullWidth}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.300',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          },
        },
        ...sx
      }}
      {...props}
    />
  );
};

// Campo de selección
export const FormSelectField = ({
  name,
  label,
  options = [],
  required = false,
  fullWidth = true,
  disabled = false,
  sx = {},
  ...props
}) => {
  const { formData, errors, handleChange, debouncedFieldValidation } = useFormContext();

  // Validar que name no sea null o undefined
  if (!name) {
    console.error('FormSelectField: name prop is required but was', name);
    return null; // No renderizar el componente si no hay name
  }

  const hasError = errors[name];
  const value = formData[name] || '';

  return (
    <FormControl
      fullWidth={fullWidth}
      error={!!hasError}
      required={required}
      disabled={disabled}
      sx={sx}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        onChange={(e) => {
          // Coerce numeric-looking values to Number to preserve types
          const raw = e.target.value;
          let parsed = raw;
          if (typeof raw === 'string' && /^\d+$/.test(raw)) parsed = Number(raw);
          // Find label for the selected option (if provided)
          const selectedOption = options.find(opt => opt && opt.value === parsed);
          const selectedLabel = selectedOption ? selectedOption.label : '';
          // Create a synthetic event compatible with handleChange from context
          handleChange({ target: { name, value: parsed, type: e.target.type } });
          // Also store a companion label field (e.g., generoLabel) so callers can send both id and text
          try {
            handleChange({ target: { name: `${name}Label`, value: selectedLabel, type: 'text' } });
          } catch (err) {
            // ignore if context handler not available
          }
          // If an external onChange prop was passed (parent component expects event), call it too
          if (typeof props.onChange === 'function') {
            try {
              props.onChange({ target: { name, value: parsed } });
            } catch (err) {
              // swallow
            }
          }
        }}
        onBlur={() => debouncedFieldValidation(name)}
        label={label}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            '&:hover': {
              borderColor: 'primary.300',
            },
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{hasError}</FormHelperText>}
    </FormControl>
  );
};

// Campo de fecha
export const FormDateField = ({
  name,
  label,
  required = false,
  fullWidth = true,
  disabled = false,
  sx = {},
  ...props
}) => {
  const { formData, errors, handleChange, debouncedFieldValidation } = useFormContext();

  // Validar que name no sea null o undefined
  if (!name) {
    console.error('FormDateField: name prop is required but was', name);
    return null; // No renderizar el componente si no hay name
  }

  const hasError = errors[name];
  const value = formData[name] || '';

  return (
    <TextField
      name={name}
      label={label}
      type="date"
      value={value}
      onChange={handleChange}
      onBlur={() => debouncedFieldValidation(name)}
      error={!!hasError}
      helperText={hasError}
      required={required}
      fullWidth={fullWidth}
      disabled={disabled}
      InputLabelProps={{
        shrink: true,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset': {
            borderColor: 'primary.300',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          },
        },
        ...sx
      }}
      {...props}
    />
  );
};

// Campo de campos dinámicos (arrays)
export const FormDynamicFields = ({
  name,
  label,
  template = {},
  renderField,
  minFields = 1,
  maxFields = 10,
  addButtonText = 'Agregar',
  removeButtonText = 'Remover',
  sx = {},
  ...props
}) => {
  const { formData, addDynamicField, removeDynamicField, handleDynamicChange } = useFormContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fields = formData[name] || [];
  const canAdd = fields.length < maxFields;
  const canRemove = fields.length > minFields;

  const handleAdd = () => {
    if (canAdd) {
      addDynamicField(name, template);
    }
  };

  const handleRemove = (id) => {
    if (canRemove) {
      removeDynamicField(name, id);
    }
  };

  return (
    <Box sx={sx}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {label}
      </Typography>
      
      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'primary.200',
            borderRadius: 2,
            background: 'white'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={isMobile ? 12 : 11}>
              {renderField(field, index, (fieldName, value) => 
                handleDynamicChange(name, field.id, fieldName, value)
              )}
            </Grid>
            <Grid item xs={isMobile ? 12 : 1}>
              {canRemove && (
                <IconButton
                  onClick={() => handleRemove(field.id)}
                  color="error"
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <RemoveIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
        </Box>
      ))}
      
      {canAdd && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <IconButton
            onClick={handleAdd}
            color="primary"
            variant="outlined"
            sx={{
              border: '2px dashed',
              borderColor: 'primary.300',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              },
            }}
          >
            <AddIcon />
          </IconButton>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {addButtonText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Campo de chips (para tags, alergias, etc.)
export const FormChipsField = ({
  name,
  label,
  placeholder = 'Presiona Enter para agregar',
  fullWidth = true,
  sx = {},
  ...props
}) => {
  const { formData, handleChange } = useFormContext();
  const [inputValue, setInputValue] = useState('');

  const chips = formData[name] || [];
  const value = chips.join(', ');

  const handleAddChip = (chip) => {
    if (chip && !chips.includes(chip)) {
      const newChips = [...chips, chip];
      handleChange({
        target: { name, value: newChips.join(', ') }
      });
    }
  };

  const handleRemoveChip = (chipToRemove) => {
    const newChips = chips.filter(chip => chip !== chipToRemove);
    handleChange({
      target: { name, value: newChips.join(', ') }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChip(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <Box sx={sx}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      
      <TextField
        fullWidth={fullWidth}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {chips.map((chip, index) => (
          <Chip
            key={index}
            label={chip}
            onDelete={() => handleRemoveChip(chip)}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
    </Box>
  );
};

// Campo switch (boolean) controlado por FormContext
export const FormSwitchField = ({
  name,
  label,
  checkedTrueLabel,
  checkedFalseLabel,
  disabled = false,
  sx = {},
  ...props
}) => {
  const { formData, handleChange } = useFormContext();

  if (!name) {
    console.error('FormSwitchField: name prop is required but was', name);
    return null;
  }

  const value = !!formData[name];

  // Create a synthetic event to reuse handleChange from context
  const onToggle = (e, checked) => {
    const syntheticEvent = { target: { name, value: checked, type: 'checkbox', checked } };
    handleChange(syntheticEvent);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ...sx }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Switch
        name={name}
        checked={value}
        onChange={onToggle}
        disabled={disabled}
        {...props}
      />
    </Box>
  );
};

const FormFields = {
  FormTextField,
  FormPasswordField,
  FormSelectField,
  FormDateField,
  FormDynamicFields,
  FormChipsField
};

export default FormFields; 