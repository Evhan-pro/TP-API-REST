const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // Pour hacher les mots de passe
const cookieParser = require('cookie-parser'); // Pour gérer les cookies
const { verifyToken, checkRole } = require('./middlewares/authMiddleware');
const db = require('./config/db');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // Utiliser cookie-parser pour gérer les cookies

const secretKey = '2u6C7966M4AWz7a5rFVX3tFxYMnkqa'; // Clé pour JWT
const commonPasswords = fs.readFileSync('10k-most-common.txt', 'utf-8').split('\n');

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

// Route pour afficher la page d'accueil des fonctionnalités après la connexion
app.get('/home', verifyToken, (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Home</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 600px; margin: 0 auto; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome, ${req.user.username}!</h2>
          <p>You have successfully logged in. You can now access the functionality menu.</p>
          
          <!-- Bouton pour accéder à la page du menu des fonctionnalités -->
          <a href="/features" class="btn btn-primary mt-3">Go to Features Menu</a>
        </div>
      </body>
    </html>
  `);
});

// Route pour afficher le menu des fonctionnalités avec un menu burger
app.get('/features', verifyToken, (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Menu des fonctionnalités</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 600px; margin: 0 auto; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Barre de navigation avec menu burger -->
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">Menu fonctionnalités</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <a class="nav-link" href="/generate-password">Générateur mot de passe</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/generate-images">Générateur d'image random</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/generate-identity">Générateur identité</a>
                </li>
              </ul>
            </div>
          </nav>

          <!-- Bouton pour revenir à la page d'accueil -->
          <a href="/home" class="btn btn-primary mt-3">Back to Home</a>
        </div>

        <!-- Bootstrap JS and dependencies -->
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      </body>
    </html>
  `);
});

app.get('/generate-password', verifyToken, (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Password Generator</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 600px; margin: 0 auto; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Secure Password Generator</h2>
          <p>Click the button below to generate a secure password:</p>
          
          <!-- Bouton pour générer un mot de passe -->
          <button id="generatePassword" class="btn btn-primary">Generate Password</button>
          
          <!-- Affichage du mot de passe généré -->
          <div id="passwordDisplay" class="mt-4"></div>

          <!-- Bouton pour revenir au menu des fonctionnalités -->
          <a href="/features" class="btn btn-secondary mt-4">Back to Features Menu</a>
        </div>

        <!-- JS pour gérer la génération du mot de passe -->
        <script>
          document.getElementById('generatePassword').addEventListener('click', function() {
            fetch('/api/generate-password')
              .then(response => response.json())
              .then(data => {
                document.getElementById('passwordDisplay').innerHTML = '<h4>' + data.password + '</h4>';
              })
              .catch(error => {
                console.error('Error fetching password:', error);
              });
          });
        </script>

        <!-- Bootstrap JS and dependencies -->
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      </body>
    </html>
  `);
});

// Route pour afficher la page du générateur d'images aléatoires
app.get('/generate-images', verifyToken, checkRole('Administrateur'), (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Random Image Generator</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 800px; margin: 0 auto; padding-top: 20px; text-align: center; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
          img { width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Random Image Generator</h2>
          <p>Select how many images you want to generate:</p>
          
          <!-- Formulaire pour sélectionner le nombre d'images -->
          <form id="imageForm">
            <div class="form-group">
              <label for="imageCount">Number of images:</label>
              <input type="number" id="imageCount" class="form-control" placeholder="Enter number of images" min="1" value="1" required>
            </div>
            <button type="submit" class="btn btn-primary">Generate Images</button>
          </form>
          
          <!-- Affichage des images générées -->
          <div id="imageGrid" class="grid mt-4"></div>

          <!-- Bouton pour revenir au menu des fonctionnalités -->
          <a href="/features" class="btn btn-secondary mt-4">Back to Features Menu</a>
        </div>

        <!-- JS pour gérer la génération des images -->
        <script>
          document.getElementById('imageForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Empêcher le rechargement de la page

            const count = document.getElementById('imageCount').value;

            // Requête pour générer des images
            fetch('/api/generate-images?count=' + count)
              .then(response => response.json())
              .then(data => {
                const imageGrid = document.getElementById('imageGrid');
                imageGrid.innerHTML = ''; // Réinitialiser la grille d'images
                data.images.forEach(imageUrl => {
                  const imgElement = document.createElement('img');
                  imgElement.src = imageUrl;
                  imageGrid.appendChild(imgElement);
                });
              })
              .catch(error => {
                console.error('Error fetching images:', error);
              });
          });
        </script>

        <!-- Bootstrap JS and dependencies -->
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      </body>
    </html>
  `);
});

// Route pour afficher la page du générateur d'identité fictive
app.get('/generate-identity', verifyToken, (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Générateur d'identité</title>
        <!-- Bootstrap CDN -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 800px; margin: 0 auto; padding-top: 20px; }
          .card { margin-top: 20px; }
          .card img { border-radius: 50%; width: 150px; height: 150px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="text-center">Générateur d'identité aléatoire</h2>
          <p class="text-center">Cliquez sur le bouton pour générer une identité :</p>
          
          <!-- Bouton pour générer une identité -->
          <div class="text-center">
            <button id="generateIdentity" class="btn btn-primary">Générer une identité</button>
          </div>

          <!-- Affichage des informations de l'identité sous forme de carte -->
          <div id="identityCard" class="card mt-4" style="display: none;">
            <div class="row no-gutters">
              <div class="col-md-4 text-center">
                <img id="identityPhoto" src="" alt="User Photo" class="img-fluid rounded-circle mt-3">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title" id="identityName"></h5>
                  <p class="card-text"><strong>Âge :</strong> <span id="identityAge"></span></p>
                  <p class="card-text"><strong>Sexe :</strong> <span id="identityGender"></span></p>
                  <p class="card-text"><strong>Email :</strong> <span id="identityEmail"></span></p>
                  <p class="card-text"><strong>Téléphone :</strong> <span id="identityPhone"></span></p>
                  <p class="card-text"><strong>Adresse :</strong> <span id="identityAddress"></span></p>
                  <p class="card-text"><strong>Poids :</strong> <span id="identityWeight"></span></p>
                  <p class="card-text"><strong>Taille :</strong> <span id="identityHeight"></span></p>
                  <p class="card-text"><strong>Nationalité :</strong> <span id="identityNationality"></span></p>
                  <p class="card-text"><strong>Passion :</strong> <span id="identityPassion"></span></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton pour revenir au menu des fonctionnalités -->
          <div class="text-center">
            <a href="/features" class="btn btn-secondary mt-4">Retour au menu des fonctionnalités</a>
          </div>
        </div>

        <!-- JS pour gérer la génération de l'identité -->
        <script>
          document.getElementById('generateIdentity').addEventListener('click', function() {
            fetch('/api/generate-identity')
              .then(response => response.json())
              .then(data => {
                // Mettre à jour la carte d'identité avec les informations reçues
                document.getElementById('identityPhoto').src = data.photo;
                document.getElementById('identityName').textContent = data.name;
                document.getElementById('identityAge').textContent = data.age;
                document.getElementById('identityGender').textContent = data.gender;
                document.getElementById('identityEmail').textContent = data.email;
                document.getElementById('identityPhone').textContent = data.phone;
                document.getElementById('identityAddress').textContent = data.address;
                document.getElementById('identityWeight').textContent = data.weight;
                document.getElementById('identityHeight').textContent = data.height;
                document.getElementById('identityNationality').textContent = data.nationality;
                document.getElementById('identityPassion').textContent = data.passion;

                // Afficher la carte d'identité
                document.getElementById('identityCard').style.display = 'block';
              })
              .catch(error => {
                console.error('Erreur lors de la génération de l\'identité:', error);
              });
          });
        </script>

        <!-- Bootstrap JS and dependencies -->
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
      </body>
    </html>
  `);
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

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Vérifier si le mot de passe est trop commun
  if (commonPasswords.includes(password)) {
    return res.redirect('/register?result=Password+is+too+common!&alertClass=alert-danger');
  } else {
    // Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrer l'utilisateur dans la base de données
    const queryUser = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(queryUser, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.redirect('/register?result=Username+already+taken&alertClass=alert-danger');
      }

      // Récupérer l'ID de l'utilisateur nouvellement créé
      const userId = result.insertId;

      // Assigner le rôle de Visiteur par défaut
      const queryRole = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE role_name = "Utilisateur"))';
      db.query(queryRole, [userId], (err, result) => {
        if (err) {
          return res.redirect('/register?result=Error+assigning+role&alertClass=alert-danger');
        }
        return res.redirect('/login?result=Registration+successful,+please+login.&alertClass=alert-success');
      });
    });
  }
});


const axios = require('axios'); // Pour faire des requêtes HTTP

// Route API pour générer un mot de passe sécurisé
app.get('/api/generate-password', async (req, res) => {
  try {
    // Utilisation d'une API publique pour générer un mot de passe (par exemple: passwordwolf.com)
    const response = await axios.get('https://passwordwolf.com/api/?length=12&numbers=on&symbols=on&lower=on&upper=on');
    
    // Renvoyer le mot de passe généré par l'API
    const password = response.data[0].password;
    res.json({ password });
  } catch (error) {
    console.error('Error fetching password from API:', error);
    res.status(500).json({ message: 'Error generating password' });
  }
});

app.get('/admin/users', verifyToken, checkRole('Administrateur'), (req, res) => {
  // Requête pour obtenir la liste des utilisateurs et leurs rôles
  const query = `
    SELECT u.id, u.username, r.role_name FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
  `;

  db.query(query, (err, results) => {
    if (err) throw err;

    // Afficher la liste des utilisateurs et des rôles dans une page
    res.send(`
      <html>
        <body>
          <h1>Gérer les utilisateurs</h1>
          <table>
            <thead>
              <tr>
                <th>Nom d'utilisateur</th>
                <th>Rôle</th>
                <th>Changer de rôle</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(user => `
                <tr>
                  <td>${user.username}</td>
                  <td>${user.role_name}</td>
                  <td>
                    <form action="/admin/change-role" method="POST">
                      <input type="hidden" name="user_id" value="${user.id}" />
                      <select name="role">
                        <option value="Visiteur">Visiteur</option>
                        <option value="Utilisateur">Utilisateur</option>
                        <option value="Administrateur">Administrateur</option>
                      </select>
                      <button type="submit">Mettre à jour</button>
                    </form>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
  });
});

// Route pour changer le rôle d'un utilisateur
app.post('/admin/change-role', verifyToken, checkRole('Administrateur'), (req, res) => {
  const { user_id, role } = req.body;

  // Mettre à jour le rôle de l'utilisateur
  const query = `
    UPDATE user_roles
    SET role_id = (SELECT id FROM roles WHERE role_name = ?)
    WHERE user_id = ?
  `;

  db.query(query, [role, user_id], (err, result) => {
    if (err) throw err;
    res.redirect('/admin/users');
  });
});
  
// Route pour traiter la connexion et générer un token JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérifier si l'utilisateur existe dans la base de données
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.redirect('/login?result=Invalid+credentials&alertClass=alert-danger');
    }

    // Vérifier si le mot de passe est correct
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });

      // Ajouter le token au cookie HTTP Only
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // maxAge = 1 heure

      // Redirection vers la page d'accueil après connexion
      return res.redirect('/home');
    } else {
      return res.redirect('/login?result=Invalid+credentials&alertClass=alert-danger');
    }
  });
});
