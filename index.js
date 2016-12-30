var makeApp = require('./lib/lights.js');
var startServer = require('./lib/server.js');
var db = require('./lib/db.js');

console.log('starting')

var savedLights = db.find({}, function(err, lights) {
    if (err) { console.log(err); return; }
    var app = makeApp(lights);
    startServer(app);
});