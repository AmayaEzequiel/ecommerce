const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Configuración de la conexión a Aiven
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    ca: Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('ascii')
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a Aiven:', err);
    return;
  }
  console.log('Conectado exitosamente a la base de datos de Aiven');
});

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando y conectado a la infraestructura!');
});

app.listen(port, () => {
  console.log(`App escuchando en el puerto ${port}`);
});