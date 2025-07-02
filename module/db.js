// module/db.js

const mysql = require('mysql2/promise');

// ⚡ Usa .promise() desde el inicio
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'ekisdeee123.',
  database: 'proyectoMariscos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos realizada correctamente');
    connection.release();
  } catch (error) {
    console.error('🚨 Error al conectar a la base de datos:', error.message);
  }
})();

module.exports = pool;
