require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const routes = require('./api/routes/router');

/*
  This file is the entry point of the project.
  It initialize express, connect to the db,
  define the middlewares that will be used,
  and start the server.
*/

(async () => {
  const { DATABASE_NAME, PORT, ENVIRONMENT } = process.env;
  if (!DATABASE_NAME || !PORT)
    throw new Error('Missing DATABASE_NAME AND PORT environment variables.');
  mongoose.set('debug', (ENVIRONMENT !== 'prod'));
  await mongoose.connect(DATABASE_NAME);
  console.info('Database successfully connected.');
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', routes);
  app.use(express.static('public', { extensions: ['html'] }));
  app.listen(PORT, () => { console.info(`Server running on port: ${PORT}`); });
})();
