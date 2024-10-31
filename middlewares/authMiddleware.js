const jwt = require('jsonwebtoken');
const db = require('../config/db');
const secretKey = '2u6C7966M4AWz7a5rFVX3tFxYMnkqa'; // Clé pour JWT

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: 'Token is missing!' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid!' });
    }
    req.user = decoded;
    next();
  });
}

// Middleware pour vérifier le rôle de l'utilisateur
function checkRole(requiredRole) {
  return (req, res, next) => {
    const userId = req.user.id;

    const query = `
      SELECT r.role_name FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? LIMIT 1
    `;

    db.query(query, [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const userRole = results[0].role_name;
      if (userRole === requiredRole || userRole === 'Administrateur') {
        next();
      } else {
        return res.status(403).json({ message: 'You do not have permission to access this functionality' });
      }
    });
  };
}

module.exports = { verifyToken, checkRole };
