// src/pages/Board.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CardForm from '../components/CardForm';
import CardDetails from '../components/CardDetails';
import '../index.css';

// Columnas base de arrastrar y soltar
const initialColumns = {
  'en-conversacion': {
    id: 'en-conversacion',
    title: 'En Conversación',
    sessionIds: []
  },
  'proceso-terminado': {
    id: 'proceso-terminado',
    title: 'Proceso Terminado',
    sessionIds: []
  }
};

const Board = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [sessions, setSessions] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [userName, setUserName] = useState('');

  // Obtener nombre del usuario al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserName(payload.nombre || 'Usuario');
    }
  }, []);

  // Al montar, traer las sesiones del backend
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
        const token = localStorage.getItem('token'); // Debe existir ahora
        const res = await axios.get('http://localhost:3001/sessions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
      // res.data debe ser un array de sesiones { id, userId, estado, fecha_creacion, ...}
      const sessionsFromDB = res.data;

      // Reconstruir un objeto "sessions" y las columnas
      const newSessions = {};
      const newColumns = JSON.parse(JSON.stringify(initialColumns));

      // Obtener el historial para cada sesión
      for (const ses of sessionsFromDB) {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(
            `http://localhost:3001/sessions/${ses.id}/historial`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          // Formatear las interacciones manteniendo el tipo
          const interactions = res.data.map(hist => ({
            id: `interaction-${hist.id}`,
            quienInteractuo: hist.quienInteractuo,
            viaInteraccion: hist.viaInteraccion,
            fechaInteraccion: hist.fechaInteraccion,
            mensaje: hist.mensaje,
            tipo: hist.tipo
          }));
          
          newSessions[ses.id] = {
            ...ses,
            interactions
          };
          
          // Insertar en la columna según su estado
          if (newColumns[ses.estado]) {
            newColumns[ses.estado].sessionIds.push(ses.id);
          } else {
            newColumns['en-conversacion'].sessionIds.push(ses.id);
          }
        } catch (error) {
          console.error(`Error obteniendo historial para sesión ${ses.id}:`, error);
          // Si falla, crear la sesión sin interacciones
          newSessions[ses.id] = ses;
          if (newColumns[ses.estado]) {
            newColumns[ses.estado].sessionIds.push(ses.id);
          } else {
            newColumns['en-conversacion'].sessionIds.push(ses.id);
          }
        }
      }

      setSessions(newSessions);
      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Crear nueva sesión (etiqueta)
  const handleAddSession = async (formData) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:3001/sessions',
        {
          correo: formData.correo,
          empresa: formData.empresa,
          ruc: formData.ruc,
          consulta: formData.consulta,
          fecha: formData.fecha,
          telefono: formData.telefono,
          viaContacto: formData.viaContacto,
          cliente: formData.cliente
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchSessions();
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  // Drag and Drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    // remover de la columna origen
    const newStartIds = Array.from(start.sessionIds);
    newStartIds.splice(source.index, 1);

    // agregar a la columna destino
    const newFinishIds = Array.from(finish.sessionIds);
    newFinishIds.splice(destination.index, 0, draggableId);

    // Actualizar la sesión en el backend con el nuevo estado
    try {
      const token = localStorage.getItem('token');
      const newEstado = finish.id; // 'en-conversacion' o 'proceso-terminado'
      await axios.put(
        `http://localhost:3001/sessions/${draggableId}`,
        { estado: newEstado },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Actualizar el estado local
      const updatedColumns = {
        ...columns,
        [start.id]: {
          ...start,
          sessionIds: newStartIds
        },
        [finish.id]: {
          ...finish,
          sessionIds: newFinishIds
        }
      };

      // Actualizar 'estado' en sessions
      const updatedSession = { ...sessions[draggableId], estado: newEstado };
      setSessions((prev) => ({
        ...prev,
        [draggableId]: updatedSession
      }));

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Error updating session state:', error);
    }
  };

  const handleCardClick = (sessionId) => {
    const ses = sessions[sessionId];
    setSelectedSession(ses);
  };

  // Manejar la interacción en CardDetails
  const handleAddInteraction = async (sessionId, interactionData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Agregar la nueva interacción con todos los campos
      const res = await axios.post(
        `http://localhost:3001/sessions/${sessionId}/historial`,
        {
          quienInteractuo: interactionData.quienInteractuo,
          viaInteraccion: interactionData.viaInteraccion,
          fechaInteraccion: interactionData.fechaInteraccion,
          mensaje: interactionData.mensaje
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Cambiar el estado a 'en-conversacion'
      await axios.put(
        `http://localhost:3001/sessions/${sessionId}`,
        { estado: 'en-conversacion' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Crear nueva referencia de la sesión actualizada
      const updatedSession = {
        ...sessions[sessionId],
        estado: 'en-conversacion',
        interactions: [
          ...(sessions[sessionId].interactions || []),
          {
            id: `interaction-${res.data.id}`,
            quienInteractuo: interactionData.quienInteractuo,
            viaInteraccion: interactionData.viaInteraccion,
            fechaInteraccion: interactionData.fechaInteraccion,
            mensaje: interactionData.mensaje,
            tipo: 'conversacion'
          }
        ]
      };

      // Actualizar el estado de sesiones
      setSessions(prev => ({
        ...prev,
        [sessionId]: updatedSession
      }));

      // Mover la sesión a la columna 'en-conversacion'
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        
        // Remover de la columna actual
        Object.values(newColumns).forEach(col => {
          const index = col.sessionIds.indexOf(sessionId);
          if (index > -1) {
            col.sessionIds.splice(index, 1);
          }
        });

        // Agregar a 'en-conversacion'
        newColumns['en-conversacion'].sessionIds.push(sessionId);

        return newColumns;
      });

      // Si esta es la sesión seleccionada, actualizarla también
      if (selectedSession?.id === sessionId) {
        setSelectedSession(updatedSession);
      }
    } catch (error) {
      console.error('Error agregando interacción:', error);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header con mensaje de bienvenida */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#313a59',
        borderRadius: '8px',
        color: 'white'
      }}>
        <h3 style={{ 
          margin: 0,
          fontSize: '1rem',
          fontWeight: 'normal'
        }}>Hola, <span style={{ fontWeight: 'bold' }}>{userName}</span>, a continuación verás tus tarjetas activas</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: 'white',
              color: '#313a59',
              border: '1px solid #60baa1',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            + Agregar Sesión
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            style={{
              backgroundColor: '#60baa1',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board">
          {Object.values(columns).map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '15px',
                    margin: '0 10px',
                    minHeight: '500px',
                    width: '400px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h2 style={{
                    color: '#313a59',
                    marginBottom: '20px',
                    borderBottom: '2px solid #60baa1',
                    paddingBottom: '10px'
                  }}>{column.title}</h2>
                  {column.sessionIds.map((sessId, index) => {
                    const sessionData = sessions[sessId];
                    return (
                      <Draggable
                        draggableId={String(sessId)}
                        key={sessId}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(sessId)}
                          >
                            <h3 style={{ 
                              color: '#313a59',
                              marginBottom: '10px'
                            }}>{sessionData?.cliente || 'Sin Cliente'}</h3>
                            <p style={{ 
                              color: '#666',
                              margin: '5px 0'
                            }}>Correo: {sessionData?.correo}</p>
                            <p style={{ 
                              color: '#666',
                              margin: '5px 0'
                            }}>ID: {sessionData?.id}</p>
                            <p style={{ 
                              color: '#666',
                              margin: '5px 0'
                            }}>Estado: {sessionData?.estado}</p>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>


      {/* Formulario para crear sesión (usa CardForm por conveniencia) */}
      {showForm && (
        <CardForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddSession}
        />
      )}

      {/* Modal con detalles de la sesión */}
      {selectedSession && (
        <CardDetails
          card={selectedSession}
          onClose={() => setSelectedSession(null)}
          onAddInteraction={(interaction) =>
            handleAddInteraction(selectedSession.id, interaction)
          }
        />
      )}
    </div>
  );
};

export default Board;
