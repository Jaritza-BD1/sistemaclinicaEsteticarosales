import React from 'react';
import './ColorSystemDemo.css';

const ColorSystemDemo = () => {
  return (
    <div className="color-system-demo">
      <header className="header-gradient">
        <h1 className="text-white">Sistema de Colores - Rosa Pastel</h1>
        <p className="text-white">Demostración de la paleta de colores y componentes</p>
      </header>

      <div className="demo-container">
        {/* Paleta de Colores */}
        <section className="demo-section">
          <h2 className="text-rose-600">🎨 Paleta de Colores</h2>
          
          <div className="color-palette">
            <div className="color-swatch bg-rose-50">
              <span className="color-name">Rose 50</span>
              <span className="color-hex">#fdf2f8</span>
            </div>
            <div className="color-swatch bg-rose-100">
              <span className="color-name">Rose 100</span>
              <span className="color-hex">#fce7f3</span>
            </div>
            <div className="color-swatch bg-rose-200">
              <span className="color-name">Rose 200</span>
              <span className="color-hex">#fbcfe8</span>
            </div>
            <div className="color-swatch bg-rose-300">
              <span className="color-name">Rose 300</span>
              <span className="color-hex">#f9a8d4</span>
            </div>
            <div className="color-swatch bg-rose-400">
              <span className="color-name">Rose 400</span>
              <span className="color-hex">#f472b6</span>
            </div>
            <div className="color-swatch bg-rose-500">
              <span className="color-name text-white">Rose 500</span>
              <span className="color-hex text-white">#ec4899</span>
            </div>
            <div className="color-swatch bg-rose-600">
              <span className="color-name text-white">Rose 600</span>
              <span className="color-hex text-white">#db2777</span>
            </div>
            <div className="color-swatch bg-rose-700">
              <span className="color-name text-white">Rose 700</span>
              <span className="color-hex text-white">#be185d</span>
            </div>
          </div>
        </section>

        {/* Componentes */}
        <section className="demo-section">
          <h2 className="text-rose-600">🔧 Componentes</h2>
          
          <div className="components-grid">
            {/* Botones */}
            <div className="component-group">
              <h3 className="text-rose-500">Botones</h3>
              <div className="button-demo">
                <button className="btn-primary">Botón Principal</button>
                <button className="btn-secondary">Botón Secundario</button>
              </div>
            </div>

            {/* Inputs */}
            <div className="component-group">
              <h3 className="text-rose-500">Campos de Entrada</h3>
              <div className="input-demo">
                <input 
                  className="input-primary" 
                  type="text" 
                  placeholder="Campo de texto"
                />
                <input 
                  className="input-primary" 
                  type="email" 
                  placeholder="Correo electrónico"
                />
              </div>
            </div>

            {/* Cards */}
            <div className="component-group">
              <h3 className="text-rose-500">Tarjetas</h3>
              <div className="card-demo">
                <div className="card-primary">
                  <h4 className="text-rose-600">Tarjeta de Ejemplo</h4>
                  <p className="text-secondary">
                    Esta es una tarjeta con el estilo del sistema de colores.
                  </p>
                </div>
              </div>
            </div>

            {/* Modales */}
            <div className="component-group">
              <h3 className="text-rose-500">Modales</h3>
              <div className="modal-demo">
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h4 className="text-rose-600">Modal de Ejemplo</h4>
                    <p className="text-secondary">
                      Este es un ejemplo de modal con el sistema de colores.
                    </p>
                    <div className="modal-actions">
                      <button className="btn-primary">Confirmar</button>
                      <button className="btn-secondary">Cancelar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradientes */}
        <section className="demo-section">
          <h2 className="text-rose-600">🌈 Gradientes</h2>
          
          <div className="gradients-grid">
            <div className="gradient-demo gradient-primary">
              <span className="gradient-name text-white">Gradiente Principal</span>
            </div>
            <div className="gradient-demo gradient-rose">
              <span className="gradient-name text-white">Gradiente Rosa</span>
            </div>
            <div className="gradient-demo gradient-soft">
              <span className="gradient-name text-rose-600">Gradiente Suave</span>
            </div>
            <div className="gradient-demo gradient-warm">
              <span className="gradient-name text-rose-600">Gradiente Cálido</span>
            </div>
          </div>
        </section>

        {/* Estados */}
        <section className="demo-section">
          <h2 className="text-rose-600">🔄 Estados Interactivos</h2>
          
          <div className="states-grid">
            <div className="state-demo">
              <h4 className="text-rose-500">Hover</h4>
              <button className="btn-primary hover-demo">Pasa el mouse</button>
            </div>
            
            <div className="state-demo">
              <h4 className="text-rose-500">Focus</h4>
              <input 
                className="input-primary focus-demo" 
                type="text" 
                placeholder="Haz clic aquí"
              />
            </div>
            
            <div className="state-demo">
              <h4 className="text-rose-500">Transiciones</h4>
              <div className="transition-demo">
                <div className="transition-box">Hover me</div>
              </div>
            </div>
          </div>
        </section>

        {/* Sombras */}
        <section className="demo-section">
          <h2 className="text-rose-600">📏 Sombras</h2>
          
          <div className="shadows-grid">
            <div className="shadow-demo shadow-sm">
              <span className="shadow-name">Sombra Pequeña</span>
            </div>
            <div className="shadow-demo shadow-md">
              <span className="shadow-name">Sombra Media</span>
            </div>
            <div className="shadow-demo shadow-lg">
              <span className="shadow-name">Sombra Grande</span>
            </div>
            <div className="shadow-demo shadow-xl">
              <span className="shadow-name">Sombra Extra Grande</span>
            </div>
            <div className="shadow-demo shadow-rose">
              <span className="shadow-name">Sombra Rosa</span>
            </div>
          </div>
        </section>

        {/* Responsividad */}
        <section className="demo-section">
          <h2 className="text-rose-600">📱 Responsividad</h2>
          
          <div className="responsive-demo">
            <div className="responsive-box">
              <h4 className="text-rose-500">Responsive Box</h4>
              <p className="text-secondary">
                Este elemento se adapta automáticamente a diferentes tamaños de pantalla.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ColorSystemDemo; 