require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./router');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);
app.use(express.static('public'));

app.listen(PORT, () => { console.info(`Server running on port: ${PORT}`); });
