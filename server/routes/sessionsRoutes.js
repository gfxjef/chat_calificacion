// server/routes/sessionsRoutes.js
import { Router } from 'express';
import pool from '../dbConfig.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Crear nueva sesión (etiqueta) con campos adicionales
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cliente, correo, empresa, ruc, consulta, fecha, telefono } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!cliente || !correo || !empresa || !ruc || !consulta || !fecha || !telefono) {
      return res.status(400).json({ error: 'Faltan campos necesarios' });
    }

    // Insertar la sesión con los nuevos campos
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await pool.query(`
          INSERT INTO conversaciones_sesion (userId, cliente, correo, estado, fecha_creacion, empresa, ruc, consulta, fecha, telefono)
          VALUES (?, ?, ?, 'en-conversacion', NOW(), ?, ?, ?, ?, ?)
        `, [userId, cliente, correo, empresa, ruc, consulta, fecha, telefono]);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
      }
    }

    const newId = result.insertId;
    return res.json({
      msg: 'Sesión creada',
      id: newId,
      correo,
      userId,
      estado: 'en-conversacion',
      empresa,
      ruc,
      consulta,
      fecha,
      telefono
    });
  } catch (error) {
    console.error('Error creando sesión:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Listar solo las sesiones del usuario actual con campos adicionales
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT id, userId, cliente, correo, estado, fecha_creacion, empresa, ruc, consulta, fecha, telefono
      FROM conversaciones_sesion
      WHERE userId = ?
      ORDER BY id DESC
    `, [userId]);

    return res.json(rows); // Ahora incluye los nuevos campos
  } catch (error) {
    console.error('Error listando sesiones:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Crear un historial (mensaje) en una sesión dada
router.post('/:id/historial', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sesionId = req.params.id;
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'Falta el mensaje' });
    }

    // Validar que la sesión le pertenezca al user
    const [sesionRows] = await pool.query(`
      SELECT * FROM conversaciones_sesion
      WHERE id = ? AND userId = ?
    `, [sesionId, userId]);

    if (sesionRows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    // Obtener el estado actual de la sesión
    const [estadoRows] = await pool.query(`
      SELECT estado FROM conversaciones_sesion
      WHERE id = ?
    `, [sesionId]);

    const estado = estadoRows[0].estado;
    const tipo = estado === 'en-conversacion' ? 'conversacion' : 'reinicio';

    // Insertar el mensaje en el historial con tipo
    await pool.query(`
      INSERT INTO conversaciones_historial (id_sesion, mensaje, fecha, tipo)
      VALUES (?, ?, NOW(), ?)
    `, [sesionId, mensaje, tipo]);

    return res.json({ msg: 'Mensaje agregado al historial' });
  } catch (error) {
    console.error('Error creando mensaje:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener historial de una sesión
router.get('/:id/historial', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; 
    const sesionId = req.params.id;

    // Validar que la sesión le pertenezca
    const [sesionRows] = await pool.query(`
      SELECT * FROM conversaciones_sesion
      WHERE id = ? AND userId = ?
    `, [sesionId, userId]);

    if (sesionRows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    // Obtener historial
    const [historialRows] = await pool.query(`
      SELECT * FROM conversaciones_historial
      WHERE id_sesion = ?
      ORDER BY id ASC
    `, [sesionId]);

    return res.json(historialRows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// NUEVA RUTA: Actualizar estado de la sesión (PUT /sessions/:id)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sesionId = req.params.id;
    const { estado } = req.body;

    if (!estado || !['en-conversacion', 'proceso-terminado'].includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Los valores permitidos son: en-conversacion, proceso-terminado' 
      });
    }

    // Verificar que la sesión pertenezca al usuario
    const [sesionRows] = await pool.query(`
      SELECT * FROM conversaciones_sesion
      WHERE id = ? AND userId = ?
    `, [sesionId, userId]);

    if (sesionRows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    // Actualizar la sesión con el nuevo estado
    await pool.query(`
      UPDATE conversaciones_sesion
      SET estado = ?
      WHERE id = ?
    `, [estado, sesionId]);

    return res.json({ msg: 'Sesión actualizada', estado });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    return res.status(500).json({ error: 'Error interno al actualizar sesión' });
  }
});

export default router;
