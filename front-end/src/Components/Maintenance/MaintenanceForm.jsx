import React from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import useMetaValidation from './hooks/useMetaValidation';
import { Formik, Form } from 'formik';

// A reusable maintenance form. It builds initial values and Yup schema from meta.
const MaintenanceForm = ({ model, meta = [], editing = null, onCancel = () => {}, onSubmit, submitLabel }) => {
  // If backend doesn't provide meta, fallback is provided by the hook or metaMapping.json; keep this component focused on UI.

  const pkField = (meta.find(m => m.primaryKey) || {}).name || 'id';

  // use hook to produce initial values and validation schema
  const { initialValues, validationSchema, effectiveMeta, optionsMap } = useMetaValidation(meta, model, editing);
  // validation schema is produced by the hook; backend enforces uniqueness on submit and returns 422.

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
      {({ values, errors, touched, handleChange, isSubmitting }) => (
        <Form>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
        {effectiveMeta.filter(m => !m.primaryKey).map((f) => {
              const name = f.name;
              const label = f.label || (name || '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              // UI hints: placeholder, helperText, inputProps
              const fieldMax = f.maxLength || (f.length || undefined);
              const ui = {};
              // Model-specific hints
              if (model && model.toLowerCase() === 'parametro') {
                if (name === 'atr_parametro') {
                  ui.placeholder = 'EJ: ADMIN_NUM_REGISTROS';
                  ui.helper = 'Nombre identificador en mayúsculas, sin espacios; usar _ para separar palabras.';
                }
                if (name === 'atr_valor') {
                  ui.placeholder = 'Valor del parámetro';
                  ui.helper = 'Valor asociado al parámetro. Máx. ' + (fieldMax || 100) + ' caracteres.';
                }
              }

              const inputProps = {};
              if (fieldMax) inputProps.maxLength = fieldMax;
              // Render selects for foreign keys
              if (name === 'atr_id_rol' || name.toLowerCase().endsWith('_id_rol')) {
                const opts = optionsMap.Rol || [];
                return (
                  <FormControl key={name} fullWidth>
                    <InputLabel id={`label-${name}`}>{label}</InputLabel>
                    <Select
                      labelId={`label-${name}`}
                      name={name}
                      value={values[name] || ''}
                      label={label}
                      onChange={handleChange}
                    >
                      <MenuItem value="">--Seleccione--</MenuItem>
                      {opts.map(o => (
                        <MenuItem key={o.atr_id_rol || o.id} value={o.atr_id_rol || o.id}>{o.atr_rol || o.name || o.atr_rol}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              if (name === 'atr_id_objeto' || name.toLowerCase().endsWith('_id_objeto')) {
                const opts = optionsMap.Objeto || [];
                return (
                  <FormControl key={name} fullWidth>
                    <InputLabel id={`label-${name}`}>{label}</InputLabel>
                    <Select
                      labelId={`label-${name}`}
                      name={name}
                      value={values[name] || ''}
                      label={label}
                      onChange={handleChange}
                    >
                      <MenuItem value="">--Seleccione--</MenuItem>
                      {opts.map(o => (
                        <MenuItem key={o.atr_id_objetos || o.id} value={o.atr_id_objetos || o.id}>{o.atr_objeto || o.name || o.atr_objeto}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              // Boolean toggle
              if ((f.type && f.type.toLowerCase && f.type.toLowerCase().includes('boolean')) || name.toLowerCase().includes('activo')) {
                return (
                  <FormControlLabel
                    key={name}
                    control={<Switch name={name} checked={!!values[name]} onChange={(e) => {
                      // Formik handleChange doesn't play well with Switch checked; synthesize event
                      const ev = { target: { name, value: e.target.checked } };
                      handleChange(ev);
                    }} />}
                    label={label}
                  />
                );
              }

              // Number / decimal
              if (f.type && (f.type.toLowerCase().includes('integer') || f.type.toLowerCase().includes('decimal') || name.toLowerCase().includes('precio') || name.toLowerCase().includes('stock'))) {
                const step = f.type && f.type.toLowerCase().includes('decimal') ? '0.01' : '1';
                return (
                  <TextField
                    key={name}
                    name={name}
                    label={label}
                    placeholder={ui.placeholder}
                    value={values[name] || ''}
                    onChange={handleChange}
                    helperText={touched[name] && errors[name] ? errors[name] : (ui.helper || '')}
                    error={!!(touched[name] && errors[name])}
                    fullWidth
                    variant="outlined"
                    inputProps={{ ...inputProps, step }}
                    type="number"
                  />
                );
              }

              // Default text field
              return (
                <TextField
                  key={name}
                  name={name}
                  label={label}
                  placeholder={ui.placeholder}
                  value={values[name] || ''}
                  onChange={handleChange}
                  helperText={touched[name] && errors[name] ? errors[name] : (ui.helper || '')}
                  error={!!(touched[name] && errors[name])}
                  fullWidth
                  variant="outlined"
                  inputProps={inputProps}
                  multiline={!!(fieldMax && fieldMax > 60 && (name.toLowerCase().includes('valor') || name.toLowerCase().includes('descripcion')))}
                />
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onCancel} sx={{ mr: 1 }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>{submitLabel || (editing ? 'Guardar' : 'Crear')}</Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default MaintenanceForm;
