# 🎨 Sistema de Colores - Rosa Pastel

## 📋 Descripción General

Este sistema de colores está diseñado específicamente para el sistema médico con una paleta de rosa pastel y contrastes blancos, proporcionando una experiencia visual moderna, profesional y acogedora.

## 🌸 Paleta de Colores

### **Rosas Principales**
```css
--rose-50: #fdf2f8;   /* Fondo principal */
--rose-100: #fce7f3;  /* Fondo secundario */
--rose-200: #fbcfe8;  /* Bordes suaves */
--rose-300: #f9a8d4;  /* Hover states */
--rose-400: #f472b6;  /* Botones principales */
--rose-500: #ec4899;  /* Acentos */
--rose-600: #db2777;  /* Texto importante */
--rose-700: #be185d;  /* Énfasis */
```

### **Blancos y Contrastes**
```css
--white-pure: #ffffff;   /* Blanco puro */
--white-warm: #fefefe;   /* Blanco cálido */
--white-soft: #fafafa;   /* Blanco suave */
--white-rose: #fef7f9;   /* Blanco con tinte rosa */
```

## 🎯 Cómo Usar el Sistema

### **1. Importar el Sistema**
```javascript
// En tu componente principal (App.js o index.js)
import './asset/Style/color-system.css';
```

### **2. Usar Variables CSS**
```css
.mi-componente {
  background-color: var(--rose-50);
  color: var(--rose-600);
  border: 2px solid var(--rose-200);
}
```

### **3. Usar Clases Utilitarias**
```html
<div class="bg-rose-50 text-rose-600 border-rose-200">
  Contenido con colores del sistema
</div>
```

### **4. Usar Componentes Predefinidos**
```html
<button class="btn-primary">Botón Principal</button>
<button class="btn-secondary">Botón Secundario</button>
<input class="input-primary" placeholder="Campo de entrada" />
<div class="card-primary">Tarjeta con estilo</div>
```

## 📱 Responsividad

El sistema incluye breakpoints automáticos:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Los tamaños y espaciados se ajustan automáticamente.

## 🎨 Componentes Disponibles

### **Botones**
```html
<!-- Botón principal con gradiente -->
<button class="btn-primary">Guardar</button>

<!-- Botón secundario con borde -->
<button class="btn-secondary">Cancelar</button>
```

### **Inputs**
```html
<!-- Campo de entrada estilizado -->
<input class="input-primary" type="text" placeholder="Nombre" />
```

### **Cards**
```html
<!-- Tarjeta con sombra y hover -->
<div class="card-primary">
  <h3>Contenido de la tarjeta</h3>
  <p>Descripción...</p>
</div>
```

### **Modales**
```html
<!-- Overlay del modal -->
<div class="modal-overlay">
  <!-- Contenido del modal -->
  <div class="modal-content">
    <h2>Título del Modal</h2>
    <p>Contenido...</p>
  </div>
</div>
```

### **Headers**
```html
<!-- Header con gradiente -->
<header class="header-gradient">
  <h1>Título Principal</h1>
  <p>Descripción...</p>
</header>
```

## 🌈 Gradientes Disponibles

```css
.gradient-primary  /* Gradiente principal (azul a púrpura) */
.gradient-rose     /* Gradiente rosa */
.gradient-soft     /* Gradiente suave */
.gradient-warm     /* Gradiente cálido */
```

## 📏 Espaciado y Tamaños

### **Bordes Redondeados**
```css
.rounded-sm   /* 4px */
.rounded-md   /* 8px */
.rounded-lg   /* 12px */
.rounded-xl   /* 16px */
.rounded-full /* 9999px */
```

### **Sombras**
```css
.shadow-sm    /* Sombra pequeña */
.shadow-md    /* Sombra media */
.shadow-lg    /* Sombra grande */
.shadow-xl    /* Sombra extra grande */
.shadow-rose  /* Sombra rosa especial */
```

## 🔄 Estados Interactivos

### **Hover**
```css
.hover:bg-rose-100    /* Fondo rosa claro en hover */
.hover:bg-rose-200    /* Fondo rosa medio en hover */
.hover:text-rose-600  /* Texto rosa en hover */
```

### **Focus**
```css
.focus:border-rose-500  /* Borde rosa en focus */
.focus:ring-rose-500    /* Anillo rosa en focus */
```

## 🎭 Transiciones

```css
.transition-fast   /* 150ms */
.transition-normal /* 250ms */
.transition-slow   /* 350ms */
```

## ♿ Accesibilidad

El sistema incluye:
- **Alto contraste**: Para usuarios con problemas de visión
- **Modo oscuro**: Soporte para preferencias del sistema
- **Focus visible**: Indicadores claros de focus
- **Contraste adecuado**: Cumple estándares WCAG

## 📝 Ejemplos de Uso

### **Formulario Completo**
```html
<div class="card-primary">
  <h2 class="text-rose-600">Registro de Paciente</h2>
  
  <form>
    <div>
      <label class="text-rose-500">Nombre:</label>
      <input class="input-primary" type="text" />
    </div>
    
    <div>
      <label class="text-rose-500">Apellido:</label>
      <input class="input-primary" type="text" />
    </div>
    
    <div>
      <button class="btn-primary">Guardar</button>
      <button class="btn-secondary">Cancelar</button>
    </div>
  </form>
</div>
```

### **Modal de Confirmación**
```html
<div class="modal-overlay">
  <div class="modal-content">
    <h2 class="text-rose-600">Confirmar Acción</h2>
    <p class="text-secondary">¿Está seguro de que desea continuar?</p>
    
    <div>
      <button class="btn-primary">Confirmar</button>
      <button class="btn-secondary">Cancelar</button>
    </div>
  </div>
</div>
```

### **Header de Página**
```html
<header class="header-gradient">
  <h1 class="text-white">Gestión de Pacientes</h1>
  <p class="text-white">Administre la información de sus pacientes</p>
</header>
```

## 🔧 Personalización

### **Cambiar Colores Principales**
```css
:root {
  --rose-500: #tu-color-personalizado;
  --rose-400: #tu-color-secundario;
}
```

### **Agregar Nuevos Componentes**
```css
.mi-nuevo-componente {
  background: var(--rose-50);
  border: 2px solid var(--rose-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: var(--transition-normal);
}
```

## 📚 Mejores Prácticas

1. **Usar variables CSS**: Siempre usa `var(--nombre-variable)` en lugar de colores hardcodeados
2. **Mantener consistencia**: Usa los mismos colores para elementos similares
3. **Considerar accesibilidad**: Asegúrate de que el contraste sea adecuado
4. **Usar clases utilitarias**: Aprovecha las clases predefinidas cuando sea posible
5. **Responsividad**: El sistema se adapta automáticamente, pero verifica en diferentes dispositivos

## 🚀 Próximos Pasos

1. Importar el sistema en `App.js`
2. Actualizar componentes existentes para usar el nuevo sistema
3. Crear nuevos componentes siguiendo las guías
4. Probar en diferentes dispositivos y navegadores
5. Validar accesibilidad

---

**Nota**: Este sistema está diseñado para ser escalable y mantenible. Cualquier cambio en las variables CSS se reflejará automáticamente en todos los componentes que las usen. 