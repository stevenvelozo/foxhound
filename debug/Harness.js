var classFable = require('fable').Fable;
var libFable = new classFable();

libFable.log.info('Foxhound test harness executing...');

var baseFoxHound = require('../source/FoxHound.js');


let libFoxHound = baseFoxHound.new(libFable);

let tmpQuery = libFoxHound.new(libFable).setLogLevel(5).setDialect('English').setScope('Animal');

tmpQuery.buildCreateQuery();
libFable.log.info(`Query built with the body [${tmpQuery.query.body}].`)
