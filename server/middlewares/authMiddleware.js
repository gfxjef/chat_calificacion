// server/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'MI_SECRETO_SUPER_SECRETO'
    );
    req.user = decoded; // ej: { id: 1, correo: '...', rol: '...', iat:..., exp:... }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
