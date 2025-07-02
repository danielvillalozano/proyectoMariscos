const express = require('express');
const router = express.Router();
const model = require('../module/model');

// Vista login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Procesar login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const usuario = await model.obtenerUsuarioPorNombre(username);

  if (!usuario || usuario.password !== password) {
    return res.render('login', { error: 'Credenciales incorrectas' }); // <-- era "mensaje"
  }

  req.session.usuario = username;
  req.session.rol = usuario.rol || 'usuario'; // Asegura que haya rol

  res.redirect('/');
});

// Vista de registro
router.get('/registrarse', (req, res) => {
  res.render('registrarse', { error: null });
});

// Procesar registro
router.post('/registrarse', async (req, res) => {
  const { username, password, rol } = req.body;

  if (!username || !password || !rol) {
    return res.render('registrarse', { error: 'Todos los campos son obligatorios' });
  }

  try {
    const existente = await model.obtenerUsuarioPorNombre(username);
    if (existente) {
      return res.render('registrarse', { error: 'El usuario ya existe' });
    }

    await model.insertarUsuario(username, password, rol);
    res.redirect('/login');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.render('registrarse', { error: 'Error al registrar usuario' });
  }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
