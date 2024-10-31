const axios = require('axios');

exports.generatePassword = async (req, res) => {
  try {
    const response = await axios.get('https://passwordwolf.com/api/?length=12&numbers=on&symbols=on&lower=on&upper=on');
    res.json({ password: response.data[0].password });
  } catch (error) {
    res.status(500).json({ message: 'Error generating password' });
  }
};

exports.generateImages = (req, res) => {
  const count = parseInt(req.query.count) || 1;
  const images = Array.from({ length: count }, () => `https://picsum.photos/300/200?random=${Math.random()}`);
  res.json({ images });
};

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
      address: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}`,
      weight: `${Math.floor(Math.random() * 40) + 50} kg`,
      height: `${Math.floor(Math.random() * 50) + 150} cm`,
      nationality: 'Français',
      passion: 'Lecture'
    };
    res.json(identity);
  } catch (error) {
    res.status(500).json({ message: 'Error generating identity' });
  }
};

// Vérification de l'existence d'une adresse email
exports.checkEmail = async (req, res) => {
  const { email } = req.query;
  
  try {
    const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=7a7d02ffb6adb1e8b58b22223b068b8b82ccb44e`);
    
    if (response.data.data.status === 'valid') {
      res.json({ exists: true, message: 'Email is valid and exists.' });
    } else {
      res.json({ exists: false, message: 'Email is not valid or does not exist.' });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ exists: false, message: 'An error occurred while checking the email.' });
  }
};
