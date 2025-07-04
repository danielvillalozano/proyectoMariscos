// module/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'admin',
  password: '1234',
  database: 'proyectoMariscos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos realizada correctamente');
    connection.release();
  } catch (error) {
    console.error('🚨 Error de conexión:', error.message);
  }
})();

module.exports = pool;
