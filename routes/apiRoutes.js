const express = require('express');
const router = express.Router();
const { generatePassword, generateImages, generateIdentity } = require('../controllers/apiController');

// Route pour générer un mot de passe sécurisé
router.get('/generate-password', generatePassword);

// Route pour générer des images aléatoires
router.get('/generate-images', generateImages);

// Route pour générer une identité fictive
router.get('/generate-identity', generateIdentity);

module.exports = router;
