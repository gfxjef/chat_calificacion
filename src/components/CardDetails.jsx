// src/components/CardDetails.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';

const CardDetails = ({ card, onClose, onAddInteraction }) => {
  const [interactionData, setInteractionData] = useState({
    quienInteractuo: '',
    viaInteraccion: 'Correo',
    fechaInteraccion: dayjs().format('YYYY-MM-DDTHH:mm'),
    mensaje: ''
  });

  const handleAddInteraction = (e) => {
    e.preventDefault();

    // Validar que todos los campos estén completos
    if (
      !interactionData.quienInteractuo ||
      !interactionData.viaInteraccion ||
      !interactionData.fechaInteraccion ||
      !interactionData.mensaje
    ) {
      console.error('Todos los campos son obligatorios');
      return;
    }

    // Crear la interacción con un ID único
    const interaction = {
      id: `interaction-${Date.now()}`,
      quienInteractuo: interactionData.quienInteractuo,
      viaInteraccion: interactionData.viaInteraccion,
      fechaInteraccion: interactionData.fechaInteraccion,
      mensaje: `${interactionData.quienInteractuo} - ${interactionData.viaInteraccion} - ${dayjs(interactionData.fechaInteraccion).format('YYYY-MM-DDTHH:mm')}: ${interactionData.mensaje}`,
      tipo: interactionData.mensaje.toLowerCase().includes('reinicio') ? 'reinicio' : 'normal'
    };

    // Llamar a la función para agregar la interacción y forzar actualización
    onAddInteraction(interaction);
    
    // Forzar re-render del componente
    setInteractionData(prev => ({
      ...prev,
      quienInteractuo: '',
      viaInteraccion: 'Correo',
      fechaInteraccion: dayjs().format('YYYY-MM-DDTHH:mm'),
      mensaje: ''
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        {/* Título reducido */}
        <h4>Detalles de la Tarjeta</h4>

        {/* Actualización del card-header con tarjetas individuales */}
        <div className="card-header" style={{
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div className="info-card" style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{color: '#313a59'}}>Número de Sesión:</strong>
            <span style={{color: '#666'}}>{card.id}</span>
          </div>
          <div className="info-card" style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{color: '#313a59'}}>Cliente:</strong>
            <span style={{color: '#666'}}>{card.cliente}</span>
          </div>
          <div className="info-card" style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{color: '#313a59'}}>Empresa:</strong>
            <span style={{color: '#666'}}>{card.empresa}</span>
          </div>
          <div className="info-card" style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{color: '#313a59'}}>RUC:</strong>
            <span style={{color: '#666'}}>{card.ruc}</span>
          </div>
          <div className="info-card" style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{color: '#313a59'}}>Teléfono:</strong>
            <span style={{color: '#666'}}>{card.telefono}</span>
          </div>
          <div className="info-card" style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{color: '#313a59'}}>Correo:</strong>
            <span style={{color: '#666'}}>{card.correo}</span>
          </div>
        </div>

        <div className="modal-columns">
          {/* Columna izquierda: Lista de interacciones */}
        <div className="interactions-column" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{
            color: '#313a59',
            marginBottom: '20px',
            borderBottom: '2px solid #60baa1',
            paddingBottom: '10px'
          }}>Interacciones:</h4>
          <div className="interactions-list" style={{
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
              {/* Interacciones */}
              {(card.interactions || []).map((interaction) => (
                <div key={interaction.id} className={`interaction-item ${interaction.tipo === 'reinicio' ? 'reinicio' : ''}`} style={{
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  transition: 'background-color 0.2s'
                }}>
                  {(() => {
                    const parts = interaction.mensaje.split(' - ');
                    if (parts.length >= 3) {
                      const [cliente, via, fechaHoraMensaje] = parts;
                      const [fechaHora, mensaje] = fechaHoraMensaje.split(': ', 2);
                      
                      return (
                        <React.Fragment>
                          <p style={{color: '#313a59', marginBottom: '5px'}}>
                            <strong>{cliente}</strong> - 
                            <em>{via}</em> - 
                            {fechaHora}:
                          </p>
                          <p style={{color: '#666', marginTop: '5px'}}>{mensaje}</p>
                        </React.Fragment>
                      );
                    }
                    return (
                      <p style={{color: '#666'}}>{interaction.mensaje}</p>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha: Formulario para agregar interacciones */}
          <div className="form-column">
            <h4>Agregar Interacción:</h4>
            <form onSubmit={handleAddInteraction}>
              <label>
                Quién interactuó:
                <select
                  value={interactionData.quienInteractuo}
                  onChange={(e) => setInteractionData({ ...interactionData, quienInteractuo: e.target.value })}
                  required
                >
                  <option value="">-- Selecciona una opción --</option>
                  <option value="Asesor">Asesor</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              <label>
                Vía de Interacción:
                <select
                  value={interactionData.viaInteraccion}
                  onChange={(e) => setInteractionData({ ...interactionData, viaInteraccion: e.target.value })}
                >
                  <option value="Correo">Correo</option>
                  <option value="Llamada">Llamada</option>
                  <option value="Whatsapp">Whatsapp</option>
                </select>
              </label>

              <label>
                Fecha de Interacción:
                <input
                  type="datetime-local"
                  value={interactionData.fechaInteraccion}
                  onChange={(e) => setInteractionData({ ...interactionData, fechaInteraccion: e.target.value })}
                  required
                />
              </label>

              <label>
                Mensaje:
                <textarea
                  value={interactionData.mensaje}
                  onChange={(e) => setInteractionData({ ...interactionData, mensaje: e.target.value })}
                  required
                />
              </label>

              <button type="submit">Agregar Interacción</button>
              <button type="button" onClick={onClose}>
                Cerrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
