const express = require('express');
const router = express.Router();
const db = require('../module/db');
const platilloDB = require('../module/model'); // similar a tu model.js pero para platillos

// Buscar platillo por ID
router.get('/api/buscar-platillo-id', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  try {
    const [result] = await db.query('SELECT * FROM platillos WHERE id = ?', [id]);
    if (result.length === 0) return res.status(404).json({ error: 'Platillo no encontrado' });
    res.json(result[0]);
  } catch (err) {
    console.error('Error al buscar platillo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Buscar platillos por campo
router.get('/api/buscar-platillo', async (req, res) => {
  const { campo, valor } = req.query;
  if (!campo || !valor) {
    return res.status(400).send('Faltan parámetros: campo y valor');
  }

  try {
    const [resultados] = await db.query(
      `SELECT * FROM platillos WHERE ${campo} LIKE ?`,
      [`%${valor}%`]
    );
    res.render('platillos', { platillosFiltrados: resultados });
  } catch (error) {
    console.error('Error al buscar platillos:', error);
    res.status(500).send('Error al buscar platillos');
  }
});

// Registrar nuevo platillo
router.post('/api/registrar-platillo', async (req, res) => {
  const { nombre, descripcion, precio, categoria, disponible } = req.body;
  const nuevoPlatillo = {
    nombre,
    descripcion,
    precio,
    categoria,
    disponible: disponible === 'on' ? 1 : 0
  };

  try {
    await platilloDB.insertar(nuevoPlatillo);
    res.redirect('/platillos'); // suponiendo que tienes una vista que muestra todos
  } catch (err) {
    console.error('Error al registrar platillo:', err);
    res.status(500).send('Error al guardar el platillo');
  }
});

// Ruta de prueba para asegurar que funciona
router.get('/', (req, res) => {
    res.json({ mensaje: 'API del restaurante funcionando correctamente' });
  });
  

module.exports = router;
