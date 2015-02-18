/**
* FoxHound English Dialect
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @class FoxHoundDialectMySQL
*/
var FoxHoundDialectMySQL = function()
{
	var Create = function(pParameters)
	{
	}

	var Push = function(pParameters)
	{
	}

	var Read = function(pParameters)
	{
	}

	var Fetch = function(pParameters)
	{
		var tmpWhere = JSON.stringify(pParameters.scope);
		var tmpWhatToGet = JSON.stringify(pParameters.dataElements);

		return 'Please give me '+tmpWhatToGet+' from your '+tmpWhere+'.';
	}

	var Count = function(pParameters)
	{
	}

	var Update = function(pParameters)
	{
	}

	var Delete = function(pParameters)
	{
	}

	return ({
		Fetch: Fetch
	})
}

module.exports = FoxHoundDialectMySQL();