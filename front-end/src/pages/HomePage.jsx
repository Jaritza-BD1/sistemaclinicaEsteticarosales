import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Archivo de estilos (crear uno nuevo)

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      {/* Header con logo y nombre */}
      <header className="header">
        <div className="logo-container">
          <div className="rose-logo">🌹</div>
          <h1 className="clinic-name">Estética Rosales</h1>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        <div className="welcome-section">
          <h2>Sistema Clinica Estetica Rosales</h2>
          <p className="slogan">
            Belleza Natural en Tonos Pastel
          </p>
        </div>

        {/* Botón de inicio de sesión */}
        <button 
          className="login-button"
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión
        </button>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Estética Rosales - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default HomePage;