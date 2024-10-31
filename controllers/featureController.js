const axios = require('axios');

// Fonction pour générer un mot de passe sécurisé
exports.generatePassword = async (req, res) => {
  try {
    const response = await axios.get('https://passwordwolf.com/api/?length=12&numbers=on&symbols=on&lower=on&upper=on');
    const password = response.data[0].password;
    res.json({ password });
  } catch (error) {
    console.error('Error fetching password from API:', error);
    res.status(500).json({ message: 'Error generating password' });
  }
};

// Fonction pour générer des images aléatoires
exports.generateImages = (req, res) => {
  const count = req.query.count || 1; // Nombre d'images à générer (par défaut 1)
  const images = [];

  for (let i = 0; i < count; i++) {
    images.push(`https://picsum.photos/300/200?random=${Math.random()}`);
  }

  res.json({ images });
};

// Fonction pour générer une identité fictive
exports.generateIdentity = async (req, res) => {
  try {
    const response = await axios.get('https://randomuser.me/api/?nat=fr');
    const user = response.data.results[0];

    const identity = {
      photo: `https://thispersondoesnotexist.com/image`,
      name: `${user.name.first} ${user.name.last}`,
      gender: user.gender === 'male' ? 'Homme' : 'Femme',
      age: user.dob.age,
      email: user.email,
      phone: user.phone,
      address: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}`,
      weight: `${Math.floor(Math.random() * 40) + 50} kg`,
      height: `${Math.floor(Math.random() * 50) + 150} cm`,
      nationality: 'Français',
      passion: getRandomPassion()
    };

    res.json(identity);
  } catch (error) {
    console.error('Error generating identity:', error);
    res.status(500).json({ message: 'Error generating identity' });
  }
};

// Fonction pour obtenir une passion aléatoire
function getRandomPassion() {
  const passions = ['Lecture', 'Cuisine', 'Voyages', 'Randonnée', 'Photographie', 'Peinture', 'Musique', 'Sports', 'Jeux vidéo'];
  return passions[Math.floor(Math.random() * passions.length)];
}
