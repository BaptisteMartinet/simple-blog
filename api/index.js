require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./router');

/*
  This file is the entry point of the project.
  It initialize express, define the middle wares that will be used,
  and start the server.
*/

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);
app.use(express.static('public', { extensions: [ 'html' ] }));

app.listen(PORT, () => { console.info(`Server running on port: ${PORT}`); });
