// server/routes/authRoutes.js
import { Router } from 'express';
import pool from '../dbConfig.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Faltan campos' });
    }

    // 1. Buscar el usuario en la BD
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];  
    // user.password es la contraseña en la BD
    // user.rol, user.correo, user.nombre, etc.

    // 2. Comparar contraseñas (si está hasheada en la BD)
    //    Si NO está hasheada, la comparación sería user.password === password
    if (user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

    // 3. Crear token con JWT
    const token = jwt.sign(
      {
        id: user.id,
        correo: user.correo,
        rol: user.rol,
        nombre: user.nombre,
      },
      process.env.JWT_SECRET || 'MI_SECRETO_SUPER_SECRETO',
      {
        expiresIn: '1h', // el token expirará en 1 hora
      }
    );

    // 4. Devolver el token al frontend
    return res.json({
      msg: 'Login exitoso',
      token,
      nombre: user.nombre,
      rol: user.rol,
    });
  } catch (error) {
    console.error('Error en POST /login:', error);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

export default router;
