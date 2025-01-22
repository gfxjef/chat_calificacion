// server/dbConfig.js
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config(); // Carga variables de .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  
  // Configuraciones adicionales para mejorar estabilidad
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 segundos
  acquireTimeout: 10000, // 10 segundos
  timeout: 60000, // 1 minuto
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 segundos
  
  // Manejo de reconexión
  reconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 2000 // 2 segundos entre intentos
});

async function initDB() {
  try {
    // Crea tabla de sesiones (etiqueta) con columna 'estado'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversaciones_sesion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        cliente VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL,
        empresa VARCHAR(255) NOT NULL,
        ruc VARCHAR(20) NOT NULL,
        consulta TEXT NOT NULL,
        fecha DATE NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        estado ENUM('en-conversacion', 'proceso-terminado') NOT NULL DEFAULT 'en-conversacion',
        fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        -- Podrías meter aquí FOREIGN KEY (userId) REFERENCES usuarios(id)
      );
    `);

    // Crea tabla de historial
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversaciones_historial (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_sesion INT NOT NULL,
        mensaje TEXT NOT NULL,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_sesion) REFERENCES conversaciones_sesion(id)
      );
    `);

    console.log("Tablas creadas/verificadas correctamente.");
  } catch (error) {
    console.error("Error creando tablas:", error);
  }
}

initDB(); // Llamada inicial para crear/verificar tablas.

export default pool;
