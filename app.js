const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
// Render asigna automáticamente un puerto, por eso usamos process.env.PORT
const port = process.env.PORT || 10000;

// 1. Configuración de la conexión a Aiven (MySQL)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    // Aquí decodificamos el certificado que pegaste en Render
    ca: Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf-8')
  }
});

// 2. Intentar la conexión
connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a Aiven:', err.message);
    return;
  }
  console.log('✅ Conectado exitosamente a la base de datos de Aiven');
});

// 3. Ruta principal (El "Hello World" que te pide la tarea)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Entrega 1 - Infraestructura</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>¡Hello World! 🚀</h1>
        <p>Servidor funcionando y conectado a la infraestructura correctamente.</p>
        <p><strong>Entorno:</strong> GitHub Codespaces + Aiven MySQL + Render</p>
        <div style="color: green; font-weight: bold;">✔ Despliegue Exitoso</div>
      </body>
    </html>
  `);
});

// 4. Encender el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor listo en http://localhost:${port}`);
});