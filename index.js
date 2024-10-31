const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const featureRoutes = require('./routes/featureRoutes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public')); // Servir les fichiers statiques (HTML, CSS, JS)

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/features', featureRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
