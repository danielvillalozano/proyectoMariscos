const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { insertarUsuario, obtenerUsuarioPorNombre } = require('../module/model');

// Página de registro
router.get('/registrarse', (req, res) => {
  res.render('registrarse', { error: null });
});

// Procesar registro
router.post('/registrarse', async (req, res) => {
  const { username, password, rol } = req.body;

  if (!username || !password || !rol) {
    return res.render('registrarse', { error: '⚠️ Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await obtenerUsuarioPorNombre(username);
    if (usuarioExistente) {
      return res.render('registrarse', { error: '⚠️ El usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario con rol
    await insertarUsuario(username, hashedPassword, rol);

    res.redirect('/login');
  } catch (err) {
    console.error('🚨 Error al registrar usuario:', err.message);
    res.render('registrarse', { error: '⚠️ Error al registrar el usuario. Intenta nuevamente.' });
  }
});

module.exports = router;
