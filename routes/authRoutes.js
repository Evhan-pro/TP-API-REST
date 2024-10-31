const express = require('express');
const router = express.Router();
const path = require('path');
const { registerHandler, loginHandler } = require('../controllers/authController');

// Route pour afficher la page de connexion
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Route pour afficher la page d'inscription
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Route pour gérer la connexion
router.post('/login', loginHandler);

// Route pour gérer l'inscription
router.post('/register', registerHandler);

module.exports = router;
