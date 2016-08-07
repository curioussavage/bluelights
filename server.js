var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json())

function initialize(device) {
	app.post('/on', function (req, res) {
	  device.writeHandle(device.characteristicIds.white, device.makeHex(255), function(error) {
	    res.send('turning on')
	  });
	});

	app.post('/toggle', function(req, res){
		device.readHandle(device.characteristicIds.white, function(data){
			if (data > 0) {
			  device.writeHandle(device.characteristicIds.white, 0, function(err){
					res.send('turned off');
				});
			} else {
			  device.writeHandle(device.characteristicIds.white, 255, function(err){
					res.send('turned on');
				});
			}
		})
	})

	app.post('/off', function(req, res) {
	  device.writeHandle(device.characteristicIds.white, device.makeHex(0), function(error) {
	    if (!error) {
		res.send('turned off')	
		return
	    }
	    res.send('error')
	  });
	});

	app.post('/brightness', function(req, res) {
	  res.send('setting brightness')
	})

	app.listen(3000, function() {
	  console.log('server listening on 3000')
	})
}

module.exports = initialize;
