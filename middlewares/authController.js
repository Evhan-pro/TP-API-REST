const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const secretKey = 'votre_clé_secrète';

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const queryUser = 'INSERT INTO users (username, password) VALUES (?, ?)';
  
  db.query(queryUser, [username, hashedPassword], (err, result) => {
    if (err) return res.redirect('/register?result=Username+already+taken');
    
    const userId = result.insertId;
    const queryRole = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE role_name = "Utilisateur"))';
    db.query(queryRole, [userId], (err) => {
      if (err) return res.redirect('/register?result=Error+assigning+role');
      res.redirect('/login?result=Registration+successful');
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.redirect('/login?result=Invalid+credentials');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      return res.redirect('/home');
    }
    return res.redirect('/login?result=Invalid+credentials');
  });
};
