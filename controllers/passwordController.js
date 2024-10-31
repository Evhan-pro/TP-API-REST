const axios = require('axios');

exports.generatePassword = async (req, res) => {
  try {
    const response = await axios.get('https://passwordwolf.com/api/?length=12&numbers=on&symbols=on&lower=on&upper=on');
    const password = response.data[0].password;
    res.json({ password });
  } catch (error) {
    console.error('Error fetching password:', error);
    res.status(500).json({ message: 'Error generating password' });
  }
};
