getDialects = () =>
{
	let tmpDialects = {};

	tmpDialects.English = require('./dialects/English/FoxHound-Dialect-English.js');
	tmpDialects.SQLite = require('./dialects/SQLite/FoxHound-Dialect-SQLite.js');
	tmpDialects.ALASQL = require('./dialects/ALASQL/FoxHound-Dialect-ALASQL.js');
	tmpDialects.MeadowEndpoints = require('./dialects/MeadowEndpoints/FoxHound-Dialect-MeadowEndpoints.js');
	tmpDialects.MySQL = require('./dialects/MySQL/FoxHound-Dialect-MySQL.js');
	tmpDialects.MSSQL = require('./dialects/MicrosoftSQL/FoxHound-Dialect-MSSQL.js');

	tmpDialects.default = tmpDialects.English;

	return tmpDialects;
}

module.exports = getDialects();