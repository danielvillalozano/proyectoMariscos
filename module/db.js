// module/db.js
const mysql = require('mysql2/promise');

// Pool de conexión a MySQL
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'admin',
  password: '1234',
  database: 'proyectoMariscos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verifica conexión (solo 1 vez)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos realizada correctamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
})();

// Exporta el pool para usar en otros módulos
module.exports = pool;
