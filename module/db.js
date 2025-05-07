const db = require('./db');

module.exports = {
  insertar: async (platillo) => {
    const { nombre, descripcion, precio, categoria, disponible } = platillo;
    const query = 'INSERT INTO platillos (nombre, descripcion, precio, categoria, disponible) VALUES (?, ?, ?, ?, ?)';
    return db.query(query, [nombre, descripcion, precio, categoria, disponible]);
  }
};
