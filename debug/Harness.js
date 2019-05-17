var classFable = require('fable').Fable;
var libFable = new classFable();

libFable.log.info('Test...');

var libFoxHound = require('../source/FoxHound.js');


var testFoxHound = libFoxHound.new(libFable);
