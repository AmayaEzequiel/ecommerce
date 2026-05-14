const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>');
});

app.get('/cart', (req, res) => {
  res.send('<h1>Carrito funciona</h1>');
});

app.listen(port, () => {
  console.log(`Servidor de prueba en http://localhost:${port}`);
});