import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Proteção global para garantir que process.env exista no contexto do navegador
// Isso evita erros de "process is not defined" em tempo de execução
if (typeof window !== 'undefined') {
  window.process = window.process || { env: {} } as any;
}

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}