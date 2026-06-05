import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { setAuthToken } from './services/api';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const token = localStorage.getItem('token');
if (token) setAuthToken(token);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
