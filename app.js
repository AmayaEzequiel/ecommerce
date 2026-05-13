const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// NOMBRE DEL ALUMNO (CAMBIA POR TU NOMBRE REAL)
const NOMBRE_ALUMNO = "Ezequiel Amaya";

// Render asigna automáticamente un puerto
const port = process.env.PORT || 10000;

// 1. Configuración del POOL de conexiones (mejor que connection simple)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    ca: Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf-8')
  },
  waitForConnections: true,
  connectionLimit: 10,      // Máximo 10 conexiones simultáneas
  queueLimit: 0,            // Cola ilimitada
  enableKeepAlive: true,    // Mantener conexiones vivas
  keepAliveInitialDelay: 0
});

// 2. Verificar conexión al iniciar (con mejor manejo de errores)
async function testDatabaseConnection() {
  try {
    const connection = await pool.promise().getConnection();
    console.log('✅ Pool conectado exitosamente a Aiven MySQL');
    
    // Verificar que podemos hacer queries
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('✅ Query de prueba exitosa:', rows[0].solution);
    
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ Error de conexión a Aiven MySQL:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// 3. Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('🔥 Error no manejado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
    timestamp: new Date().toISOString()
  });
});

// 4. Ruta principal (CUMPLE CON LA GUÍA + MEJORAS)
app.get('/', async (req, res, next) => {
  try {
    // Verificar conexión a BD
    const connection = await pool.promise().getConnection();
    await connection.ping();
    connection.release();
    
    res.send(`
      <html>
        <head><title>Entrega 1 - Infraestructura</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Hello World - ${NOMBRE_ALUMNO}</h1>
          <p>La aplicacion funciona en Render.</p>
          <p>Puerto: ${port} | Entorno: ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Stack:</strong> GitHub Codespaces + Aiven MySQL + Render</p>
          <div style="color: green; font-weight: bold;">✔ Despliegue Exitoso</div>
          <div style="color: green;">✔ Base de datos conectada</div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error en ruta principal:', error.message);
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Hello World - ${NOMBRE_ALUMNO}</h1>
          <p>La aplicacion funciona en Render.</p>
          <p>Puerto: ${port} | Entorno: ${process.env.NODE_ENV || 'development'}</p>
          <p style="color: red;">⚠️ Error de conexion a base de datos</p>
        </body>
      </html>
    `);
  }
});

// 5. Ruta de health check para monitoreo
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.promise().getConnection();
    await connection.ping();
    connection.release();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 6. Manejo de rutas no encontradas (404)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 7. Capturar errores no manejados del proceso
process.on('uncaughtException', (err) => {
  console.error('💥 Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Promesa rechazada no manejada:', reason);
});

// 8. Iniciar servidor
async function startServer() {
  // Probar conexion a BD
  const dbConnected = await testDatabaseConnection();
  
  app.listen(port, () => {
    console.log(`🚀 Servidor listo en puerto ${port}`);
    console.log(`👤 Alumno: ${NOMBRE_ALUMNO}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Base de datos: ${dbConnected ? 'Conectada ✅' : 'No conectada ❌'}`);
  });
}

startServer();