const express = require('express');
const router = express.Router();
const db = require('../module/db');

// Página de registro
router.get('/registrarse', (req, res) => {
    res.render('registrarse', { error: null });
});

// Procesar registro
router.post('/registrarse', async (req, res) => {
    const { username, password } = req.body || {}; // Validar que req.body no sea undefined

    if (!username || !password) {
        return res.render('registrarse', { error: '⚠️ Todos los campos son obligatorios' });
    }

    try {
        await db.query('INSERT INTO usuarios (username, password) VALUES (?, ?)', [username, password]);
        res.redirect('/login');
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.render('registrarse', { error: '⚠️ Error al registrar el usuario. Intenta nuevamente.' });
    }
});

// Página de login
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Procesar login
router.post('/login', async (req, res) => {
    const { username, password } = req.body || {}; // Validar que req.body no sea undefined

    if (!username || !password) {
        return res.render('login', { error: '⚠️ Todos los campos son obligatorios' });
    }

    try {
        const [user] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (user.length === 0 || user[0].password !== password) {
            return res.render('login', { error: '⚠️ Usuario o contraseña incorrectos' });
        }

        req.session.user = { id: user[0].id, username: user[0].username };
        res.redirect('/');
    } catch (err) {
        console.error('Error al procesar login:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login');
    });
});

module.exports = router;