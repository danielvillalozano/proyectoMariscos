// app.js
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const db = require('./module/db');
console.log('✅ Módulo de base de datos cargado correctamente');

const model = require('./module/model');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}));

app.use(session({
  secret: 'mi_clave_secreta_segura',
  resave: false,
  saveUninitialized: false
}));

app.use(methodOverride('_method'));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const loginRoutes = require('./routes/login');
app.use('/', loginRoutes);

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

function protegerRuta(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/login');
  }
}

function soloAdmin(req, res, next) {
  if (req.session.rol === 'admin') {
    next();
  } else {
    res.status(403).send('Acceso denegado: solo administradores');
  }
}

app.get('/', async (req, res) => {
  try {
    const platillos = await model.obtenerPlatillos();
    res.render('index', { platillos, platilloPorNombre: null });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar la página principal');
  }
});

app.get('/api/buscar-nombre', protegerRuta, async (req, res) => {
  const { nombre } = req.query;
  if (!nombre) return res.status(400).send('Debes proporcionar un nombre');

  try {
    const resultado = await model.buscarPlatilloPorNombre(nombre);
    const platilloPorNombre = resultado.length > 0 ? resultado[0] : null;
    const platillos = await model.obtenerPlatillos();
    res.render('index', { platillos, platilloPorNombre });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar platillo');
  }
});

app.get('/admin', protegerRuta, soloAdmin, async (req, res) => {
  try {
    const platillos = await model.obtenerPlatillos();
    res.render('admin', { platillos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el panel de administrador');
  }
});

app.post('/api/registrar-platillo', protegerRuta, soloAdmin, upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file ? req.file.filename : 'default.jpg';

  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  try {
    await model.insertarPlatillo(nombre, descripcion, parseFloat(precio), imagen);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar platillo');
  }
});

app.delete('/api/platillos/:id', protegerRuta, soloAdmin, async (req, res) => {
  try {
    await model.eliminarPlatillo(req.params.id);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar');
  }
});

app.get('/editar-platillo/:id', protegerRuta, soloAdmin, async (req, res) => {
  try {
    const platillo = await model.obtenerPlatilloPorId(req.params.id);
    if (!platillo) return res.status(404).send('Platillo no encontrado');
    res.render('editar-platillo', { platillo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el formulario de edición');
  }
});

app.put('/api/editar-platillo/:id', protegerRuta, soloAdmin, upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file ? req.file.filename : null;

  try {
    await model.actualizarPlatillo(req.params.id, nombre, descripcion, parseFloat(precio), imagen);
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el platillo');
  }
});

app.get('/quejas-sugerencias', protegerRuta, (req, res) => {
  res.render('quejas-sugerencias', { title: "Quejas y Sugerencias" });
});

app.post('/quejas-sugerencias', protegerRuta, (req, res) => {
  const { nombre, comentario } = req.body;
  if (!comentario) return res.status(400).send('Comentario obligatorio');

  console.log(`Comentario de ${nombre || 'Anónimo'}: ${comentario}`);
  req.session.mensaje = '¡Gracias por tus comentarios!';
  res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
