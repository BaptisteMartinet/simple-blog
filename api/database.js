const fs = require('fs');
const DB = JSON.parse(fs.readFileSync(process.env.DATABASE_NAME));

module.exports = DB;
