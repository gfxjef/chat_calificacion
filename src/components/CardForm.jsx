// src/components/CardForm.jsx
import React, { useState } from 'react';

const CardForm = ({ onClose, onSubmit }) => {
  // Ajustamos el estado inicial para incluir los nuevos campos
  const [formData, setFormData] = useState({
    viaContacto: 'Correo', // Campo existente: Vía de Contacto
    telefono: '',        // Nuevo campo: Número de Teléfono
    fecha: new Date().toISOString().split('T')[0], // Campo existente: Fecha
    correo: '',          // Campo existente: Correo
    empresa: '',         // Nuevo campo: Empresa
    ruc: '',             // Nuevo campo: RUC
    consulta: '',        // Nuevo campo: Consulta
    cliente: ''          // Nuevo campo: Cliente
  });

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Enviar los datos al componente padre
    onClose();          // Cerrar el formulario modal
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Nueva Sesión</h2> {/* Actualizado de "Nueva Tarjeta" a "Nueva Sesión" */}

        <form onSubmit={handleSubmit}>

          {/* Vía de Contacto */}
          <label>
            Vía de Contacto:
            <select
              name="viaContacto"
              value={formData.viaContacto}
              onChange={(e) => setFormData({ ...formData, viaContacto: e.target.value })}
            >
              <option value="Correo">Correo</option>
              <option value="Llamada">Llamada</option>
              <option value="Whatsapp">Whatsapp</option>
            </select>
          </label>

          {/* Número de Teléfono (Nuevo Campo) */}
          <label>
            Número de Teléfono:
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required // Si es obligatorio, puedes mantenerlo; de lo contrario, elimínalo
            />
          </label>

          {/* Fecha */}
          <label>
            Fecha:
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </label>

          {/* Correo */}
          <label>
            Correo:
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
            />
          </label>

          {/* Empresa (Nuevo Campo) */}
          <label>
            Empresa:
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              required
            />
          </label>

          {/* RUC (Nuevo Campo) */}
          <label>
            RUC:
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              required
            />
          </label>

          {/* Cliente (Nuevo Campo) */}
          <label>
            Cliente:
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              required
            />
          </label>

          {/* Consulta (Nuevo Campo) */}
          <label>
            Consulta:
            <textarea
              name="consulta"
              value={formData.consulta}
              onChange={(e) => setFormData({ ...formData, consulta: e.target.value })}
              required
            />
          </label>

          {/* Botones de Acción */}
          <button type="submit">Guardar</button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
