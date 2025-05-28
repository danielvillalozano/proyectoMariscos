const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: '3.139.221.24',
    user: 'root',
    password: 'micontraseña',  
    database: 'proyectoMariscos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión y crear tabla si no existe
pool.getConnection()
    .then(async (connection) => {
        console.log('✅ Conexión a la base de datos establecida correctamente');

        // Crear tabla `usuarios` si no existe
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            );
        `;

        try {
            await connection.query(createTableQuery);
            console.log('✅ Tabla `usuarios` verificada/creada correctamente');
        } catch (err) {
            console.error('🚨 Error al crear/verificar la tabla `usuarios`:', err.message);
        }

        connection.release();
    })
    .catch(err => {
        console.error('🚨 Error al conectar con la base de datos:', err.message);
    });

module.exports = pool;