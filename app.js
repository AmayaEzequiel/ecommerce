// app.js
require('dotenv').config();
const express      = require('express');
const path         = require('path');
const session      = require('express-session');
const cookieParser = require('cookie-parser');
const ejsLayouts   = require('express-ejs-layouts');
const sequelize    = require('./config/database');

const productRoutes  = require('./routes/products');
const cartRoutes     = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');

const app  = express();
const port = process.env.PORT || 3000;
const NOMBRE_ALUMNO = "Ezequiel Amaya";


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(ejsLayouts);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev-secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Middleware: carrito vacío en sesión si no existe
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
  }
  res.locals.cartItemCount = req.session.cart.totalQty || 0;
  next();
});

// Ruta principal (Hello World)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Entrega 1 - Infraestructura</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Hello World - ${NOMBRE_ALUMNO}</h1>
        <p>La aplicacion funciona en Render.</p>
        <p>Puerto: ${port} | Entorno: ${process.env.NODE_ENV || 'development'}</p>
        <p><strong>Stack:</strong> GitHub Codespaces + Aiven MySQL + Render</p>
        <div style="color: green; font-weight: bold;">✔ Despliegue Exitoso</div>
      </body>
    </html>
  `);
});

// Rutas
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/', productRoutes);  

// 404 (versión sin EJS)
app.use('/*path', (req, res) => {
  res.status(404).send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>404 - Página no encontrada</h2>
        <p>La ruta que buscas no existe.</p>
        <a href="/">Volver al inicio</a>
      </body>
    </html>
  `);
});

// Sincronizar BD e iniciar servidor
sequelize.sync()
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(port, () => {
      console.log(`🚀 Servidor en http://localhost:${port}`);
      console.log(`👤 Alumno: ${NOMBRE_ALUMNO}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar BD:', err.message);
    process.exit(1);
  });