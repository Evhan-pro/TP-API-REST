const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const secretKey = '2u6C7966M4AWz7a5rFVX3tFxYMnkqa';

exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (commonPasswords.includes(password)) {
    return res.redirect('/register?result=Password+is+too+common!&alertClass=alert-danger');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const queryUser = 'INSERT INTO users (username, password) VALUES (?, ?)';

  db.query(queryUser, [username, hashedPassword], (err, result) => {
    if (err) {
      return res.redirect('/register?result=Username+already+taken&alertClass=alert-danger');
    }
    const userId = result.insertId;
    const queryRole = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE role_name = "Utilisateur"))';
    db.query(queryRole, [userId], (err) => {
      if (err) {
        return res.redirect('/register?result=Error+assigning+role&alertClass=alert-danger');
      }
      return res.redirect('/login?result=Registration successful, please login.&alertClass=alert-success');
    });
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.redirect('/login?result=Invalid credentials&alertClass=alert-danger');
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      return res.redirect('/home');
    } else {
      return res.redirect('/login?result=Invalid credentials&alertClass=alert-danger');
    }
  });
};
