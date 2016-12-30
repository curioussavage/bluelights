## Bluelights

Bluelights is a web app for controlling bluetooth lightbulbs. It is meant to be run on a local network only. It uses the excellent [noble](https://github.com/sandeepmistry/noble) javascript library for bluetooth. The goal is to have a nice UI on mobile and desktop, offer features like scheduling and groups, support for many different bluetooth lightbulbs out of the box. It is developed primarily with the Raspberry pi in mind.

## Quick Start

### requirements

* NodeJS > 4.0
* npm
* Bluetooth adapter

Only tested on ubuntu/raspbian.

### install

`npm install`

Before you start the server you might need to follow the instructions on the noble github page to make sure the library works and you can run the app without sudo.

### running the app

`node index.js`

## Contributing

Some help would be great. Right now this is really a prototype thrown together.
Code quality is currently a little low. I am not really set on a specific technology other than NodeJS. 

### Next steps:

Any help with the following tasks would be appreciated.

1. refactor a lot of the cruft
2. consider using React or another front end library
3. design a better UI and implement it.
4. tests
5. refactor device.js (right now my bulb is hardcoded. should support multiple bulbs)
6. investigate feasability of making an app for adding new devices ( detecting the right services/characteristics to use)

For small changes just submit a pull request. For large changes it would be better to
start an issue to discuss changes before starting.

## License

MIT