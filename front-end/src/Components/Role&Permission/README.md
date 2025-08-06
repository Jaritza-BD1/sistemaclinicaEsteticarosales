# Gestión de Roles y Permisos

Este módulo proporciona una interfaz completa para la gestión de roles y permisos en el sistema de la Clínica Estética Rosales.

## Características

### Gestión de Roles
- ✅ Crear nuevos roles
- ✅ Editar roles existentes
- ✅ Eliminar roles (desactivación lógica)
- ✅ Búsqueda y filtrado de roles
- ✅ **Paginación avanzada** (5, 10, 25, 50 registros por página)
- ✅ Vista compacta para mejor visualización
- ✅ Validación de formularios
- ✅ Protección del rol de administrador

### Gestión de Permisos
- ✅ Asignar permisos por rol y objeto
- ✅ Editar permisos existentes
- ✅ Visualización clara de permisos con chips
- ✅ Interfaz intuitiva con checkboxes
- ✅ Filtrado por rol
- ✅ **Paginación de objetos** para mejor rendimiento
- ✅ Vista compacta opcional

## Componentes

### Página Principal
- `RolandPermissionpage.jsx` - Página principal con pestañas para roles y permisos

### Gestión de Roles
- `RolesManagement.jsx` - Componente principal de gestión de roles con paginación
- `NewRolModal.jsx` - Modal para crear nuevos roles
- `EditRolModal.jsx` - Modal para editar roles existentes

### Gestión de Permisos
- `PermissionsManagement.jsx` - Componente principal de gestión de permisos con paginación

## Estructura de Datos

### Rol
```javascript
{
  atr_id_rol: number,
  atr_rol: string,           // Nombre del rol (máx 30 caracteres)
  atr_descripcion: string,   // Descripción (máx 100 caracteres)
  atr_activo: boolean,       // Estado activo/inactivo
  atr_creado_por: string,    // Usuario que creó el rol
  atr_fecha_creacion: Date,  // Fecha de creación
  atr_modificado_por: string, // Usuario que modificó por última vez
  atr_fecha_modificacion: Date // Fecha de última modificación
}
```

### Permiso
```javascript
{
  atr_id_rol: number,        // ID del rol
  atr_id_objeto: number,     // ID del objeto
  atr_permiso_insercion: boolean,    // Permiso para insertar
  atr_permiso_eliminacion: boolean,  // Permiso para eliminar
  atr_permiso_actualizacion: boolean, // Permiso para actualizar
  atr_permiso_consultar: boolean,     // Permiso para consultar
  atr_activo: boolean,       // Estado activo/inactivo
  atr_creado_por: string,    // Usuario que creó el permiso
  atr_fecha_creacion: Date,  // Fecha de creación
  atr_modificado_por: string, // Usuario que modificó por última vez
  atr_fecha_modificacion: Date // Fecha de última modificación
}
```

### Objeto
```javascript
{
  atr_id_objetos: number,
  atr_objeto: string,        // Nombre del objeto
  atr_descripcion: string,   // Descripción del objeto
  atr_tipo_objeto: string,   // Tipo: PANTALLA, REPORTE, FUNCION, PROCESO
  atr_url: string,           // URL asociada al objeto
  atr_activo: boolean,       // Estado activo/inactivo
  atr_creado_por: string,    // Usuario que creó el objeto
  atr_fecha_creacion: Date,  // Fecha de creación
  atr_modificado_por: string, // Usuario que modificó por última vez
  atr_fecha_modificacion: Date // Fecha de última modificación
}
```

## API Endpoints

### Roles
- `GET /api/roles` - Obtener todos los roles (con paginación)
  - Query params: `page`, `limit`, `search`, `activo`
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear nuevo rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol (desactivar)

### Permisos
- `GET /api/permisos` - Obtener todos los permisos
- `GET /api/permisos/rol/:idRol` - Obtener permisos por rol
- `GET /api/permisos/:idRol/:idObjeto` - Obtener permiso específico
- `POST /api/permisos/upsert` - Crear o actualizar permiso
- `DELETE /api/permisos/:idRol/:idObjeto` - Eliminar permiso

### Objetos
- `GET /api/objetos` - Obtener todos los objetos (con paginación)
  - Query params: `page`, `limit`, `search`, `activo`
- `GET /api/objetos/:id` - Obtener objeto por ID
- `POST /api/objetos` - Crear nuevo objeto
- `PUT /api/objetos/:id` - Actualizar objeto
- `DELETE /api/objetos/:id` - Eliminar objeto (desactivar)

## Paginación

### Frontend
- **Componente**: `TablePagination` de Material-UI
- **Opciones**: 5, 10, 25, 50 registros por página
- **Navegación**: Botones anterior/siguiente + selector de página
- **Información**: "X-Y de Z registros"
- **Responsive**: Se adapta a dispositivos móviles

### Backend
- **Parámetros**: `page` (basado en 1), `limit`
- **Respuesta**: 
```javascript
{
  data: [...], // Registros de la página actual
  meta: {
    total: number,      // Total de registros
    page: number,       // Página actual
    limit: number,      // Registros por página
    pages: number,      // Total de páginas
    hasNext: boolean,   // Hay página siguiente
    hasPrev: boolean    // Hay página anterior
  }
}
```

## Seguridad

- Todas las rutas requieren autenticación
- Solo usuarios con rol de administrador (ID: 1) pueden acceder
- El rol de administrador no puede ser eliminado
- Validación de formularios en frontend y backend
- Logging de todas las operaciones

## Uso

### Acceso
1. Iniciar sesión como administrador
2. Navegar a `/admin/permisos`
3. Usar las pestañas para alternar entre Roles y Permisos

### Gestión de Roles con Paginación
1. **Navegar**: Usar los controles de paginación en la parte inferior
2. **Cambiar tamaño**: Seleccionar 5, 10, 25 o 50 registros por página
3. **Buscar**: El término de búsqueda se aplica a todas las páginas
4. **Filtrar**: Los filtros se aplican globalmente
5. **Vista compacta**: Activar el switch para ver más registros

### Crear un Rol
1. Hacer clic en "Nuevo Rol"
2. Completar el formulario:
   - Nombre del rol (obligatorio, 3-30 caracteres)
   - Descripción (obligatorio, máx 100 caracteres)
   - Estado (activo/inactivo)
3. Hacer clic en "Crear Rol"

### Editar un Rol
1. Hacer clic en el ícono de editar en la fila del rol
2. Modificar los campos necesarios
3. Hacer clic en "Guardar Cambios"

### Eliminar un Rol
1. Hacer clic en el ícono de eliminar en la fila del rol
2. Confirmar la eliminación en el diálogo
3. El rol se desactivará (no se elimina físicamente)

### Gestión de Permisos con Paginación
1. **Seleccionar rol**: Usar el dropdown para elegir el rol
2. **Navegar objetos**: Usar paginación para ver todos los objetos
3. **Vista compacta**: Activar para ver más objetos por página
4. **Editar permisos**: Hacer clic en el ícono de seguridad

### Asignar Permisos
1. Seleccionar el rol en el dropdown
2. Hacer clic en el ícono de seguridad para el objeto deseado
3. Marcar/desmarcar los permisos necesarios:
   - Consultar
   - Insertar
   - Actualizar
   - Eliminar
4. Hacer clic en "Guardar Permisos"

## Validaciones

### Roles
- Nombre: 3-30 caracteres, único
- Descripción: obligatoria, máx 100 caracteres
- No se puede eliminar el rol de administrador

### Permisos
- Rol y objeto deben existir
- Los permisos se guardan como booleanos
- Al desactivar un permiso, todos los permisos se resetean a false

### Paginación
- Página mínima: 1
- Límite por página: 5, 10, 25, 50
- Búsqueda y filtros se aplican globalmente
- Reset automático a página 1 al cambiar filtros

## Estilos

El módulo incluye estilos personalizados en `roles-permissions.css`:
- Diseño responsive
- Animaciones suaves
- Estados de hover y focus
- Chips de estado coloridos
- Modales estilizados
- **Paginación personalizada**
- **Vista compacta**
- **Controles mejorados**

## Dependencias

### Frontend
- React
- Material-UI (MUI)
- Axios para llamadas API

### Backend
- Express.js
- Sequelize ORM
- JWT para autenticación
- Winston para logging

## Notas de Desarrollo

- Los componentes usan hooks de React para el estado
- Implementación de loading states y error handling
- Notificaciones con Snackbar de MUI
- Validación en tiempo real en formularios
- Diseño mobile-first responsive
- **Paginación del lado del servidor para mejor rendimiento**
- **Caching de datos para mejorar la experiencia de usuario**
- **Optimización de consultas con Sequelize**

## Mejoras de Rendimiento

### Frontend
- Paginación del lado del servidor
- Carga lazy de datos
- Estados de loading optimizados
- Debounce en búsquedas

### Backend
- Consultas optimizadas con `findAndCountAll`
- Índices en campos de búsqueda
- Paginación eficiente con `limit` y `offset`
- Logging estructurado para debugging 