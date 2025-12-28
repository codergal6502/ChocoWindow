import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

document.body.className = "dark:bg-gray-800"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
