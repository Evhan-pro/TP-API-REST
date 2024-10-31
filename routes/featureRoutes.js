const express = require('express');
const router = express.Router();
const path = require('path');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Route pour afficher la page de connexion (login)
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Route pour afficher la page du menu des fonctionnalités (features)
router.get('/', verifyToken, (req, res) => {
  res.sendFile('features.html', { root: 'public' });
});

// Route pour afficher la page d'accueil
router.get('/home', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

// Route pour afficher le menu des fonctionnalités
router.get('/menu', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/features.html'));
});

// Route pour afficher la page de génération de mot de passe
router.get('/generate-password', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/generate-password.html'));
});

// Route pour afficher la page de génération d'images aléatoires
router.get('/generate-images', verifyToken, checkRole('Administrateur'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/generate-images.html'));
});

// Route pour afficher la page de génération d'identité
router.get('/generate-identity', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/generate-identity.html'));
});

module.exports = router;
