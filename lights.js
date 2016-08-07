var noble = require('noble');
var server = require('./server.js');

function init(callback) {
	console.log('init running')
	console.log(noble.state)

	if (noble.state === 'poweredOn') {
		noble.startScanning();
	}

	noble.on('stateChange', function(state) {
		if (state == 'poweredOn') {
			console.log('state on ..')
			noble.startScanning()
		} else {
			console.log('stopping scan')
			console.log('state: ', state)
			noble.stopScanning()
		}
	})

	noble.on('discover', function(peripheral) {
	  if (peripheral.id == '987bf370b985') {
		device = new Device(peripheral);
		if (callback) {
			callback(device);
		}
		console.log('connected')
		noble.stopScanning();
	  }
	});

	noble.on('disconnect', function(p) {
		console.log('disconnected', p);
		noble.startScanning();
	})

	process.on('SIGTERM', function () {
		noble.stopscanning();
		device.disconnect();
	})

	function Device(device) {
		this._device = device;
		this._id = device.id;
		this._init_();
	}

	Device.prototype.characteristicIds = {
		'white': 'ffea',
		'green': 'ffe7',
		'red': 'ffe6',
		'blue': 'ffe8',
	}

	Device.prototype.lightsServiceId = 'ffe5';

	Device.prototype.makeHex = function(num) {
		if (num > 255 || num < 0) {
			console.log('num out of range')
			return new Buffer(['0x00']);
		}
		return new Buffer(['0x' + num.toString(16)]);
	}

	Device.prototype.fromHex = function(hexBuffer) {
		return parseInt(hexBuffer.hexSlice(), 16);
	}

	Device.prototype._init_ = function() {
		this._device.connect(function(err) {
			if (!err) {
				//this.discoverServices();
				this._device.discoverAllServicesAndCharacteristics(function(err, services, characteristics) {
					this._lightService = this._device.services.find(function(s){return s.uuid === 'ffe5'})	
					server(this)
				}.bind(this));
			}
		}.bind(this));
	}

	Device.prototype.connect = function() {
		this._device.connect();
	}

	Device.prototype.disconnect = function() {
		this._device.disconnect();
	}

	Device.prototype.readHandle = function(handle, cb) {
		//this._device.readHandle(handle, cb)
		cb = cb || function(){}
		this._lightService.characteristics.find(function(c) {return c.uuid === handle}).read(function(err, d){
			var data = this.fromHex(d);
			cb(data)	
		}.bind(this));
	}

	Device.prototype.writeHandle = function(handle, data, cb) {
		data = this.makeHex(data);
		cb = cb || function() {}
		this._lightService.characteristics.find(function(c) {return c.uuid === handle}).write(data, true, cb)
		//this._device.writeHandle(handle, data, true, cb)
	}

}


module.exports = init;
