const express = require('express');
const router = express.Router();
const model = require('../module/model');


router.get('/login', (req, res) => {
  res.render('login', { error: null });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const usuario = await model.obtenerUsuarioPorNombre(username);

  if (!usuario || usuario.password !== password) {
    return res.render('login', { error: 'Credenciales incorrectas' });
  }

  req.session.usuario = username;
  req.session.rol = usuario.rol || 'usuario'; 

  res.redirect('/');
});


router.get('/registrarse', (req, res) => {
  res.render('registrarse', { error: null });
});


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


router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
