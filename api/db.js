const fs = require('fs');
const DB_NAME = 'db.json';
const DB = JSON.parse(fs.readFileSync(DB_NAME));

module.exports = DB;
