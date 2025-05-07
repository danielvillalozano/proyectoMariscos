// module/model.js
const db = require('./db');

const alumnoDB = {
  insertarImagen: async (filename) => {
    const query = 'INSERT INTO images (filename) VALUES (?)';
    await db.query(query, [filename]);
  },

  obtenerImagenes: async () => {
    const [rows] = await db.query('SELECT * FROM images ORDER BY id DESC');
    return rows;
  },

  insertarAlumno: async (nombre, matricula, carrera) => {
    const query = 'INSERT INTO alumnos (nombre, matricula, carrera) VALUES (?, ?, ?)';
    await db.query(query, [nombre, matricula, carrera]);
  },

  obtenerAlumnos: async () => {
    const [rows] = await db.query('SELECT * FROM alumnos ORDER BY id DESC');
    return rows;
  }
};

module.exports = alumnoDB;
