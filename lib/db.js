var nedb = require('nedb');
var db = new nedb({ filename: __dirname + '/data', autoload: true });
module.exports = db; 
