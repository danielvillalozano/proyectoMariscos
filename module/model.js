  const mysql = require('mysql2');

  // Configuración de la conexión a la base de datos con manejo de errores mejorado
  const db = mysql.createPool({
      host: 'localhost', 
      user: 'root',
      password: 'ekisdeee123.',  // Confirma que esta contraseña es correcta
      database: 'proyectoMariscos',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
  });

  // Comprobación de conexión a la base de datos con mejor manejo de errores
  db.getConnection((err, connection) => {
      if (err) {
          console.error('🚨 Error al conectar con la base de datos:', err.code, err.sqlMessage);
      } else {
          console.log('✅ Conexión a la base de datos establecida correctamente');
          connection.release();
      }
  });

  // Obtener todos los platillos con manejo de errores mejorado
  const obtenerPlatillos = (callback) => {
      db.query('SELECT * FROM platillos', (err, results) => {
          if (err) {
              console.error('❌ Error al obtener platillos:', err.message);
              return callback(err, null);
          }
          callback(null, results);
      });
  };

  // Insertar un nuevo platillo con validación de datos
  const insertarPlatillo = (nombre, descripcion, precio, imagen, callback) => {
      if (!nombre || !descripcion || !precio) {
          return callback(new Error('⚠️ Faltan datos requeridos para insertar el platillo'), null);
      }

      db.query(
          'INSERT INTO platillos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
          [nombre, descripcion, precio, imagen || 'default.jpg'],
          (err, results) => {
              if (err) {
                  console.error('❌ Error al insertar platillo:', err.message);
                  return callback(err, null);
              }
              callback(null, results);
          }
      );
  };

  module.exports = { obtenerPlatillos, insertarPlatillo };
