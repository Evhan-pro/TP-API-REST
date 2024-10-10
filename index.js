const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // Pour hacher les mots de passe

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const secretKey = '2u6C7966M4AWz7a5rFVX3tFxYMnkqa'; // Clé pour JWT
const commonPasswords = fs.readFileSync('10k-most-common.txt', 'utf-8').split('\n');

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'apirest'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

// Middleware pour vérifier le token JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token is missing!' });
  }

  jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid!' });
    }
    req.user = decoded;
    next();
  });
}

// Route pour afficher la page de connexion (login)
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Login</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          form { max-width: 400px; margin: 0 auto; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="text-center">Login</h2>
          <form action="/login" method="POST" class="mt-4">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" name="username" id="username" class="form-control" placeholder="Enter your username" required />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" name="password" id="password" class="form-control" placeholder="Enter your password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </form>
          <div class="text-center mt-4">
            <a href="/register">Don't have an account? Sign up</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Route pour afficher la page d'inscription (register)
app.get('/register', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Register</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          form { max-width: 400px; margin: 0 auto; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="text-center">Register</h2>
          <form action="/register" method="POST" class="mt-4">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" name="username" id="username" class="form-control" placeholder="Enter your username" required />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" name="password" id="password" class="form-control" placeholder="Enter your password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Register</button>
          </form>

          <!-- Bouton pour retourner à la page de login -->
          <div class="text-center mt-4">
            <a href="/login" class="btn btn-secondary">Back to Login</a>
          </div>

          <!-- Affichage du message de résultat si disponible -->
          ${req.query.result ? `<div class="alert ${req.query.alertClass} mt-4 text-center">${req.query.result}</div>` : ''}
        </div>

        <!-- Bootstrap JS and dependencies -->
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      </body>
    </html>
  `);
});

// Route pour traiter l'inscription et enregistrer les utilisateurs dans MySQL
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Vérifie si le mot de passe est trop commun
  if (commonPasswords.includes(password)) {
    return res.redirect('/register?result=Password+is+too+common!&alertClass=alert-danger');
  } else {
    // Hache le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistre l'utilisateur dans la base de données
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.redirect('/register?result=Username+already+taken&alertClass=alert-danger');
      }
      // Redirection automatique vers la page de login après inscription réussie
      return res.redirect('/login?result=Registration+successful,+please+login.&alertClass=alert-success');
    });
  }
});

// Route pour traiter la connexion et générer un token JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérifie si l'utilisateur existe dans la base de données
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.redirect('/login?result=Invalid+credentials&alertClass=alert-danger');
    }

    // Vérifie si le mot de passe est correct
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
      return res.json({ message: 'Login successful!', token });
    } else {
      return res.redirect('/login?result=Invalid+credentials&alertClass=alert-danger');
    }
  });
});

// Route protégée qui nécessite un JWT
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, you have access to this protected route!` });
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
