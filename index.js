var makeApp = require('./lights.js');
var startServer = require('./server.js');
var db = require('./db.js');

console.log('starting')

var savedLights = db.find({}, function(err, lights) {
  if (err) { console.log(err); return; }
  var app = makeApp(lights);
  startServer(app);
});

