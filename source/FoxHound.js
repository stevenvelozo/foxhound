var libUnderscore = require('underscore');

/**
* The FoxHound Query Generation Library
*
* @class FoxHound
*/
var FoxHound = function(pDefaultParameters)
{
	var _DefaultParameters = (typeof(pDefaultParameters) === 'undefined') ? {} : pDefaultParameters;
	var _Parameters = _DefaultParameters;

	var _Dialect = false;
}

/**
* Create a Clean Query Parameter Object
*
* @method createNewParameters
* @param {Object} pFromParameters A Query Parameter Object
* @return {Object} Returns a new Query Parameter Object
*/
FoxHound.prototype.createNewParameters = function ()
{
	return _.extend({
		scope: false,        // The scope of the data
								// TSQL: the "Table" or "View"
								// MongoDB: the "Collection"

		dataElements: false, // The data elements to return
								// TSQL: the "Columns"
								// MongoDB: the "Fields"

		begin: false,        // Record index to start at
								// TSQL: n in LIMIT 1,n
								// MongoDB: n in Skip(n)

		cap: false,          // Maximum number of records to return
								// TSQL: n in LIMIT n
								// MongoDB: n in limit(n)

		filter: false,       // Data filter expression
								// TSQL: the WHERE clause
								// MongoDB: a find() expression

		sort: false          // The sort order
								// TSQL: ORDER BY
								// MongoDB: sort()
	}, _DefaultParameters);
}

FoxHound.prototype.mergeParameters = function(pFromParameters)
{
	_Parameters = _.extend(_Parameters, pFromParameters);
}

FoxHound.prototype.scope = function(pScope)
{
	_Parameters.scope = pScope;

	return this;
}

FoxHound.prototype.dataElements = function(pDataElements)
{
	var tmpDataElements = false;

	if (Array.isArray(pDataElements))
	{
		// Check if each entry of the pDataElements array are all strings

		tmpDataElements = pDataElements;
	}
	if (typeof(pDataElements) === 'string')
		tmpDataElements = [pDataElements];

	_Parameters.dataElements = tmpDataElements;

	return this;
}
FoxHound.prototype.begin = function(pBeginAmount)
{
	var tmpBegin = false;

	// Test if it is an integer > -1
	// http://jsperf.com/numbers-and-integers
	if (typeof(pBeginAmount) === 'number' && (pBeginAmount % 1) === 0 && pBeginAmount >= 0)
		tmpBegin = pBeginAmount;

	_Parameters.dataElements = pBeginAmount;

	console.log('Beginning with '+pBeginAmount)

	return this;
}

FoxHound.prototype.generateQueryExpression = function (pFromParameters)
{
	mergeParameters(pFromParameters);
}

module.exports = FoxHound;
