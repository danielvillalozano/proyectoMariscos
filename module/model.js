

const conexion = require('./db');


const obtenerPlatillos = async () => {
  const [rows] = await conexion.query('SELECT * FROM platillos');
  return rows;
};

const insertarPlatillo = async (nombre, descripcion, precio, imagen) => {
  const sql = 'INSERT INTO platillos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)';
  const [result] = await conexion.query(sql, [nombre, descripcion, precio, imagen]);
  return result;
};

const buscarPlatilloPorNombre = async (nombre) => {
  const sql = 'SELECT * FROM platillos WHERE nombre LIKE ?';
  const [rows] = await conexion.query(sql, [`%${nombre}%`]);
  return rows;
};
const eliminarPlatillo = async (id) => {
  const sql = 'DELETE FROM platillos WHERE id = ?';
  const [result] = await conexion.query(sql, [id]);
  return result;
};
const obtenerPlatilloPorId = async (id) => {
  const sql = 'SELECT * FROM platillos WHERE id = ?';
  const [rows] = await conexion.query(sql, [id]);
  return rows[0];
};

const actualizarPlatillo = async (id, nombre, descripcion, precio, imagen) => {
  const campos = [];
  const valores = [];

  if (nombre) {
    campos.push('nombre = ?');
    valores.push(nombre);
  }
  if (descripcion) {
    campos.push('descripcion = ?');
    valores.push(descripcion);
  }
  if (precio) {
    campos.push('precio = ?');
    valores.push(precio);
  }
  if (imagen) {
    campos.push('imagen = ?');
    valores.push(imagen);
  }

  valores.push(id);

  const sql = `UPDATE platillos SET ${campos.join(', ')} WHERE id = ?`;
  const [result] = await conexion.query(sql, valores);
  return result;
};



const obtenerUsuarioPorNombre = async (username) => {
  const sql = 'SELECT * FROM usuarios WHERE username = ?';
  const [rows] = await conexion.query(sql, [username]);
  return rows[0];
};

module.exports = {
  obtenerPlatillos,
  insertarPlatillo,
  buscarPlatilloPorNombre,
  eliminarPlatillo,
  obtenerPlatilloPorId,
  actualizarPlatillo,
  obtenerUsuarioPorNombre
};
