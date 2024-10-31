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