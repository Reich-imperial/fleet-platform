import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from './router/AppRouter';

document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
