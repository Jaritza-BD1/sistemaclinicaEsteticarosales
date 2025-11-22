# ScheduleAppointment Component

Un componente reutilizable para agendar citas de forma rápida en el sistema de clínica.

## Características

- **Validación Frontend**: Usa Yup con esquemas centralizados en `validationSchemas.js`
- **Integración Backend**: Conecta directamente con `appointmentService` para crear citas
- **Interfaz Compacta**: Diseño optimizado para agendamiento rápido
- **Campos Pre-rellenados**: Soporte para paciente y médico pre-seleccionados
- **Responsive**: Funciona en desktop y móvil

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `onSuccess` | `function(appointment)` | Sí | Callback ejecutado cuando la cita se crea exitosamente |
| `defaultPatientId` | `number` | No | ID del paciente a pre-seleccionar |
| `defaultDoctorId` | `number` | No | ID del médico a pre-seleccionar |
| `title` | `string` | No | Título del componente (default: "Agendar Cita Rápida") |

## Campos del Formulario

- **Paciente**: Autocomplete con búsqueda
- **Médico**: Select dropdown
- **Fecha**: DatePicker (solo fechas futuras)
- **Hora**: TimePicker
- **Duración**: Select (30min, 45min, 1h, 1.5h, 2h)
- **Tipo de Cita**: Select desde API
- **Motivo**: TextField multiline

## Validación

Usa `quickAppointmentValidationSchema` de `utils/validationSchemas.js`:

- Todos los campos requeridos
- Fecha debe ser hoy o futura
- Hora en formato HH:MM
- Duración limitada a valores predefinidos
- Motivo entre 3-200 caracteres

## Uso Básico

```jsx
import ScheduleAppointment from '../Components/appointments/ScheduleAppointment';

const MyComponent = () => {
  const handleAppointmentCreated = (appointment) => {
    console.log('Cita creada:', appointment);
    // Actualizar lista, mostrar notificación, etc.
  };

  return (
    <ScheduleAppointment
      onSuccess={handleAppointmentCreated}
    />
  );
};
```

## Uso con Valores Predefinidos

```jsx
<ScheduleAppointment
  onSuccess={handleAppointmentCreated}
  defaultPatientId={123}
  defaultDoctorId={456}
  title="Agendar Consulta de Seguimiento"
/>
```

## Integración con Backend

El componente automáticamente:
1. Carga pacientes, médicos y tipos de cita desde la API
2. Valida datos en frontend
3. Envía payload formateado al backend
4. Maneja errores y muestra feedback
5. Resetea formulario tras éxito
6. Ejecuta callback `onSuccess` con la cita creada

## Estados de Carga

- Muestra spinner durante la creación
- Deshabilita formulario durante submit
- Maneja errores de red y validación

## Dependencias

- `useAppointments` hook
- `appointmentService` functions
- `validationSchemas.js`
- Material-UI components
- date-fns para fechas