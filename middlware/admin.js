function soloAdmin(req, res, next) {
    if (req.session.usuario && req.session.rol === 'admin') {
      next();
    } else {
      res.status(403).send('🚫 Acceso denegado. Solo administradores.');
    }
  }
  
  module.exports = soloAdmin;
  