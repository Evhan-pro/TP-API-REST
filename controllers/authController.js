const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const secretKey = '2u6C7966M4AWz7a5rFVX3tFxYMnkqa';
const fs = require('fs');
const commonPasswords = fs.readFileSync('10k-most-common.txt', 'utf-8').split('\n');


exports.loginHandler = async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) return res.redirect('/auth/login?result=Invalid+credentials');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/features/home');
    } else {
      res.redirect('/auth/login?result=Invalid+credentials');
    }
  });
};

const registerHandler = async (req, res) => {
  const { username, password } = req.body;

  // Vérifiez si le mot de passe est trop commun
  if (commonPasswords.includes(password)) {
    return res.redirect('/auth/register?result=Password+is+too+common!&alertClass=alert-danger');
  }

  try {
    // Hachez le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrez l'utilisateur dans la base de données
    const queryUser = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(queryUser, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.redirect('/auth/register?result=Username+already+taken&alertClass=alert-danger');
      }

      // Récupérez l'ID de l'utilisateur nouvellement créé
      const userId = result.insertId;

      // Assignez le rôle de "Utilisateur" par défaut
      const queryRole = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE role_name = "Utilisateur"))';
      db.query(queryRole, [userId], (err, result) => {
        if (err) {
          return res.redirect('/auth/register?result=Error+assigning+role&alertClass=alert-danger');
        }
        return res.redirect('/auth/login?result=Registration+successful,+please+login.&alertClass=alert-success');
      });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Error during registration' });
  }
};
