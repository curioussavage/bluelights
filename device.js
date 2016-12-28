function Device(device, name) {
  this._device = device;
  this._id = device.id;
  this._name = name || 'New Device';
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

Device.prototype.connect = function(cb) {
  this._device.connect(function(err) {
    cb(err);
    if (!err) {
      this._device.discoverAllServicesAndCharacteristics(function(err, services, characteristics) {
        this._lightService = this._device.services.find(function(s){return s.uuid === 'ffe5'})	
      }.bind(this));
    }
  }.bind(this));
}

Device.prototype.disconnect = function() {
  this._device.disconnect();
}

Device.prototype.readHandle = function(handle) {
  return new Promise(function(resolve, reject) {
    this._lightService.characteristics.find(function(c) {return c.uuid === handle}).read(function(err, d){
      var data = this.fromHex(d);
      resolve(data);
    }.bind(this));
  }.bind(this));
}

Device.prototype.writeHandle = function(handle, data) {
  return new Promise(function(resolve, reject) {
    data = this.makeHex(data);
    this._lightService.characteristics.find(function(c) {return c.uuid === handle}).write(data, true, function(){
      resolve(true);
    }.bind(this));
  }.bind(this));
}

Device.prototype.getState = function() {
  // should return a promise that resolves
  // to an object that has all the current color values
  //
  var id = this._id;
  var name = this._name;

  return new Promise(function(resolve, reject) {
    var promises = [];
    promises.push(this.readHandle(this.characteristicIds.white));
    promises.push(this.readHandle(this.characteristicIds.red));
    promises.push(this.readHandle(this.characteristicIds.green));
    promises.push(this.readHandle(this.characteristicIds.blue));

    return Promise.all(promises).then(function(colors) {
      console.log('promise.all in getSTate()')
      var deviceInfo = {
        white: colors[0],
        red: colors[1],
        green: colors[2],
        blue: colors[3],
        id: id, 
        name: name,
      };
      resolve(deviceInfo); 
    });
  }.bind(this));

}

module.exports = Device; 

