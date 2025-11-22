# Redux State Management para Consultas Médicas

Este documento explica cómo usar el sistema Redux implementado para manejar el estado de las consultas médicas en la aplicación.

## Arquitectura Redux

### Estado Global

El estado de Redux está organizado de la siguiente manera:

```javascript
{
  consultations: {
    // Consultas principales
    consultations: {}, // { [consultationId]: consultation }
    consultationsByAppointment: {}, // { [appointmentId]: consultationId }
    consultationsByPatient: {}, // { [patientId]: [consultationIds] }

    // Datos relacionados
    exams: {}, // { [consultationId]: [exams] }
    prescriptions: {}, // { [consultationId]: [prescriptions] }
    treatments: {}, // { [consultationId]: [treatments] }

    // Estados de carga
    loading: {
      fetch: false,
      create: false,
      update: false,
      finish: false,
      exams: false,
      prescriptions: false,
      treatments: false
    },

    // Errores
    errors: {
      fetch: null,
      create: null,
      update: null,
      finish: null,
      exams: null,
      prescriptions: null,
      treatments: null
    }
  }
}
```

## Hook Personalizado: useConsultations

Se proporciona un hook personalizado `useConsultations` que facilita el acceso al estado y las acciones:

```javascript
import { useConsultations } from '../hooks/useConsultations';

const MyComponent = () => {
  const {
    // Selectores
    selectConsultation,
    selectConsultationFromAppointment,
    selectPatientConsultations,
    selectConsultationExams,
    selectConsultationPrescriptions,
    selectConsultationTreatments,
    loading,
    errors,

    // Acciones
    fetchByAppointment,
    fetchById,
    create,
    update,
    finish,
    addExamsToConsultation,
    fetchConsultationExams,
    addPrescriptionToConsultation,
    fetchConsultationPrescriptions,
    updatePrescription,
    addTreatmentsToConsultation,
    fetchConsultationTreatments,
    updateSession,
    clearData,
    clearAllErrors
  } = useConsultations();

  // Uso de selectores
  const consultation = selectConsultation(consultationId);
  const exams = selectConsultationExams(consultationId);
  const prescriptions = selectConsultationPrescriptions(consultationId);
  const treatments = selectConsultationTreatments(consultationId);

  // Uso de acciones
  const handleCreateConsultation = async (data) => {
    await create(data);
  };

  return (
    <div>
      {loading.create && <p>Cargando...</p>}
      {errors.create && <p>Error: {errors.create}</p>}
      {/* Component content */}
    </div>
  );
};
```

## Acciones Disponibles

### Consultas Principales

- `fetchConsultationByAppointment(appointmentId)`: Obtiene la consulta por ID de cita
- `fetchConsultation(consultationId)`: Obtiene una consulta específica
- `createConsultation(data)`: Crea una nueva consulta
- `updateConsultation({ id, data })`: Actualiza una consulta existente
- `finishConsultation({ consultationId, data })`: Finaliza una consulta

### Exámenes

- `addExams(consultationId, exams)`: Agrega exámenes a una consulta
- `fetchExams(consultationId)`: Obtiene los exámenes de una consulta

### Recetas

- `addPrescription(consultationId, prescription)`: Agrega una receta a una consulta
- `fetchPrescriptions(consultationId)`: Obtiene las recetas de una consulta
- `updatePrescriptionStatus(prescriptionId, data)`: Actualiza el estado de una receta

### Tratamientos

- `addTreatments(consultationId, treatments)`: Agrega tratamientos a una consulta
- `fetchTreatments(consultationId)`: Obtiene los tratamientos de una consulta
- `updateTreatmentSession(sessionId, data)`: Actualiza una sesión de tratamiento

## Selectores

Los selectores permiten acceder a datos específicos del estado:

- `selectConsultationById(state, consultationId)`: Consulta por ID
- `selectConsultationByAppointment(state, appointmentId)`: Consulta por cita
- `selectConsultationsByPatient(state, patientId)`: Todas las consultas de un paciente
- `selectExamsByConsultation(state, consultationId)`: Exámenes de una consulta
- `selectPrescriptionsByConsultation(state, consultationId)`: Recetas de una consulta
- `selectTreatmentsByConsultation(state, consultationId)`: Tratamientos de una consulta
- `selectConsultationLoading(state)`: Estados de carga
- `selectConsultationErrors(state)`: Errores

## Uso en Componentes

### Ejemplo: Componente de Consulta

```javascript
const ConsultationPage = ({ appointmentId }) => {
  const {
    selectConsultationFromAppointment,
    selectConsultationExams,
    fetchByAppointment,
    fetchConsultationExams,
    loading,
    errors
  } = useConsultations();

  // Obtener datos del estado
  const consultation = selectConsultationFromAppointment(appointmentId);
  const exams = selectConsultationExams(consultation?.atr_id_consulta);

  useEffect(() => {
    // Cargar datos
    fetchByAppointment(appointmentId);
    if (consultation?.atr_id_consulta) {
      fetchConsultationExams(consultation.atr_id_consulta);
    }
  }, [appointmentId, consultation?.atr_id_consulta]);

  if (loading.fetch) return <div>Cargando...</div>;

  return (
    <div>
      {consultation && (
        <div>
          <h2>Consulta: {consultation.atr_sintomas_paciente}</h2>
          <ExamsList exams={exams} />
        </div>
      )}
    </div>
  );
};
```

### Ejemplo: Formulario de Consulta

```javascript
const ConsultationForm = ({ appointmentId, consultation }) => {
  const { create, update, loading, errors } = useConsultations();
  const [formData, setFormData] = useState({});

  const handleSubmit = async () => {
    if (consultation) {
      await update(consultation.atr_id_consulta, formData);
    } else {
      await create({ ...formData, appointmentId });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={loading.create || loading.update}>
        {loading.create || loading.update ? 'Guardando...' : 'Guardar'}
      </button>
      {errors.create && <div>Error: {errors.create}</div>}
      {errors.update && <div>Error: {errors.update}</div>}
    </form>
  );
};
```

## Beneficios del Sistema Redux

1. **Estado Centralizado**: Todos los datos de consultas están en un lugar
2. **Actualización Automática**: Los componentes se actualizan automáticamente cuando cambia el estado
3. **Gestión de Carga**: Estados de carga centralizados para mejor UX
4. **Manejo de Errores**: Errores centralizados y consistentes
5. **Reutilización**: Hook personalizado facilita el uso en múltiples componentes
6. **Optimización**: Selectores memoizados mejoran el rendimiento

## Extensión del Sistema

Para agregar nuevas funcionalidades:

1. **Agregar acciones al slice**: Crear nuevos thunks en `consultationsSlice.js`
2. **Actualizar el estado**: Modificar el estado inicial y reducers según sea necesario
3. **Agregar selectores**: Crear nuevos selectores para acceder a datos específicos
4. **Actualizar el hook**: Agregar nuevas acciones y selectores al hook `useConsultations`

Este sistema proporciona una base sólida para manejar el estado complejo de las consultas médicas de manera eficiente y mantenible.