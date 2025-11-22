# Configuración — Parámetros del Sistema

Esta guía rápida explica cómo probar la sección de "Parámetros del Sistema" en el frontend.

Requisitos previos
- Backend corriendo y accesible desde el frontend (asegúrate de que la variable baseURL de axios apunte al servidor correcto si aplica).
- Usuario con rol administrador (en backend el `atr_id_rol` == 1).

Endpoints esperados
- GET  /api/admin/maintenance/Parametro/meta   -> devuelve metadata/estructura de campos (opcional pero recomendado)
- GET  /api/admin/maintenance/Parametro         -> lista paginada (params: page, limit, q, offset, field)
- GET  /api/admin/maintenance/Parametro/:id     -> obtener registro por id
- POST /api/admin/maintenance/Parametro         -> crear
- PUT  /api/admin/maintenance/Parametro/:id     -> actualizar
- DELETE /api/admin/maintenance/Parametro/:id   -> eliminar

Cómo probar localmente
1. Inicia backend y frontend:

```powershell
# desde la carpeta front-end
npm install
npm start
```

2. Abre la app en el navegador (por defecto http://localhost:3000). Inicia sesión con un usuario administrador.
3. Navega por el menú: Administración → Configuración → Parámetros del Sistema
   o visita directamente: `/configuracion/parametros`.
4. Deberías ver la tabla con parámetros. Prueba:
   - Crear: botón "Nuevo" → completar formulario → Guardar
   - Editar: botón "Editar" en una fila
   - Eliminar: botón "Eliminar" en una fila (aparecerá confirmación)
   - Búsqueda y paginación con los controles en la cabecera

Notas y solución de problemas
- Si no aparecen columnas: el componente intentará pedir `/meta`. Si ese endpoint no existe, intentará inferir campos desde la lista retornada por el backend.
- Si ves errores 401/403 en las llamadas: verifica token y permisos. Los endpoints requieren autenticación y rol administrador.
- Para desarrollo local con CORS: asegúrate que el backend permita peticiones desde el origen del frontend.

Siguientes pasos
- Agregar tests unitarios/E2E para el flujo CRUD.
- Añadir mapeo completo de metadata en backend (`/meta`) para validar tipos y mostrar formularios más precisos.

