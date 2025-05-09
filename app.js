const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const apiRouter = require('./routes/api');
const PORT = process.env.PORT || 4000;
const { obtenerPlatillos, insertarPlatillo } = require('./module/model');

 
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const verificarRuta = (ruta, mensajeError) => {
    if (!fs.existsSync(ruta)) {
        console.error(`🚨 Error: ${mensajeError}`);
        process.exit(1);
    }
};

verificarRuta(path.join(__dirname, 'views'), "La carpeta 'views' no existe en la ruta correcta.");
verificarRuta(path.join(__dirname, 'views', 'index.ejs'), "El archivo 'index.ejs' no existe en 'views'. Verifica la ruta.");

verificarRuta(path.join(__dirname, 'public'), "La carpeta 'public' no existe en la ruta correcta.");
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"]
        }
    }
}));


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
const manejarError = (res, mensaje, err) => {
    console.error(`❌ ${mensaje}:`, JSON.stringify(err, null, 2));
    res.status(500).send(`<h3>${mensaje}</h3><pre>${JSON.stringify(err, null, 2)}</pre>`);
};

app.get('/', (req, res) => {
    obtenerPlatillos((err, platillos) => {
        if (err) return manejarError(res, "Error en la consulta a la base de datos", err);
        res.render('index', { platillos: Array.isArray(platillos) ? platillos : [] });
    });
});

app.use('/api', apiRouter);

app.get('/platillos', (req, res) => {
    obtenerPlatillos((err, platillos) => {
        if (err) return manejarError(res, "Error al obtener platillos", err);
        res.render('platillos', { platillos: Array.isArray(platillos) ? platillos : [] });
    });
});

app.get('/registrar-platillo', (req, res) => {
    res.render('registrar-platillo', { title: "Registrar Platillo - Restaurante de Mariscos" });
});

app.post('/platillos', (req, res) => {
    const { nombre, descripcion, precio, imagen } = req.body;

    if (!nombre || !descripcion || !precio) {
        return res.status(400).json({ mensaje: '⚠️ Todos los campos son obligatorios' });
    }

    insertarPlatillo(nombre, descripcion, precio, imagen, (err, result) => {
        if (err) return manejarError(res, "Error al insertar platillo", err);
        res.json({ mensaje: '✅ Platillo agregado', id: result.insertId });
    });
});

app.post('/subir-imagen', upload.single('imagen'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('⚠️ No se subió ninguna imagen');
    }
    res.status(200).json({ mensaje: '✅ Imagen subida correctamente', filename: req.file.filename });
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
