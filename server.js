var express = require('express');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var handlebars = require('handlebars');
var config = require('./config.json');

var Device = require('./device.js');

var expressApp = express();
expressApp.engine('handlebars', exphbs({defaultLayout: 'main'}));
expressApp.set('view engine', 'handlebars');
expressApp.use(bodyParser.json())
expressApp.use('/' + config.appPrefix + '/static', express.static(__dirname + '/static'));
var appRouter = express();
expressApp.use('/' + config.appPrefix, appRouter);

var clientSafeConfig = {};
clientSafeConfig.prefix = config.appPrefix;

function getDevice(app, id) {
 return app.devices.find(function(d) {
   return d.id === id;
 });
}

function getPeripheralInfo(p) {
  return Object.assign({}, p.advertisement, {id: p.id});
}

function initialize(app) {
	appRouter.get('/', function(req, res){

    var deviceInfoPromises = app.devices.map(function(device){
      return device.getState(); 
    });

		Promise.all(deviceInfoPromises).then(function(devices){
      var data = {
        devices: devices,
        peripherals: app.peripherals.map(getPeripheralInfo),
        config: clientSafeConfig,
        stringifiedConfig: new handlebars.SafeString(JSON.stringify(clientSafeConfig))
      };

      console.log('hello ', data)
			res.render('home', data);
		});
	});

	appRouter.get('/white', function(req, res){
    var id = req.body.id;
    var device = getDevice(app, id);
    device.readHandle(device.characteristicIds.white).then(function(data){
			res.send('white value: ' + data.toString());
		});
	});


	appRouter.post('/update', function(req, res) {
		console.log('new white', req.body)
    var id = req.body.id;
    var device = getDevice(app, id);

		if (!['white', 'red', 'green', 'blue'].indexOf(req.body.color) === -1) {
			res.send('must send red/green/blue/white')
		}

		device.writeHandle(device.characteristicIds[req.body.color], req.body.value).then(function(err){
			res.send(req.body)
		}.bind(this))
	})

	appRouter.post('/on', function (req, res) {
    var id = req.body.id;
    var device = getDevice(app, id);

	  device.writeHandle(device.characteristicIds.white, device.makeHex(255)).then(function(error) {
	    res.send('turning on')
	  });
	});

  var lastWhiteVal = null;
	appRouter.post('/toggle', function(req, res){
    var id = req.body.id;
    var device = getDevice(app, id);

	  device.readHandle(device.characteristicIds.white).then(function(data){
			if (data > 0) {
				 lastWhiteVal = data;
				 device.writeHandle(device.characteristicIds.white, 0).then(function(err){
					res.sendStatus(200);
				});
		    } else {
			  var num = lastWhiteVal !== null ? lastWhiteVal : 255;
			  device.writeHandle(device.characteristicIds.white, num).then(function(err){
					res.sendStatus(200);
			  });
			}
		})
	})

	appRouter.post('/off', function(req, res) {
    var id = req.body.id;
    var device = getDevice(app, id);

	  device.writeHandle(device.characteristicIds.white, 0).then(function(error) {
	    if (!error) {
		res.send('turned off');
		return
	    }
	    res.send('error');
	  });
	});

  appRouter.post('/connect', function(req, res) {
    var id = req.body.id;


    var peripheral = app.peripherals.find(function(p) { return p.id === id });
    // connect should be called manually instead of in the constructor of device
    var device = new Device(peripheral, '');
    console.log('connecting to ... ', device._id)
    device.connect(function(err) {
      if (!err) {
        app.devices.push(device);
        app.peripherals = app.peripherals.filter(function(p) { return p.id !== id});
        res.send('connected');
      } else {
        res.send('not connected');
      }
    });
  });

	expressApp.listen(config.port, function() {
	  console.log('server listening on ', config.port);
	});
}

module.exports = initialize;
