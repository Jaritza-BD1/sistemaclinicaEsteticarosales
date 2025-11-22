import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './asset/Style/color-system.css'; // Importar el sistema de colores
import App from './App';
import GlobalErrorBoundary from './Components/common/GlobalErrorBoundary';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './redux/LocalStorage/store';
import { cleanCorruptedTokens } from './utils/auth';
import './utils/testTokenValidation'; // Importar script de prueba

// Limpiar tokens corruptos al inicio de la aplicación
cleanCorruptedTokens();


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
