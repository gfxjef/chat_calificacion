// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // <-- Importante

const Login = () => {
  const [form, setForm] = useState({
    correo: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);

  // Hook de react-router-dom para navegar
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // limpiar mensaje

    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        correo: form.correo,
        password: form.password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Asegúrate de DESCOMENTAR o agregar
        navigate('/board');
      }
    } catch (error) {
      console.error('Error login:', error);
      if (error.response && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Error de conexión o de servidor');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#2c3e50',
          marginBottom: '1.5rem'
        }}>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#34495e', fontWeight: '500' }}>Correo:</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#34495e', fontWeight: '500' }}>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease',
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              background: '#3498db',
              color: '#fff',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
              marginTop: '1rem'
            }}
          >
            Ingresar
          </button>
        </form>

        {message && <p style={{
          color: '#e74c3c',
          textAlign: 'center',
          marginTop: '1rem',
          padding: '0.5rem',
          borderRadius: '4px',
          backgroundColor: '#f8d7da'
        }}>{message}</p>}

      {token && (
        <div>
          <p>Token de sesión (JWT):</p>
          <textarea
            rows="4"
            cols="50"
            value={token}
            readOnly
          ></textarea>
        </div>
      )}
      </div>
    </div>
  );
};

export default Login;
