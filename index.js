require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const routes = require('./api/routes/router');

(async () => {
  const PORT = process.env.PORT ?? 3000;
  const { ENVIRONMENT, DATABASE_URI, FRONTEND_URL } = process.env;
  if (!DATABASE_URI || !FRONTEND_URL)
    return console.error('Invalid .env configuration');
  // Setting up MongoDB
  mongoose.set('debug', (ENVIRONMENT === 'dev'));
  await mongoose.connect(DATABASE_URI);
  console.info('Database successfully connected.');
  // Setting up Express
  const app = express();
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.get('/', (req, res) => { res.send('Griffith Keep API'); });
  app.use('/api', routes);
  app.listen(PORT, () => { console.info(`Server running on port: ${PORT}`); });
})();
