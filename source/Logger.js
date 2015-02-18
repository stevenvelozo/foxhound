/**
* Logging Abstraction
*
*/
var libBunyan = require('bunyan');

var Logger = libBunyan.createLogger({name: 'FoxHound'});

module.exports = Logger;