// server/index.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import sessionsRoutes from './routes/sessionsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de login
app.use('/auth', authRoutes);

// Rutas de sesiones
app.use('/sessions', sessionsRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
