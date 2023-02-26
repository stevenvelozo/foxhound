/**
* Simple browser shim loader - assign the npm module to a window global automatically
*
* @license MIT
* @author <steven@velozo.com>
*/
var libNPMModuleWrapper = require('./Foxhound.js');

if ((typeof(window) === 'object') && !window.hasOwnProperty('Foxhound'))
{
	window.Foxhound = libNPMModuleWrapper;
}

module.exports = libNPMModuleWrapper;