var noble = require('noble');
var server = require('./server.js');
var Device = require('./device.js');

var scanTime = 60 * 1000;
function scan() {
  if (noble.state === 'poweredOn' && !app.isScanning) {
    app.peripherals = [];
    noble.startScanning();
    setTimeout(function() { noble.stopScanning(); }, scanTime);
  }
}

var app = {
    noble: noble,
    devices: [],
    peripherals: [],
    scan: scan,
    isScanning: false
};

noble.on('stateChange', function(state) {
  console.log('state is now: ', state);
  if (state == 'poweredOn') {
  } else {
    console.log('stopping scan');
    noble.stopScanning();
  }
});

noble.on('disconnect', function(p) {
  console.log('disconnected ', p);
});

noble.on('scanStart', function() {
  app.isScanning = true;
  console.log('app scanning...');
});

noble.on('scanStop', function() {
  app.isScanning = false;
  console.log('app stopping scan.');
});

process.on('SIGTERM', function () {
  console.log('shutting down');
  noble.stopScanning();
});

function getDevice(savedDevices, id) {
  return savedDevices.find(function(d) { return d.id === id });
}

function init(savedDevices) {
	console.log('init running');
	console.log('noble state: ', noble.state);

	if (noble.state === 'poweredOn') {
    scan();
	}

  // my lights id is '987bf370b985'
  // I don't need this anymore but just for reference.
	noble.on('discover', function(peripheral) {
    var savedDevice = getDevice(savedDevices, peripheral.id); 
    console.log('detected: ', peripheral.advertisement.localName)
	  if (savedDevice) {
      var name = savedDevice.name || peripheral.advertisement.localName || '';
      var device = new Device(peripheral, name);
      device.connect(function(err) {
        if (!err) {
          app.devices.push(device);
        } else {
          app.peripherals.push(peripheral);
        }
      });
	  } else {
      app.peripherals.push(peripheral);
    }
	});
  
  return app;
}

module.exports = init;
