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
	function createNew(pFable, pFromParameters)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pFable) !== 'object') || (!pFable.hasOwnProperty('fable')))
		{
			return {new: createNew};
		}

		var _Fable = pFable;

		// The default parameters config object, used as a template for all new
		// queries created from this query.
		var _DefaultParameters = (typeof(pFromParameters) === 'undefined') ? {} : pFromParameters;

		// The parameters config object for the current query.  This is the only
		// piece of internal state that is important to operation.
		var _Parameters = false;

		// The unique identifier for a query
		var _UUID = _Fable.getUUID();

		// The log level, for debugging chattiness.
		var _LogLevel = 0;

		// The dialect to use when generating queries
		var _Dialect = false;

		/**
		* Clone the current FoxHound Query into a new Query object, copying all
		* parameters as the new default.  Clone also copies the log level.
		*
		* @method clone
		* @return {Object} Returns a cloned Query.  This is still chainable.
		*/
		var clone = function()
		{
			var tmpFoxHound = createNew(_Fable, baseParameters)
				.setScope(_Parameters.scope)
				.setBegin(_Parameters.begin)
				.setCap(_Parameters.cap);

			if (_Parameters.dataElements)
			{
				tmpFoxHound.parameters.dataElements = _Parameters.dataElements.slice(); // Copy the array of dataElements
			}
			if (_Parameters.sort)
			{
				tmpFoxHound.parameters.sort = _Parameters.sort.slice(); // Copy the sort array.
				// TODO: Fix the side affect nature of these being objects in the array .. they are technically clones of the previous.
			}
			if (_Parameters.filter)
			{
				tmpFoxHound.parameters.filter = _Parameters.filter.slice(); // Copy the filter array.
				// TODO: Fix the side affect nature of these being objects in the array .. they are technically clones of the previous.
			}

			return tmpFoxHound;
		};


		/**
		* Reset the parameters of the FoxHound Query to the Default.  Default
		* parameters were set during object construction.
		*
		* @method resetParameters
		* @return {Object} Returns the current Query for chaining.
		*/
		var resetParameters = function()
		{
			_Parameters = libUnderscore.extend({}, baseParameters, _DefaultParameters);
			_Parameters.query = ({
				body: false,
				schema: false,   // The schema to intersect with our records
				records: false,  // The records to be created or changed
				parameters: {}
			});

			_Parameters.result = ({
				executed: false, // True once we've run a query.
				value: false,    // The return value of the last query run
				error: false     // The error message of the last run query
			});

			return this;
		};
		resetParameters();
		_Fable.log.trace('Parameters:', _Parameters)

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
			_Parameters = libUnderscore.extend({}, _Parameters, pFromParameters);
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
			{
				tmpLogLevel = pLogLevel;
			}

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
			{
				tmpScope = pScope;
			}
			else
			{
				_Fable.log.error({queryUUID:_UUID, parameters:_Parameters, invalidScope:pScope}, 'Scope set failed.  You must pass in a string or array.');
			}

			_Parameters.scope = tmpScope;

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters}, 'Scope set: '+tmpScope);
			}

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
			{
				tmpDataElements = [pDataElements];
			}

			_Parameters.dataElements = tmpDataElements;

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters}, 'Data Elements set');
			}

			return this;
		};


		/**
		* Set the sort data element
		*
		* The passed values can be either a string, an object or an array of objects.
		*
		* The Sort object has two values:
		* {Column:'Birthday', Direction:'Ascending'}
		*
		* @method setSort
		* @param {String} pSort The sort criteria(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setSort = function(pSort)
		{
			var tmpSort = false;

			if (Array.isArray(pSort))
			{
				// TODO: Check each entry of the array are all conformant sort objects
				tmpSort = pSort;
			}
			else if (typeof(pSort) === 'string')
			{
				// Default to ascending
				tmpSort = [{Column:pSort, Direction:'Ascending'}];
			}
			else if (typeof(pSort) === 'object')
			{
				// TODO: Check that this sort entry conforms to a sort entry
				tmpSort = [pSort];
			}

			_Parameters.sort = tmpSort;

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters}, 'Sort set');
			}

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
			{
				tmpBegin = pBeginAmount;
			}
			else
			{
				_Fable.log.error({queryUUID:_UUID, parameters:_Parameters, invalidBeginAmount:pBeginAmount}, 'Begin set failed; non-positive or non-numeric argument.');
			}

			_Parameters.begin = tmpBegin;

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters}, 'Begin set: '+pBeginAmount);
			}

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
			{
				tmpCapAmount = pCapAmount;
			}
			else
			{
				_Fable.log.error({queryUUID:_UUID, parameters:_Parameters, invalidCapAmount:pCapAmount}, 'Cap set failed; non-positive or non-numeric argument.');
			}


			_Parameters.cap = tmpCapAmount;

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters}, 'Cap set to: '+tmpCapAmount);
			}

			return this;
		};


		/**
		* Set the filter expression
		*
		* The passed values can be either an object or an array of objects.
		*
		* The Filter object has a minimum of two values (which expands to the following):
		* {Column:'Name', Value:'John'}
		* {Column:'Name', Operator:'EQ', Value:'John', Connector:'And', Parameter:'Name'}
		*
		* @method setFilter
		* @param {String} pFilter The filter(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/
		var setFilter = function(pFilter)
		{
			var tmpFilter = false;

			if (Array.isArray(pFilter))
			{
				// TODO: Check each entry of the array are all conformant Filter objects
				tmpFilter = pFilter;
			}
			else if (typeof(pFilter) === 'object')
			{
				// TODO: Check that this Filter entry conforms to a Filter entry
				tmpFilter = [pFilter];
			}

			_Parameters.filter = tmpFilter;

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters}, 'Filter set');
			}

			return this;
		};



		/**
		* Add a filter expression
		*
		* {Column:'Name', Operator:'EQ', Value:'John', Connector:'And', Parameter:'Name'}
		*
		* @method addFilter
		* @return {Object} Returns the current Query for chaining.
		*/
		var addFilter = function(pColumn, pValue, pOperator, pConnector, pParameter)
		{
			if (typeof(pColumn) !== 'string')
			{
				_Fable.log.warn({queryUUID:_UUID, parameters:_Parameters}, 'Tried to add an invalid query filter column');
				return this;
			}
			if (typeof(pValue) === 'undefined')
			{
				_Fable.log.warn({queryUUID:_UUID, parameters:_Parameters, invalidColumn:pColumn}, 'Tried to add an invalid query filter value');
				return this;
			}
			var tmpOperator = (typeof(pOperator) === 'undefined') ? '=' : pOperator;
			var tmpConnector = (typeof(pConnector) === 'undefined') ? 'AND' : pConnector;
			var tmpParameter = (typeof(pParameter) === 'undefined') ? pColumn : pParameter;

			var tmpFilter = (
				{
					Column: pColumn,
					Operator: tmpOperator,
					Value: pValue,
					Connector: tmpConnector,
					Parameter: tmpParameter
				});

			if (!Array.isArray(_Parameters.filter))
			{
				_Parameters.filter = [tmpFilter];
			}
			else
			{
				_Parameters.filter.push(tmpFilter);
			}

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters, newFilter:tmpFilter}, 'Added a filter');
			}

			return this;
		};



		/**
		* Add a record (for UPDATE and INSERT)
		*
		*
		* @method addRecord
		* @param {Object} pRecord The record to add.
		* @return {Object} Returns the current Query for chaining.
		*/
		var addRecord = function(pRecord)
		{
			if (typeof(pRecord) !== 'object')
			{
				_Fable.log.warn({queryUUID:_UUID, parameters:_Parameters}, 'Tried to add an invalid record to the query -- records must be an object');
				return this;
			}

			if (!Array.isArray(_Parameters.query.records))
			{
				_Parameters.query.records = [pRecord];
			}
			else
			{
				_Parameters.query.records.push(pRecord);
			}

			if (_LogLevel > 2)
			{
				_Fable.log.info({queryUUID:_UUID, parameters:_Parameters, newRecord:pRecord}, 'Added a record to the query');
			}

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
			if (typeof(pDialectName) !== 'string')
			{
				_Fable.log.warn({queryUUID:_UUID, parameters:_Parameters, invalidDialect:pDialectName}, 'Dialect set to English - invalid name');
				return setDialect('English');
			}

			var tmpDialectModuleFile = './dialects/'+pDialectName+'/FoxHound-Dialect-'+pDialectName+'.js';

			try
			{
				var tmpDialectModule = require(tmpDialectModuleFile);
				_Dialect = tmpDialectModule;
				if (_LogLevel > 2)
				{
					_Fable.log.info({queryUUID:_UUID, parameters:_Parameters, dialectModuleFile:tmpDialectModuleFile}, 'Dialog set to: '+pDialectName);
				}
			}
			catch (pError)
			{
				_Fable.log.error({queryUUID:_UUID, parameters:_Parameters, dialectModuleFile:tmpDialectModuleFile, invalidDialect:pDialectName, error:pError}, 'Dialect not set - require load problem');
				setDialect('English');
			}

			return this;
		};

		/**
		* Check that a valid Dialect has been set
		*
		* If there has not been a dialect set, it defaults to English.
		* TODO: Have the json configuration define a "default" dialect.
		*
		* @method checkDialect
		*/
		var checkDialect = function()
		{
			if (_Dialect === false)
			{
				setDialect('English');
			}
		};


		var buildCreateQuery = function()
		{
			checkDialect();
			_Parameters.query.body = _Dialect.Create(_Parameters);
			return this;
		};

		var buildReadQuery = function()
		{
			checkDialect();
			_Parameters.query.body = _Dialect.Read(_Parameters);
			return this;
		};

		var buildUpdateQuery = function()
		{
			checkDialect();
			_Parameters.query.body = _Dialect.Update(_Parameters);
			return this;
		};

		var buildDeleteQuery = function()
		{
			checkDialect();
			_Parameters.query.body = _Dialect.Delete(_Parameters);
			return this;
		};

		var buildCountQuery = function()
		{
			checkDialect();
			_Parameters.query.body = _Dialect.Count(_Parameters);
			return this;
		};

		/**
		* Container Object for our Factory Pattern
		*/
		var tmpNewFoxHoundObject = (
		{
			resetParameters: resetParameters,
			mergeParameters: mergeParameters,

			setLogLevel: setLogLevel,

			setScope: setScope,
			setDataElements: setDataElements,
			setBegin: setBegin,
			setCap: setCap,
			setFilter: setFilter,
			addFilter: addFilter,
			setSort: setSort,

			addRecord: addRecord,

			setDialect: setDialect,

			buildCreateQuery: buildCreateQuery,
			buildReadQuery: buildReadQuery,
			buildUpdateQuery: buildUpdateQuery,
			buildDeleteQuery: buildDeleteQuery,
			buildCountQuery: buildCountQuery,

			clone: clone,
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
				get: function() { return _Parameters.query; },
				set: function(pQuery) { _Parameters.query = pQuery; },
				enumerable: true
			});

		/**
		 * Result
		 *
		 * @property result
		 * @type Object
		 */
		Object.defineProperty(tmpNewFoxHoundObject, 'result',
			{
				get: function() { return _Parameters.result; },
				set: function(pResult) { _Parameters.result = pResult; },
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
		 * Dialect
		 *
		 * @property dialect
		 * @type Object
		 */
		Object.defineProperty(tmpNewFoxHoundObject, 'dialect',
			{
				get: function() { return _Dialect; },
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

		return tmpNewFoxHoundObject;
	}

	return createNew();
};

module.exports = new FoxHound();
