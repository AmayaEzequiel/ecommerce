// models/index.js
const Product   = require('./Product');
const Order     = require('./Order');
const OrderItem = require('./OrderItem');

// Relaciones

// Un Producto puede estar en muchos OrderItems
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Una Orden puede tener muchos OrderItems
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  Product,
  Order,
  OrderItem
};