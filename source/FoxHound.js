/**
* FoxHound Query Generation Library
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module FoxHound
*/

// We use Underscore.js for utility
var libUnderscore = require('underscore');
// The logger uses Bunyan to write logs
var libLog = require('./Logger.js');
// Each query object gets a UUID, using flake-idgen and biguint-format
var libFlakeIDGen = require('flake-idgen');
var flakeIDGen = new libFlakeIDGen();
var libIntFormat = require('biguint-format')
// TODO: Load parameters for FlakeID generation from a .json config if it exists

// Load our base parameters skeleton object
var baseParameters = require('./Parameters.js');

/**
* FoxHound Query Generation Library Main Class
*
* @class FoxHound
* @constructor
*/
var FoxHound = function()
{
	function createNew(pFromParameters)
	{
		// A universally unique identifier for this query
		var _UUID = libIntFormat(flakeIDGen.next(), 'hex', { prefix: '0x' });

		// The default parameters config object, used as a template for all new
		// queries created from this query.
		var _DefaultParameters = (typeof(pFromParameters) === 'undefined') ? {} : pFromParameters;

		// The parameters config object for the current query.  This is the only
		// piece of internal state that is important to operation.
		var _Parameters = false;

		// The log level, for debugging chattiness.
		var _LogLevel = 0;

		// The dialect to use when generating queries
		var _Dialect = false;

		// Some internal state about the query
		var _Query = (
		{
			body: '',
			parameters: []
		});

		/**
		* Clone the current FoxHound Query into a new Query object, copying all 
		* parameters as the new default.  Clone also copies the log level.
		*
		* @method resetParameters
		* @return {Object} Returns a cloned Query.  This is still chainable.
		*/
		var clone = function()
		{
			var tmpFoxHound = createNew(_Parameters);
			tmpFoxHound.setLogLevel(_LogLevel);

			return tmpFoxHound;
		}


		/**
		* Reset the parameters of the FoxHound Query to the Default.  Default 
		* parameters were set during object construction.
		*
		* @method resetParameters
		* @return {Object} Returns the current Query for chaining.
		*/
		var resetParameters = function()
		{
			_Parameters = libUnderscore.extend(baseParameters, _DefaultParameters);
			return this;
		}

		/**
		* Reset the parameters of the FoxHound Query to the Default.  Default 
		* parameters were set during object construction.
		*
		* @method mergeParameters
		* @param {Object} pFromParameters A Parameters Object to merge from
		* @return {Object} Returns the current Query for chaining.
		*/
		var mergeParameters = function(pFromParameters)
		{
			_Parameters = libUnderscore.extend(_Parameters, pFromParameters);
			return this;
		};


		/**
		* Set the the Logging level.
		*
		* The log levels are:
		*    0  -  Don't log anything
		*    1  -  Log queries
		*    2  -  Log queries and non-parameterized queries
		*    3  -  Log everything
		*
		* @method setLogLevel
		* @param {Number} pLogLevel The log level for our object
		* @return {Object} Returns the current Query for chaining.
		*/
		var setLogLevel = function(pLogLevel)
		{
			var tmpLogLevel = 0;

			if (typeof(pLogLevel) === 'number' && (pLogLevel % 1) === 0)
				tmpLogLevel = pLogLevel;

			_LogLevel = tmpLogLevel;

			return this;
		};


		/**
		* Set the Scope for the Query.  *Scope* is the source for the data being
		* pulled.  In TSQL this would be the _table_, whereas in MongoDB this
		* would be the _collection_.
		*
		* A scope can be either a string, or an array (for JOINs and such).
		*
		* @method setScope
		* @param {String} pScope A Scope for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setScope = function(pScope)
		{
			var tmpScope = false;

			if (typeof(pScope) === 'string')
				tmpScope = pScope;

			_Parameters.scope = tmpScope;

			if (_LogLevel > 2)
				libLog.info({queryUUID:_UUID, parameters:_Parameters}, 'Scope set: '+tmpScope);

			return this;
		};


		/**
		* Set the Data Elements for the Query.  *Data Elements* are the fields
		* being pulled by the query.  In TSQL this would be the _columns_,
		* whereas in MongoDB this would be the _fields_.
		*
		* The passed values can be either a string, or an array.
		*
		* @method setDataElements
		* @param {String} pDataElements The Data Element(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setDataElements = function(pDataElements)
		{
			var tmpDataElements = false;

			if (Array.isArray(pDataElements))
			{
				// TODO: Check each entry of the array are all strings
				tmpDataElements = pDataElements;
			}
			if (typeof(pDataElements) === 'string')
				tmpDataElements = [pDataElements];

			_Parameters.dataElements = tmpDataElements;

			if (_LogLevel > 2)
				libLog.info({queryUUID:_UUID, parameters:_Parameters}, 'Data Elements set');

			return this;
		};


		/**
		* Set the the Begin index for the Query.  *Begin* is the index at which
		* a query should start returning rows.  In TSQL this would be the n
		* parameter of ```LIMIT 1,n```, whereas in MongoDB this would be the
		* n in ```skip(n)```.
		*
		* The passed value must be an Integer >= 0.
		*
		* @method setBegin
		* @param {Number} pBeginAmount The index to begin returning Query data.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setBegin = function(pBeginAmount)
		{
			var tmpBegin = false;

			// Test if it is an integer > -1
			// http://jsperf.com/numbers-and-integers
			if (typeof(pBeginAmount) === 'number' && (pBeginAmount % 1) === 0 && pBeginAmount >= 0)
				tmpBegin = pBeginAmount;

			_Parameters.begin = tmpBegin;

			if (_LogLevel > 2)
				libLog.info({queryUUID:_UUID, parameters:_Parameters}, 'Begin set: '+pBeginAmount);

			return this;
		};


		/**
		* Set the the Cap for the Query.  *Cap* is the maximum number of records
		* a Query should return in a set.  In TSQL this would be the n
		* parameter of ```LIMIT n```, whereas in MongoDB this would be the
		* n in ```limit(n)```.
		*
		* The passed value must be an Integer >= 0.
		*
		* @method setCap
		* @param {Number} pCapAmount The maximum records for the Query set.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setCap = function(pCapAmount)
		{
			var tmpCapAmount = false;

			if (typeof(pCapAmount) === 'number' && (pCapAmount % 1) === 0 && pCapAmount >= 0)
				tmpCapAmount = pCapAmount;

			_Parameters.cap = tmpCapAmount;

			if (_LogLevel > 2)
				libLog.info({queryUUID:_UUID, parameters:_Parameters}, 'Cap set to: '+tmpCapAmount);

			return this;
		};




		/**
		* Set the Dialect for Query generation.
		*
		* This function expects a string, case sensitive, which matches both the
		* folder and filename
		*
		* @method setDialect
		* @param {String} pDialectName The dialect for query generation.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setDialect = function(pDialectName)
		{
			var tmpDialect = 'English';

			if (typeof(pDialectName) === 'string')
			{
				tmpDialect = pDialectName;
			}
			else
			{
				libLog.warn({queryUUID:_UUID, parameters:_Parameters, invalidDialect:pDialectName}, 'Dialect set to English - invalid name');
			}

			var tmpDialectModuleFile = './dialects/'+tmpDialect+'/FoxHound-Dialect-'+tmpDialect+'.js';
			if (_LogLevel > 2)
				libLog.info({queryUUID:_UUID, parameters:_Parameters, dialectModuleFile:tmpDialectModuleFile}, 'Dialog set to: '+tmpDialect);

			try
			{
				tmpDialectModule = require(tmpDialectModuleFile);
				_Dialect = tmpDialectModule;
			}
			catch (pError)
			{
				libLog.error({queryUUID:_UUID, parameters:_Parameters, invalidDialect:pDialectName, error:pError}, 'Dialect not set - require load problem');
			}

			return this;
		}


		var buildFetchQuery = function()
		{
			_Query.body = _Dialect.Fetch(_Parameters);

			return this;
		}

		/**
		* Container Object for our Factory Pattern
		*/
		var tmpNewFoxHoundObject = (
		{
			resetParameters: resetParameters,
			mergeParameters: mergeParameters,

			setLogLevel: setLogLevel,

			setScope: setScope,
			dataElements: setDataElements,
			setBegin: setBegin,
			setCap: setCap,

			buildFetchQuery: buildFetchQuery,

			new: createNew
		});

		/**
		 * Query
		 *
		 * @property query
		 * @type Object
		 */
		Object.defineProperty(tmpNewFoxHoundObject, 'query',
			{
				get: function() { return _Query; },
				set: function(pQuery) { _Query = pQuery; },
				enumerable: true
			});

		/**
		 * Query Parameters
		 *
		 * @property parameters
		 * @type Object
		 */
		Object.defineProperty(tmpNewFoxHoundObject, 'parameters',
			{
				get: function() { return _Parameters; },
				set: function(pParameters) { _Parameters = pParameters; },
				enumerable: true
			});

		/**
		 * Universally Unique Identifier
		 *
		 * @property uuid
		 * @type string
		 */
		Object.defineProperty(tmpNewFoxHoundObject, 'uuid',
			{
				get: function() { return _UUID; },
				enumerable: true
			});


		var __initialize = function ()
		{
			// TODO: Load a json file with default dialect if necessary.
			// On creation of a new query object, we force reset the parameters.
			resetParameters();

			setDialect('English');
		};
		__initialize();

		return tmpNewFoxHoundObject;
	}

	return createNew();
};

module.exports = FoxHound();
