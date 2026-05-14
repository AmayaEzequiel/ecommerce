const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Carrito de compras (en construcción)');
});

module.exports = router;