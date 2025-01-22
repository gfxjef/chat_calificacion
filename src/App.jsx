// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos las páginas:
import Board from './pages/Board';
import Login from './pages/Login';

// Componente principal con Router
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Al entrar a "/", redireccionamos a "/login" */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Ruta para el Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta para el Board */}
        <Route path="/board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
