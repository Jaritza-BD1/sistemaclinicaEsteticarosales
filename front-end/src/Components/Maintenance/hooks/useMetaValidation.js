import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import maintenanceService from '../../../services/maintenanceService';
import metaMapping from '../metaMapping.json';

// Hook que construye initialValues y validationSchema a partir de meta/model
export default function useMetaValidation(meta = [], model = '', editing = null) {
  const [optionsMap, setOptionsMap] = useState({});

  // effectiveMeta: prefer meta param, luego mapping global
  const effectiveMeta = useMemo(() => {
    if (meta && meta.length) return meta;
    const mapped = metaMapping[model];
    return mapped && mapped.fields ? mapped.fields : [];
  }, [meta, model]);

  useEffect(() => {
    let mounted = true;
    const fetchLookups = async () => {
      try {
        const resRol = await maintenanceService.list('Rol', 1, 1000);
        const resObj = await maintenanceService.list('Objeto', 1, 1000);
        if (!mounted) return;
        setOptionsMap({ Rol: (resRol && resRol.data) ? resRol.data : [], Objeto: (resObj && resObj.data) ? resObj.data : [] });
      } catch (err) {
        // ignore
      }
    };
    fetchLookups();
    return () => { mounted = false; };
  }, []);

  const initialValues = useMemo(() => {
    const init = {};
    effectiveMeta.forEach(f => {
      if (f.primaryKey) return;
      let v = '';
      const t = (f.type || '').toString().toLowerCase();
      if (t.includes('boolean')) v = editing ? !!editing[f.name] : false;
      else if (t.includes('integer') || t.includes('decimal') || t.includes('number')) v = editing && typeof editing[f.name] !== 'undefined' ? editing[f.name] : '';
      else v = editing && typeof editing[f.name] !== 'undefined' ? editing[f.name] : '';
      init[f.name] = v;
    });
    return init;
  }, [effectiveMeta, editing]);

  const validationSchema = useMemo(() => {
    const shape = {};
    effectiveMeta.forEach(f => {
      if (f.primaryKey) return;
      let validator = Yup.mixed();
      const t = (f.type || '').toString().toLowerCase();
      if (t.includes('string') || t === 'text' || t === 'enum') validator = Yup.string();
      if (t.includes('integer') || t.includes('number')) validator = Yup.number().typeError('Debe ser un número');
      if (t.includes('decimal')) validator = Yup.number().typeError('Debe ser un número');
      if (f.allowNull === false) validator = validator.required('Requerido');
      if (f.maxLength) validator = validator.max(f.maxLength, `Máx. ${f.maxLength} caracteres`);
      if (f.name && /email/i.test(f.name)) validator = validator.email('Formato de email inválido');
      if (f.unique) {
        validator = validator.test('unique', 'Valor ya existe', function (value) {
          if (!value) return true;
          // simple server-side check
          return maintenanceService.checkUnique(model, f.name, value, editing ? (editing[f.name] || null) : null).then(res => {
            return res && (res.unique === true || res.unique === false ? res.unique : !res.exists);
          }).catch(() => true);
        });
      }
      // model-specific rules
      if (model && model.toLowerCase() === 'parametro' && f.name === 'atr_parametro') {
        validator = validator.matches(/^[A-Z0-9_]+$/, 'Formato inválido: usar mayúsculas, números y guiones bajos');
      }

      shape[f.name] = validator;
    });
    return Yup.object().shape(shape);
  }, [effectiveMeta, editing, model]);

  return { initialValues, validationSchema, effectiveMeta, optionsMap };
}
