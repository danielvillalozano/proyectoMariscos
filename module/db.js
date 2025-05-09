const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ekisdeee123.',  
    database: 'proyectoMariscos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión a la base de datos establecida correctamente');
        connection.release();
    })
    .catch(err => {
        console.error('🚨 Error al conectar con la base de datos:', err.message);
    });

module.exports = pool;
