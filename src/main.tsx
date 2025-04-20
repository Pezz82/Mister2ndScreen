import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerServiceWorker } from './services/pwaService';
import App from './App';
import './index.css';

// Register service worker for PWA functionality
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
