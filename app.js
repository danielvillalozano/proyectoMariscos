const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const session = require('express-session');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const { obtenerPlatillos, insertarPlatillo } = require('./module/model');
const PORT = process.env.PORT || 4000;

// Middlewares para analizar datos del cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true })); // Para datos de formularios
app.use(express.json()); // Para datos JSON

// Configuración de sesión
app.use(session({
    secret: 'mi_secreto_seguro',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middlewares
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"]
        }
    }
}));

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Verificar rutas importantes
const verificarRuta = (ruta, mensajeError) => {
    if (!fs.existsSync(ruta)) {
        console.error(`🚨 Error: ${mensajeError}`);
        process.exit(1);
    }
};
verificarRuta(path.join(__dirname, 'views'), "La carpeta 'views' no existe.");
verificarRuta(path.join(__dirname, 'public'), "La carpeta 'public' no existe.");

// Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Rutas
app.use(authRouter);
app.use('/api', apiRouter);

app.get('/', (req, res) => {
    obtenerPlatillos((err, platillos) => {
        if (err) return res.status(500).send('Error al obtener platillos');

        // Convertir el precio a un número o asignar 0 si no es válido
        const platillosConvertidos = platillos.map(platillo => ({
            ...platillo,
            precio: parseFloat(platillo.precio) || 0 // Asegurar que el precio sea un número
        }));

        res.render('index', { platillos: platillosConvertidos, session: req.session });
    });
});

// Ruta para mostrar el formulario de registrar platillo
app.get('/registrar-platillo', (req, res) => {
    res.render('registrar-platillo', { title: "Registrar Platillo - Restaurante de Mariscos" });
});

// Ruta para procesar el registro de un platillo
app.post('/platillos', upload.single('imagen'), (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    const imagen = req.file ? req.file.filename : 'default.jpg';

    if (!nombre || !descripcion || !precio) {
        return res.status(400).json({ mensaje: '⚠️ Todos los campos son obligatorios' });
    }

    insertarPlatillo(nombre, descripcion, parseFloat(precio), imagen, (err, result) => {
        if (err) return res.status(500).send('Error al insertar platillo');
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});