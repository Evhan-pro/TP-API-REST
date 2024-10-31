const axios = require('axios');

exports.generateIdentity = async (req, res) => {
  try {
    const response = await axios.get('https://randomuser.me/api/?nat=fr');
    const user = response.data.results[0];
    const identity = {
      photo: `https://thispersondoesnotexist.com/image`,
      name: `${user.name.first} ${user.name.last}`,
      age: user.dob.age,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      address: `${user.location.street.number} ${user.location.street.name}, ${user.location.city}`,
      nationality: 'Français'
    };
    res.json(identity);
  } catch (error) {
    console.error('Error generating identity:', error);
    res.status(500).json({ message: 'Error generating identity' });
  }
};
