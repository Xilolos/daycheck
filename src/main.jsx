import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (screen?.orientation?.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
