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
