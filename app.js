const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const platilloDB = require('./module/model'); // Este será tu modelo para platillos
const db = require('./module/db');
const apiRouter = require('./routes/api');
const PORT = process.env.PORT || 4000;


// Configuración básica
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ruta raíz
app.get('/', (req, res) => {
  res.send('<h1>Restaurante de Mariscos</h1><p>Accede a /api para ver la API REST o a /platillos para gestionar</p>');
});

// API externa
app.use('/api', apiRouter);

// Página principal que muestra todos los platillos
app.get('/platillos', async (req, res) => {
  try {
    const platillos = await platilloDB.mostrarTodos();
    res.render('platillos', { platillos });
  } catch (error) {
    console.error('Error al cargar platillos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Página de registro de platillo
app.get('/registrar-platillo', (req, res) => {
  res.render('registrar-platillo');
});

// Subida de imagen (si deseas agregarla)
app.post('/subir-imagen', upload.single('imagen'), async (req, res) => {
  try {
    const filename = req.file.filename;
    await platilloDB.insertarImagen(filename);
    res.status(200).json({ mensaje: 'Imagen subida correctamente' });
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).send('Error al subir imagen');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
