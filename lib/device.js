function Device(device, name) {
    this._device = device;
    this.id = device.id;
    this._name = name;
    if (!this._name) {
        this._name = device.advertisement ?
            device.advertisement.localName : 'New Device';
    }

    this.lastWhiteVal = null;

    device.once('connect', function() {
        console.log('connected to ', this._name, ' ', this.id);
    }.bind(this));

    device.once('disconnect', function() {
        console.log('disconnected from ', this._name, ' ', this.id);
        this.connect();
    }.bind(this));
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
    cb = cb || function() {}
    this._device.connect(function(err) {
        cb(err);
        if (!err) {
            this._device.discoverAllServicesAndCharacteristics(function(err, services, characteristics) {
                this._lightService = this._device.services.find(function(s) { return s.uuid === 'ffe5' })
            }.bind(this));
        }
    }.bind(this));
}

Device.prototype.disconnect = function() {
    this._device.disconnect();
}

Device.prototype.readHandle = function(handle) {
    return new Promise(function(resolve, reject) {
        this._lightService.characteristics.find(function(c) { return c.uuid === handle }).read(function(err, d) {
            var data = this.fromHex(d);
            resolve(data);
        }.bind(this));
    }.bind(this));
}

Device.prototype.writeHandle = function(handle, data) {
    return new Promise(function(resolve, reject) {
        data = this.makeHex(data);
        this._lightService.characteristics.find(function(c) { return c.uuid === handle }).write(data, true, function() {
            resolve(true);
        }.bind(this));
    }.bind(this));
}

Device.prototype.toggle = function() {
    return new Promise(function(resolve, reject) {
        this.readHandle(this.characteristicIds.white).then(function(data) {
            var val = data > 0 ? 0 : this.lastWhiteVal || 255;
            this.lastWhiteVal = data > 0 ? data : this.lastWhiteVal;
            this.writeHandle(this.characteristicIds.white, 0).then(function(successful) {
                resolve(successful);
            });
        });
    });
}

Device.prototype.turnOff = function() {
    return new Promise(function(resolve, reject) {
        this.writeHandle(this.characteristicIds.white, 0).then(function(error) {
            if (!error) {
                resolve(true);
            }
            resolve(false);
        });
    });
}

Device.prototype.turnOn = function() {
    return new Promise(function(resolve, reject) {
        this.writeHandle(this.characteristicIds.white, this.makeHex(255)).then(function(error) {
            resolve(true);
        });
    })
}

Device.protoype.updateColor = function(color, value) {
    return new Promise(function(resolve, reject) {
        this.writeHandle(this.characteristicIds[color], value).then(function(err) {
            if (!err) {
                resolve(true);
            }
        });
    });
}

Device.prototype.getState = function() {
    // should return a promise that resolves
    // to an object that has all the current color values
    //
    var id = this.id;
    var name = this._name;

    console.log('fetching state of ', id);
    return new Promise(function(resolve, reject) {
        var promises = [];
        promises.push(this.readHandle(this.characteristicIds.white));
        promises.push(this.readHandle(this.characteristicIds.red));
        promises.push(this.readHandle(this.characteristicIds.green));
        promises.push(this.readHandle(this.characteristicIds.blue));

        return Promise.all(promises).then(function(colors) {
            console.log('state for ', id, ' retrieved');
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