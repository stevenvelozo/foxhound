(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.Foxhound = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      /**
      * Simple browser shim loader - assign the npm module to a window global automatically
      *
      * @license MIT
      * @author <steven@velozo.com>
      */
      var libNPMModuleWrapper = require('./Foxhound.js');
      if (typeof window === 'object' && !window.hasOwnProperty('Foxhound')) {
        window.Foxhound = libNPMModuleWrapper;
      }
      module.exports = libNPMModuleWrapper;
    }, {
      "./Foxhound.js": 3
    }],
    2: [function (require, module, exports) {
      getDialects = () => {
        let tmpDialects = {};
        tmpDialects.ALASQL = require('./dialects/ALASQL/FoxHound-Dialect-ALASQL.js');
        tmpDialects.English = require('./dialects/English/FoxHound-Dialect-English.js');
        tmpDialects.MeadowEndpoints = require('./dialects/MeadowEndpoints/FoxHound-Dialect-MeadowEndpoints.js');
        tmpDialects.MySQL = require('./dialects/MySQL/FoxHound-Dialect-MySQL.js');
        tmpDialects.default = tmpDialects.English;
        return tmpDialects;
      };
      module.exports = getDialects();
    }, {
      "./dialects/ALASQL/FoxHound-Dialect-ALASQL.js": 5,
      "./dialects/English/FoxHound-Dialect-English.js": 6,
      "./dialects/MeadowEndpoints/FoxHound-Dialect-MeadowEndpoints.js": 7,
      "./dialects/MySQL/FoxHound-Dialect-MySQL.js": 8
    }],
    3: [function (require, module, exports) {
      /**
      * FoxHound Query Generation Library
      * @license MIT
      * @author Steven Velozo <steven@velozo.com>
      */

      // Load our base parameters skeleton object
      const baseParameters = require('./Parameters.js');
      var FoxHound = function () {
        function createNew(pFable, pFromParameters) {
          // If a valid Fable object isn't passed in, return a constructor
          if (typeof pFable !== 'object' || !('fable' in pFable)) {
            return {
              new: createNew
            };
          }
          var _Fable = pFable;

          // The default parameters config object, used as a template for all new
          // queries created from this query.
          var _DefaultParameters = typeof pFromParameters === 'undefined' ? {} : pFromParameters;

          // The parameters config object for the current query.  This is the only
          // piece of internal state that is important to operation.
          var _Parameters = false;
          var _Dialects = require('./Foxhound-Dialects.js');

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
          var clone = function () {
            var tmpFoxHound = createNew(_Fable, baseParameters).setScope(_Parameters.scope).setBegin(_Parameters.begin).setCap(_Parameters.cap);

            // Schema is the only part of a query that carries forward.
            tmpFoxHound.query.schema = _Parameters.query.schema;
            if (_Parameters.dataElements) {
              tmpFoxHound.parameters.dataElements = _Parameters.dataElements.slice(); // Copy the array of dataElements
            }

            if (_Parameters.sort) {
              tmpFoxHound.parameters.sort = _Parameters.sort.slice(); // Copy the sort array.
              // TODO: Fix the side affect nature of these being objects in the array .. they are technically clones of the previous.
            }

            if (_Parameters.filter) {
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
          var resetParameters = function () {
            _Parameters = _Fable.Utility.extend({}, baseParameters, _DefaultParameters);
            _Parameters.query = {
              disableAutoIdentity: false,
              disableAutoDateStamp: false,
              disableAutoUserStamp: false,
              disableDeleteTracking: false,
              body: false,
              schema: false,
              // The schema to intersect with our records
              IDUser: 0,
              // The user to stamp into records
              UUID: _Fable.getUUID(),
              // A UUID for this record
              records: false,
              // The records to be created or changed
              parameters: {}
            };
            _Parameters.result = {
              executed: false,
              // True once we've run a query.
              value: false,
              // The return value of the last query run
              error: false // The error message of the last run query
            };

            return this;
          };
          resetParameters();

          /**
          * Reset the parameters of the FoxHound Query to the Default.  Default
          * parameters were set during object construction.
          *
          * @method mergeParameters
          * @param {Object} pFromParameters A Parameters Object to merge from
          * @return {Object} Returns the current Query for chaining.
          */
          var mergeParameters = function (pFromParameters) {
            _Parameters = _Fable.Utility.extend({}, _Parameters, pFromParameters);
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
          var setLogLevel = function (pLogLevel) {
            var tmpLogLevel = 0;
            if (typeof pLogLevel === 'number' && pLogLevel % 1 === 0) {
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
          var setScope = function (pScope) {
            var tmpScope = false;
            if (typeof pScope === 'string') {
              tmpScope = pScope;
            } else if (pScope !== false) {
              _Fable.log.error('Scope set failed.  You must pass in a string or array.', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidScope: pScope
              });
            }
            _Parameters.scope = tmpScope;
            if (_LogLevel > 2) {
              _Fable.log.info('Scope set: ' + tmpScope, {
                queryUUID: _UUID,
                parameters: _Parameters
              });
            }
            return this;
          };

          /**
          * Set whether the query returns DISTINCT results.
          * For count queries, returns the distinct for the selected fields, or all fields in the base table by default.
          *
          * @method setDistinct
          * @param {Boolean} pDistinct True if the query should be distinct.
          * @return {Object} Returns the current Query for chaining.
          */
          var setDistinct = function (pDistinct) {
            _Parameters.distinct = !!pDistinct;
            if (_LogLevel > 2) {
              _Fable.log.info('Distinct set: ' + _Parameters.distinct, {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var setDataElements = function (pDataElements) {
            var tmpDataElements = false;
            if (Array.isArray(pDataElements)) {
              // TODO: Check each entry of the array are all strings
              tmpDataElements = pDataElements;
            }
            if (typeof pDataElements === 'string') {
              tmpDataElements = [pDataElements];
            }
            _Parameters.dataElements = tmpDataElements;
            if (_LogLevel > 2) {
              _Fable.log.info('Data Elements set', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var setSort = function (pSort) {
            var tmpSort = false;
            if (Array.isArray(pSort)) {
              // TODO: Check each entry of the array are all conformant sort objects
              tmpSort = pSort;
            } else if (typeof pSort === 'string') {
              // Default to ascending
              tmpSort = [{
                Column: pSort,
                Direction: 'Ascending'
              }];
            } else if (typeof pSort === 'object') {
              // TODO: Check that this sort entry conforms to a sort entry
              tmpSort = [pSort];
            }
            _Parameters.sort = tmpSort;
            if (_LogLevel > 2) {
              _Fable.log.info('Sort set', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
            }
            return this;
          };

          /**
          * Set the join data element
          *
          * The passed values can be either an object or an array of objects.
          *
          * The join object has four values:
          * {Type:'INNER JOIN', Table:'Test', From:'Test.ID', To:'Scope.IDItem'}
          *
          * @method setJoin
          * @param {Object} pJoin The join criteria(s) for the Query.
          * @return {Object} Returns the current Query for chaining.
          */
          var setJoin = function (pJoin) {
            _Parameters.join = [];
            if (Array.isArray(pJoin)) {
              pJoin.forEach(function (join) {
                addJoin(join.Table, join.From, join.To, join.Type);
              });
            } else if (typeof pJoin === 'object') {
              addJoin(pJoin.Table, pJoin.From, pJoin.To, pJoin.Type);
            }
            return this;
          };

          /**
          * Add a sort data element
          *
          * The passed values can be either a string, an object or an array of objects.
          *
          * The Sort object has two values:
          * {Column:'Birthday', Direction:'Ascending'}
          *
          * @method setSort
          * @param {String} pSort The sort criteria to add to the Query.
          * @return {Object} Returns the current Query for chaining.
          */
          var addSort = function (pSort) {
            var tmpSort = false;
            if (typeof pSort === 'string') {
              // Default to ascending
              tmpSort = {
                Column: pSort,
                Direction: 'Ascending'
              };
            }
            if (typeof pSort === 'object') {
              // TODO: Check that this sort entry conforms to a sort entry
              tmpSort = pSort;
            }
            if (!_Parameters.sort) {
              _Parameters.sort = [];
            }
            _Parameters.sort.push(tmpSort);
            if (_LogLevel > 2) {
              _Fable.log.info('Sort set', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var setBegin = function (pBeginAmount) {
            var tmpBegin = false;

            // Test if it is an integer > -1
            // http://jsperf.com/numbers-and-integers
            if (typeof pBeginAmount === 'number' && pBeginAmount % 1 === 0 && pBeginAmount >= 0) {
              tmpBegin = pBeginAmount;
            } else if (pBeginAmount !== false) {
              _Fable.log.error('Begin set failed; non-positive or non-numeric argument.', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidBeginAmount: pBeginAmount
              });
            }
            _Parameters.begin = tmpBegin;
            if (_LogLevel > 2) {
              _Fable.log.info('Begin set: ' + pBeginAmount, {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var setCap = function (pCapAmount) {
            var tmpCapAmount = false;
            if (typeof pCapAmount === 'number' && pCapAmount % 1 === 0 && pCapAmount >= 0) {
              tmpCapAmount = pCapAmount;
            } else if (pCapAmount !== false) {
              _Fable.log.error('Cap set failed; non-positive or non-numeric argument.', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidCapAmount: pCapAmount
              });
            }
            _Parameters.cap = tmpCapAmount;
            if (_LogLevel > 2) {
              _Fable.log.info('Cap set to: ' + tmpCapAmount, {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var setFilter = function (pFilter) {
            var tmpFilter = false;
            if (Array.isArray(pFilter)) {
              // TODO: Check each entry of the array are all conformant Filter objects
              tmpFilter = pFilter;
            } else if (typeof pFilter === 'object') {
              // TODO: Check that this Filter entry conforms to a Filter entry
              tmpFilter = [pFilter];
            }
            _Parameters.filter = tmpFilter;
            if (_LogLevel > 2) {
              _Fable.log.info('Filter set', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var addFilter = function (pColumn, pValue, pOperator, pConnector, pParameter) {
            if (typeof pColumn !== 'string') {
              _Fable.log.warn('Tried to add an invalid query filter column', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
              return this;
            }
            if (typeof pValue === 'undefined') {
              _Fable.log.warn('Tried to add an invalid query filter value', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidColumn: pColumn
              });
              return this;
            }
            var tmpOperator = typeof pOperator === 'undefined' ? '=' : pOperator;
            var tmpConnector = typeof pConnector === 'undefined' ? 'AND' : pConnector;
            var tmpParameter = typeof pParameter === 'undefined' ? pColumn : pParameter;

            //support table.field notation (mysql2 requires this)
            tmpParameter = tmpParameter.replace('.', '_');
            var tmpFilter = {
              Column: pColumn,
              Operator: tmpOperator,
              Value: pValue,
              Connector: tmpConnector,
              Parameter: tmpParameter
            };
            if (!Array.isArray(_Parameters.filter)) {
              _Parameters.filter = [tmpFilter];
            } else {
              _Parameters.filter.push(tmpFilter);
            }
            if (_LogLevel > 2) {
              _Fable.log.info('Added a filter', {
                queryUUID: _UUID,
                parameters: _Parameters,
                newFilter: tmpFilter
              });
            }
            return this;
          };

          /**
          * Add a join expression
          *
          * {Type:'INNER JOIN', Table:'Test', From:'Test.ID', To:'Scope.IDItem'}
          *
          * @method addJoin
          * @return {Object} Returns the current Query for chaining.
          */
          var addJoin = function (pTable, pFrom, pTo, pType) {
            if (typeof pTable !== 'string') {
              _Fable.log.warn('Tried to add an invalid query join table', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
              return this;
            }
            if (typeof pFrom === 'undefined' || typeof pTo === 'undefined') {
              _Fable.log.warn('Tried to add an invalid query join field', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
              return this;
            }
            //sanity check the join fields
            if (pFrom.indexOf(pTable) != 0) {
              _Fable.log.warn('Tried to add an invalid query join field, join must come FROM the join table!', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidField: pFrom
              });
              return this;
            }
            if (pTo.indexOf('.') <= 0) {
              _Fable.log.warn('Tried to add an invalid query join field, join must go TO a field on another table ([table].[field])!', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidField: pTo
              });
              return this;
            }
            var tmpType = typeof pType === 'undefined' ? 'INNER JOIN' : pType;
            var tmpJoin = {
              Type: tmpType,
              Table: pTable,
              From: pFrom,
              To: pTo
            };
            if (!Array.isArray(_Parameters.join)) {
              _Parameters.join = [tmpJoin];
            } else {
              _Parameters.join.push(tmpJoin);
            }
            if (_LogLevel > 2) {
              _Fable.log.info('Added a join', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
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
          var addRecord = function (pRecord) {
            if (typeof pRecord !== 'object') {
              _Fable.log.warn('Tried to add an invalid record to the query -- records must be an object', {
                queryUUID: _UUID,
                parameters: _Parameters
              });
              return this;
            }
            if (!Array.isArray(_Parameters.query.records)) {
              _Parameters.query.records = [pRecord];
            } else {
              _Parameters.query.records.push(pRecord);
            }
            if (_LogLevel > 2) {
              _Fable.log.info('Added a record to the query', {
                queryUUID: _UUID,
                parameters: _Parameters,
                newRecord: pRecord
              });
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
          var setDialect = function (pDialectName) {
            if (typeof pDialectName !== 'string') {
              _Fable.log.warn('Dialect set to English - invalid name', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidDialect: pDialectName
              });
              return setDialect('English');
            }
            if (_Dialects.hasOwnProperty(pDialectName)) {
              _Dialect = _Dialects[pDialectName](_Fable);
              if (_LogLevel > 2) {
                _Fable.log.info('Dialog set to: ' + pDialectName, {
                  queryUUID: _UUID,
                  parameters: _Parameters
                });
              }
            } else {
              _Fable.log.error('Dialect not set - unknown dialect "' + pDialectName + "'", {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidDialect: pDialectName
              });
              setDialect('English');
            }
            return this;
          };

          /**
          * User to use for this query
          *
          * @method setIDUser
          */
          var setIDUser = function (pIDUser) {
            var tmpUserID = 0;
            if (typeof pIDUser === 'number' && pIDUser % 1 === 0 && pIDUser >= 0) {
              tmpUserID = pIDUser;
            } else if (pIDUser !== false) {
              _Fable.log.error('User set failed; non-positive or non-numeric argument.', {
                queryUUID: _UUID,
                parameters: _Parameters,
                invalidIDUser: pIDUser
              });
            }
            _Parameters.userID = tmpUserID;
            _Parameters.query.IDUser = tmpUserID;
            if (_LogLevel > 2) {
              _Fable.log.info('IDUser set to: ' + tmpUserID, {
                queryUUID: _UUID,
                parameters: _Parameters
              });
            }
            return this;
          };

          /**
          * Flag to disable auto identity
          *
          * @method setDisableAutoIdentity
          */
          var setDisableAutoIdentity = function (pFlag) {
            _Parameters.query.disableAutoIdentity = pFlag;
            return this; //chainable
          };

          /**
          * Flag to disable auto datestamp
          *
          * @method setDisableAutoDateStamp
          */
          var setDisableAutoDateStamp = function (pFlag) {
            _Parameters.query.disableAutoDateStamp = pFlag;
            return this; //chainable
          };

          /**
          * Flag to disable auto userstamp
          *
          * @method setDisableAutoUserStamp
          */
          var setDisableAutoUserStamp = function (pFlag) {
            _Parameters.query.disableAutoUserStamp = pFlag;
            return this; //chainable
          };

          /**
          * Flag to disable delete tracking
          *
          * @method setDisableDeleteTracking
          */
          var setDisableDeleteTracking = function (pFlag) {
            _Parameters.query.disableDeleteTracking = pFlag;
            return this; //chainable
          };

          /**
          * Check that a valid Dialect has been set
          *
          * If there has not been a dialect set, it defaults to English.
          * TODO: Have the json configuration define a "default" dialect.
          *
          * @method checkDialect
          */
          var checkDialect = function () {
            if (_Dialect === false) {
              setDialect('English');
            }
          };
          var buildCreateQuery = function () {
            checkDialect();
            _Parameters.query.body = _Dialect.Create(_Parameters);
            return this;
          };
          var buildReadQuery = function () {
            checkDialect();
            _Parameters.query.body = _Dialect.Read(_Parameters);
            return this;
          };
          var buildUpdateQuery = function () {
            checkDialect();
            _Parameters.query.body = _Dialect.Update(_Parameters);
            return this;
          };
          var buildDeleteQuery = function () {
            checkDialect();
            _Parameters.query.body = _Dialect.Delete(_Parameters);
            return this;
          };
          var buildUndeleteQuery = function () {
            checkDialect();
            _Parameters.query.body = _Dialect.Undelete(_Parameters);
            return this;
          };
          var buildCountQuery = function () {
            checkDialect();
            _Parameters.query.body = _Dialect.Count(_Parameters);
            return this;
          };

          /**
          * Container Object for our Factory Pattern
          */
          var tmpNewFoxHoundObject = {
            resetParameters: resetParameters,
            mergeParameters: mergeParameters,
            setLogLevel: setLogLevel,
            setScope: setScope,
            setDistinct: setDistinct,
            setIDUser: setIDUser,
            setDataElements: setDataElements,
            setBegin: setBegin,
            setCap: setCap,
            setFilter: setFilter,
            addFilter: addFilter,
            setSort: setSort,
            addSort: addSort,
            setJoin: setJoin,
            addJoin: addJoin,
            addRecord: addRecord,
            setDisableAutoIdentity: setDisableAutoIdentity,
            setDisableAutoDateStamp: setDisableAutoDateStamp,
            setDisableAutoUserStamp: setDisableAutoUserStamp,
            setDisableDeleteTracking: setDisableDeleteTracking,
            setDialect: setDialect,
            buildCreateQuery: buildCreateQuery,
            buildReadQuery: buildReadQuery,
            buildUpdateQuery: buildUpdateQuery,
            buildDeleteQuery: buildDeleteQuery,
            buildUndeleteQuery: buildUndeleteQuery,
            buildCountQuery: buildCountQuery,
            clone: clone,
            new: createNew
          };

          /**
           * Query
           *
           * @property query
           * @type Object
           */
          Object.defineProperty(tmpNewFoxHoundObject, 'query', {
            get: function () {
              return _Parameters.query;
            },
            set: function (pQuery) {
              _Parameters.query = pQuery;
            },
            enumerable: true
          });

          /**
           * Result
           *
           * @property result
           * @type Object
           */
          Object.defineProperty(tmpNewFoxHoundObject, 'result', {
            get: function () {
              return _Parameters.result;
            },
            set: function (pResult) {
              _Parameters.result = pResult;
            },
            enumerable: true
          });

          /**
           * Query Parameters
           *
           * @property parameters
           * @type Object
           */
          Object.defineProperty(tmpNewFoxHoundObject, 'parameters', {
            get: function () {
              return _Parameters;
            },
            set: function (pParameters) {
              _Parameters = pParameters;
            },
            enumerable: true
          });

          /**
           * Dialect
           *
           * @property dialect
           * @type Object
           */
          Object.defineProperty(tmpNewFoxHoundObject, 'dialect', {
            get: function () {
              return _Dialect;
            },
            enumerable: true
          });

          /**
           * Universally Unique Identifier
           *
           * @property uuid
           * @type String
           */
          Object.defineProperty(tmpNewFoxHoundObject, 'uuid', {
            get: function () {
              return _UUID;
            },
            enumerable: true
          });

          /**
           * Log Level
           *
           * @property logLevel
           * @type Integer
           */
          Object.defineProperty(tmpNewFoxHoundObject, 'logLevel', {
            get: function () {
              return _LogLevel;
            },
            enumerable: true
          });
          return tmpNewFoxHoundObject;
        }
        return createNew();
      };
      module.exports = FoxHound();
    }, {
      "./Foxhound-Dialects.js": 2,
      "./Parameters.js": 4
    }],
    4: [function (require, module, exports) {
      /**
      * Query Parameters Object
      *
      * @class FoxHoundQueryParameters
      * @constructor
      */
      var FoxHoundQueryParameters = {
        scope: false,
        // STR: The scope of the data
        // TSQL: the "Table" or "View"
        // MongoDB: the "Collection"

        dataElements: false,
        // ARR of STR: The data elements to return
        // TSQL: the "Columns"
        // MongoDB: the "Fields"

        begin: false,
        // INT: Record index to start at
        // TSQL: n in LIMIT 1,n
        // MongoDB: n in Skip(n)

        cap: false,
        // INT: Maximum number of records to return
        // TSQL: n in LIMIT n
        // MongoDB: n in limit(n)

        // Serialization example for a query:
        // Take the filter and return an array of filter instructions
        // Basic instruction anatomy:
        //       INSTRUCTION~FIELD~OPERATOR~VALUE
        // FOP - Filter Open Paren
        //       FOP~~(~
        // FCP - Filter Close Paren
        //       FCP~~)~
        // FBV - Filter By Value
        //       FBV~Category~EQ~Books
        //       Possible comparisons:
        //       * EQ - Equals To (=)
        //       * NE - Not Equals To (!=)
        //       * GT - Greater Than (>)
        //       * GE - Greater Than or Equals To (>=)
        //       * LT - Less Than (<)
        //       * LE - Less Than or Equals To (<=)
        //       * LK - Like (Like)
        // FBL - Filter By List (value list, separated by commas)
        //       FBL~Category~EQ~Books,Movies
        // FSF - Filter Sort Field
        //       FSF~Category~ASC~0
        //       FSF~Category~DESC~0
        // FCC - Filter Constraint Cap (the limit of what is returned)
        //       FCC~~10~
        // FCB - Filter Constraint Begin (the zero-based start index of what is returned)
        //       FCB~~10~
        //
        // This means: FBV~Category~EQ~Books~FBV~PublishedYear~GT~2000~FSF~PublishedYear~DESC~0
        //             Filters down to ALL BOOKS PUBLISHED AFTER 2000 IN DESCENDING ORDER
        filter: false,
        // ARR of OBJ: Data filter expression list {Column:'Name', Operator:'EQ', Value:'John', Connector:'And', Parameter:'Name'}
        // TSQL: the WHERE clause
        // MongoDB: a find() expression

        sort: false,
        // ARR of OBJ: The sort order    {Column:'Birthday', Direction:'Ascending'}
        // TSQL: ORDER BY
        // MongoDB: sort()

        join: false,
        // ARR of OBJ: The join tables    {Type:'INNER JOIN', Table:'test', From: 'Test.ID', To: 'Scope.IDItem' }
        // TSQL: JOIN

        // Force a specific query to run regardless of above ... this is used to override the query generator.
        queryOverride: false,
        // Where the generated query goes
        query: false,
        /*
        	{
        		body: false,
        		schema: false,   // The schema to intersect with our records
        		IDUser: 0,       // The User ID to stamp into records
        		UUID: A_UUID,    // Some globally unique record id, different per cloned query.
        		records: false,  // The records to be created or changed
        		parameters: {}
        	}
        */

        // Who is making the query
        userID: 0,
        // Where the query results are stuck
        result: false
        /*
        	{
        		executed: false, // True once we've run a query.
        		value: false,    // The return value of the last query run
        		error: false     // The error message of the last run query
        	}
        */
      };

      module.exports = FoxHoundQueryParameters;
    }, {}],
    5: [function (require, module, exports) {
      /**
      * FoxHound ALASQL Dialect
      *
      * @license MIT
      *
      * For an ALASQL query override:
      // An underscore template with the following values:
      //      <%= DataElements %> = Field1, Field2, Field3, Field4
      //      <%= Begin %>        = 0
      //      <%= Cap %>          = 10
      //      <%= Filter %>       = WHERE StartDate > :MyStartDate
      //      <%= Sort %>         = ORDER BY Field1
      // The values are empty strings if they aren't set.
      *
      * @author Steven Velozo <steven@velozo.com>
      * @class FoxHoundDialectALASQL
      */

      var FoxHoundDialectALASQL = function (pFable) {
        //Request time from SQL server with microseconds resolution
        const SQL_NOW = "NOW(3)";
        _Fable = pFable;

        /**
        * Generate a table name from the scope.
        *
        * Because ALASQL is all in-memory, and can be run in two modes (anonymous
        * working on arrays or table-based) we are going to make this a programmable
        * value.  Then we can share the code across both providers.
        *
        * @method: generateTableName
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateTableName = function (pParameters) {
          return ' ' + pParameters.scope;
        };

        /**
        * Escape columns, because ALASQL has more reserved KWs than most SQL dialects
        */
        var escapeColumn = (pColumn, pParameters) => {
          if (pColumn.indexOf('.') < 0) {
            return '`' + pColumn + '`';
          } else {
            // This could suck if the scope is not the same
            var tmpTableName = pParameters.scope;
            if (pColumn.indexOf(tmpTableName + '.') > -1) {
              return '`' + pColumn.replace(tmpTableName + '.', '') + '`';
            } else {
              // This doesn't work well but we'll try it.
              return '`' + pColumn + '`';
            }
          }
        };

        /**
        * Generate a field list from the array of dataElements
        *
        * Each entry in the dataElements is a simple string
        *
        * @method: generateFieldList
        * @param: {Object} pParameters SQL Query Parameters
        * @param {Boolean} pIsForCountClause (optional) If true, generate fields for use within a count clause.
        * @return: {String} Returns the field list clause, or empty string if explicit fields are requested but cannot be fulfilled
        *          due to missing schema.
        */
        var generateFieldList = function (pParameters, pIsForCountClause) {
          var tmpDataElements = pParameters.dataElements;
          if (!Array.isArray(tmpDataElements) || tmpDataElements.length < 1) {
            if (!pIsForCountClause) {
              return ' *';
            }
            // we need to list all of the table fields explicitly; get them from the schema
            const tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
            if (tmpSchema.length < 1) {
              // this means we have no schema; returning an empty string here signals the calling code to handle this case
              return '';
            }
            const idColumn = tmpSchema.find(entry => entry.Type === 'AutoIdentity');
            if (!idColumn) {
              // this means there is no autoincrementing unique ID column; treat as above
              return '';
            }
            return ` ${idColumn.Column}`;
          }
          var tmpFieldList = ' ';
          for (var i = 0; i < tmpDataElements.length; i++) {
            if (i > 0) {
              tmpFieldList += ', ';
            }
            tmpFieldList += escapeColumn(tmpDataElements[i], pParameters);
          }
          return tmpFieldList;
        };

        /**
        * Generate a query from the array of where clauses
        *
        * Each clause is an object like:
        	{
        		Column:'Name',
        		Operator:'EQ',
        		Value:'John',
        		Connector:'And',
        		Parameter:'Name'
        	}
        *
        * @method: generateWhere
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the WHERE clause prefixed with WHERE, or an empty string if unnecessary
        */
        var generateWhere = function (pParameters) {
          var tmpFilter = Array.isArray(pParameters.filter) ? pParameters.filter : [];
          var tmpTableName = generateTableName(pParameters).trim();
          if (!pParameters.query.disableDeleteTracking) {
            // Check if there is a Deleted column on the Schema. If so, we add this to the filters automatically (if not already present)
            var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
            for (var i = 0; i < tmpSchema.length; i++) {
              // There is a schema entry for it.  Process it accordingly.
              var tmpSchemaEntry = tmpSchema[i];
              if (tmpSchemaEntry.Type === 'Deleted') {
                var tmpHasDeletedParameter = false;

                //first, check to see if filters are already looking for Deleted column
                if (tmpFilter.length > 0) {
                  for (var x = 0; x < tmpFilter.length; x++) {
                    if (tmpFilter[x].Column === tmpSchemaEntry.Column) {
                      tmpHasDeletedParameter = true;
                      break;
                    }
                  }
                }
                if (!tmpHasDeletedParameter) {
                  //if not, we need to add it
                  tmpFilter.push({
                    Column: tmpTableName + '.' + tmpSchemaEntry.Column,
                    Operator: '=',
                    Value: 0,
                    Connector: 'AND',
                    Parameter: 'Deleted'
                  });
                }
                break;
              }
            }
          }
          if (tmpFilter.length < 1) {
            return '';
          }
          var tmpWhere = ' WHERE';

          // This is used to disable the connectors for subsequent queries.
          // Only the open parenthesis operator uses this, currently.
          var tmpLastOperatorNoConnector = false;
          for (var i = 0; i < tmpFilter.length; i++) {
            if (tmpFilter[i].Connector != 'NONE' && tmpFilter[i].Operator != ')' && tmpWhere != ' WHERE' && tmpLastOperatorNoConnector == false) {
              tmpWhere += ' ' + tmpFilter[i].Connector;
            }
            tmpLastOperatorNoConnector = false;
            var tmpColumnParameter;
            if (tmpFilter[i].Operator === '(') {
              // Open a logical grouping
              tmpWhere += ' (';
              tmpLastOperatorNoConnector = true;
            } else if (tmpFilter[i].Operator === ')') {
              // Close a logical grouping
              tmpWhere += ' )';
            } else if (tmpFilter[i].Operator === 'IN') {
              tmpColumnParameter = tmpFilter[i].Parameter + '_w' + i;
              // Add the column name, operator and parameter name to the list of where value parenthetical
              tmpWhere += ' ' + escapeColumn(tmpFilter[i].Column, pParameters) + ' ' + tmpFilter[i].Operator + ' ( :' + tmpColumnParameter + ' )';
              pParameters.query.parameters[tmpColumnParameter] = tmpFilter[i].Value;
            } else if (tmpFilter[i].Operator === 'IS NOT NULL') {
              // IS NOT NULL is a special operator which doesn't require a value, or parameter
              tmpWhere += ' ' + escapeColumn(tmpFilter[i].Column, pParameters) + ' ' + tmpFilter[i].Operator;
            } else {
              tmpColumnParameter = tmpFilter[i].Parameter + '_w' + i;
              // Add the column name, operator and parameter name to the list of where value parenthetical
              tmpWhere += ' ' + escapeColumn(tmpFilter[i].Column, pParameters) + ' ' + tmpFilter[i].Operator + ' :' + tmpColumnParameter;
              pParameters.query.parameters[tmpColumnParameter] = tmpFilter[i].Value;
            }
          }
          return tmpWhere;
        };

        /**
        * Generate an ORDER BY clause from the sort array
        *
        * Each entry in the sort is an object like:
        * {Column:'Color',Direction:'Descending'}
        *
        * @method: generateOrderBy
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the field list clause
        */
        var generateOrderBy = function (pParameters) {
          var tmpOrderBy = pParameters.sort;
          if (!Array.isArray(tmpOrderBy) || tmpOrderBy.length < 1) {
            return '';
          }
          var tmpOrderClause = ' ORDER BY';
          for (var i = 0; i < tmpOrderBy.length; i++) {
            if (i > 0) {
              tmpOrderClause += ',';
            }
            tmpOrderClause += ' ' + escapeColumn(tmpOrderBy[i].Column, pParameters);
            if (tmpOrderBy[i].Direction == 'Descending') {
              tmpOrderClause += ' DESC';
            }
          }
          return tmpOrderClause;
        };

        /**
        * Generate the limit clause
        *
        * @method: generateLimit
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateLimit = function (pParameters) {
          if (!pParameters.cap) {
            return '';
          }
          var tmpLimit = ' LIMIT';
          // Cap is required for a limit clause.
          tmpLimit += ' ' + pParameters.cap;

          // If there is a begin record, we'll pass that in as well.
          if (pParameters.begin !== false) {
            tmpLimit += ' FETCH ' + pParameters.begin;
          }
          return tmpLimit;
        };

        /**
        * Generate the update SET clause
        *
        * @method: generateUpdateSetters
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateUpdateSetters = function (pParameters) {
          var tmpRecords = pParameters.query.records;
          // We need to tell the query not to generate improperly if there are no values to set.
          if (!Array.isArray(tmpRecords) || tmpRecords.length < 1) {
            return false;
          }

          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpUpdate = '';
          // If there is more than one record in records, we are going to ignore them for now.
          var tmpCurrentColumn = 0;
          for (var tmpColumn in tmpRecords[0]) {
            // No hash table yet, so, we will just linear search it for now.
            // This uses the schema to decide if we want to treat a column differently on insert
            var tmpSchemaEntry = {
              Column: tmpColumn,
              Type: 'Default'
            };
            for (var i = 0; i < tmpSchema.length; i++) {
              if (tmpColumn == tmpSchema[i].Column) {
                // There is a schema entry for it.  Process it accordingly.
                tmpSchemaEntry = tmpSchema[i];
                break;
              }
            }
            if (pParameters.query.disableAutoDateStamp && tmpSchemaEntry.Type === 'UpdateDate') {
              // This is ignored if flag is set
              continue;
            }
            if (pParameters.query.disableAutoUserStamp && tmpSchemaEntry.Type === 'UpdateIDUser') {
              // This is ignored if flag is set
              continue;
            }
            switch (tmpSchemaEntry.Type) {
              case 'AutoIdentity':
              case 'CreateDate':
              case 'CreateIDUser':
              case 'DeleteDate':
              case 'DeleteIDUser':
                // These are all ignored on update
                continue;
            }
            if (tmpCurrentColumn > 0) {
              tmpUpdate += ',';
            }
            switch (tmpSchemaEntry.Type) {
              case 'UpdateDate':
                // This is an autoidentity, so we don't parameterize it and just pass in NULL
                tmpUpdate += ' ' + escapeColumn(tmpColumn, pParameters) + ' = NOW()';
                break;
              case 'UpdateIDUser':
                // This is the user ID, which we hope is in the query.
                // This is how to deal with a normal column
                var tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
                tmpUpdate += ' ' + escapeColumn(tmpColumn, pParameters) + ' = :' + tmpColumnParameter;
                // Set the query parameter
                pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                break;
              default:
                var tmpColumnDefaultParameter = tmpColumn + '_' + tmpCurrentColumn;
                tmpUpdate += ' ' + escapeColumn(tmpColumn, pParameters) + ' = :' + tmpColumnDefaultParameter;

                // Set the query parameter
                pParameters.query.parameters[tmpColumnDefaultParameter] = tmpRecords[0][tmpColumn];
                break;
            }

            // We use a number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (tmpUpdate === '') {
            return false;
          }
          return tmpUpdate;
        };

        /**
        * Generate the update-delete SET clause
        *
        * @method: generateUpdateDeleteSetters
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateUpdateDeleteSetters = function (pParameters) {
          if (pParameters.query.disableDeleteTracking) {
            //Don't generate an UPDATE query if Delete tracking is disabled
            return false;
          }
          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCurrentColumn = 0;
          var tmpHasDeletedField = false;
          var tmpUpdate = '';
          // No hash table yet, so, we will just linear search it for now.
          // This uses the schema to decide if we want to treat a column differently on insert
          var tmpSchemaEntry = {
            Type: 'Default'
          };
          for (var i = 0; i < tmpSchema.length; i++) {
            // There is a schema entry for it.  Process it accordingly.
            tmpSchemaEntry = tmpSchema[i];
            var tmpUpdateSql = null;
            switch (tmpSchemaEntry.Type) {
              case 'Deleted':
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = 1';
                tmpHasDeletedField = true; //this field is required in order for query to be built
                break;
              case 'DeleteDate':
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = NOW()';
                break;
              case 'UpdateDate':
                // Delete operation is an Update, so we should stamp the update time
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = NOW()';
                break;
              case 'DeleteIDUser':
                // This is the user ID, which we hope is in the query.
                // This is how to deal with a normal column
                var tmpColumnParameter = tmpSchemaEntry.Column + '_' + tmpCurrentColumn;
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = :' + tmpColumnParameter;
                // Set the query parameter
                pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                break;
              default:
                //DON'T allow update of other fields in this query
                continue;
            }
            if (tmpCurrentColumn > 0) {
              tmpUpdate += ',';
            }
            tmpUpdate += tmpUpdateSql;

            // We use a number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (!tmpHasDeletedField || tmpUpdate === '') {
            return false;
          }
          return tmpUpdate;
        };

        /**
        * Generate the update-delete SET clause
        *
        * @method: generateUpdateDeleteSetters
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateUpdateUndeleteSetters = function (pParameters) {
          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCurrentColumn = 0;
          var tmpHasDeletedField = false;
          var tmpUpdate = '';
          // No hash table yet, so, we will just linear search it for now.
          // This uses the schema to decide if we want to treat a column differently on insert
          var tmpSchemaEntry = {
            Type: 'Default'
          };
          for (var i = 0; i < tmpSchema.length; i++) {
            // There is a schema entry for it.  Process it accordingly.
            tmpSchemaEntry = tmpSchema[i];
            var tmpUpdateSql = null;
            switch (tmpSchemaEntry.Type) {
              case 'Deleted':
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = 0';
                tmpHasDeletedField = true; //this field is required in order for query to be built
                break;
              case 'UpdateDate':
                // Delete operation is an Update, so we should stamp the update time
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = NOW()';
                break;
              case 'UpdateIDUser':
                // This is the user ID, which we hope is in the query.
                // This is how to deal with a normal column
                var tmpColumnParameter = tmpSchemaEntry.Column + '_' + tmpCurrentColumn;
                tmpUpdateSql = ' ' + escapeColumn(tmpSchemaEntry.Column, pParameters) + ' = :' + tmpColumnParameter;
                // Set the query parameter
                pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                break;
              default:
                //DON'T allow update of other fields in this query
                continue;
            }
            if (tmpCurrentColumn > 0) {
              tmpUpdate += ',';
            }
            tmpUpdate += tmpUpdateSql;

            // We use a number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (!tmpHasDeletedField || tmpUpdate === '') {
            return false;
          }
          return tmpUpdate;
        };

        /**
        * Generate the create SET clause
        *
        * @method: generateCreateSetList
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateCreateSetValues = function (pParameters) {
          var tmpRecords = pParameters.query.records;
          // We need to tell the query not to generate improperly if there are no values to set.
          if (!Array.isArray(tmpRecords) || tmpRecords.length < 1) {
            return false;
          }

          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCreateSet = '';
          // If there is more than one record in records, we are going to ignore them for now.
          var tmpCurrentColumn = 0;
          for (var tmpColumn in tmpRecords[0]) {
            // No hash table yet, so, we will just linear search it for now.
            // This uses the schema to decide if we want to treat a column differently on insert
            var tmpSchemaEntry = {
              Column: tmpColumn,
              Type: 'Default'
            };
            for (var i = 0; i < tmpSchema.length; i++) {
              if (tmpColumn == tmpSchema[i].Column) {
                // There is a schema entry for it.  Process it accordingly.
                tmpSchemaEntry = tmpSchema[i];
                break;
              }
            }
            if (!pParameters.query.disableDeleteTracking) {
              if (tmpSchemaEntry.Type === 'DeleteDate' || tmpSchemaEntry.Type === 'DeleteIDUser') {
                // These are all ignored on insert (if delete tracking is enabled as normal)
                continue;
              }
            }
            if (tmpCurrentColumn > 0) {
              tmpCreateSet += ',';
            }

            //define a re-usable method for setting up field definitions in a default pattern
            var buildDefaultDefinition = function () {
              var tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
              tmpCreateSet += ' :' + tmpColumnParameter;
              // Set the query parameter
              pParameters.query.parameters[tmpColumnParameter] = tmpRecords[0][tmpColumn];
            };
            var tmpColumnParameter;
            switch (tmpSchemaEntry.Type) {
              case 'AutoIdentity':
                if (pParameters.query.disableAutoIdentity) {
                  buildDefaultDefinition();
                } else {
                  // This is an autoidentity, so we don't parameterize it and just pass in NULL
                  tmpCreateSet += ' NULL';
                }
                break;
              case 'AutoGUID':
                if (pParameters.query.disableAutoIdentity) {
                  buildDefaultDefinition();
                } else if (tmpRecords[0][tmpColumn] && tmpRecords[0][tmpColumn].length >= 5 && tmpRecords[0][tmpColumn] !== '0x0000000000000000')
                  //stricture default
                  {
                    // Allow consumer to override AutoGUID
                    buildDefaultDefinition();
                  } else {
                  // This is an autoidentity, so we don't parameterize it and just pass in NULL
                  tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
                  tmpCreateSet += ' :' + tmpColumnParameter;
                  // Set the query parameter
                  pParameters.query.parameters[tmpColumnParameter] = pParameters.query.UUID;
                }
                break;
              case 'UpdateDate':
              case 'CreateDate':
              case 'DeleteDate':
                if (pParameters.query.disableAutoDateStamp) {
                  buildDefaultDefinition();
                } else {
                  // This is an autoidentity, so we don't parameterize it and just pass in NULL
                  tmpCreateSet += ' NOW()';
                }
                break;
              case 'UpdateIDUser':
              case 'CreateIDUser':
              case 'DeleteIDUser':
                if (pParameters.query.disableAutoUserStamp) {
                  buildDefaultDefinition();
                } else {
                  // This is the user ID, which we hope is in the query.
                  // This is how to deal with a normal column
                  tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
                  tmpCreateSet += ' :' + tmpColumnParameter;
                  // Set the query parameter
                  pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                }
                break;
              default:
                buildDefaultDefinition();
                break;
            }

            // We use an appended number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (tmpCreateSet === '') {
            return false;
          }
          return tmpCreateSet;
        };

        /**
        * Generate the create SET clause
        *
        * @method: generateCreateSetList
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateCreateSetList = function (pParameters) {
          // The records were already validated by generateCreateSetValues
          var tmpRecords = pParameters.query.records;

          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCreateSet = '';
          // If there is more than one record in records, we are going to ignore them for now.
          for (var tmpColumn in tmpRecords[0]) {
            // No hash table yet, so, we will just linear search it for now.
            // This uses the schema to decide if we want to treat a column differently on insert
            var tmpSchemaEntry = {
              Column: tmpColumn,
              Type: 'Default'
            };
            for (var i = 0; i < tmpSchema.length; i++) {
              if (tmpColumn == tmpSchema[i].Column) {
                // There is a schema entry for it.  Process it accordingly.
                tmpSchemaEntry = tmpSchema[i];
                break;
              }
            }
            if (!pParameters.query.disableDeleteTracking) {
              if (tmpSchemaEntry.Type === 'DeleteDate' || tmpSchemaEntry.Type === 'DeleteIDUser') {
                // These are all ignored on insert (if delete tracking is enabled as normal)
                continue;
              }
            }
            switch (tmpSchemaEntry.Type) {
              default:
                if (tmpCreateSet != '') {
                  tmpCreateSet += ',';
                }
                tmpCreateSet += ' ' + escapeColumn(tmpColumn, pParameters);
                break;
            }
          }
          return tmpCreateSet;
        };
        var Create = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpCreateSetList = generateCreateSetList(pParameters);
          var tmpCreateSetValues = generateCreateSetValues(pParameters);
          if (!tmpCreateSetValues) {
            return false;
          }
          return 'INSERT INTO' + tmpTableName + ' (' + tmpCreateSetList + ') VALUES (' + tmpCreateSetValues + ');';
        };

        /**
        * Read one or many records
        *
        * Some examples:
        * SELECT * FROM WIDGETS;
        * SELECT * FROM WIDGETS LIMIT 0, 20;
        * SELECT * FROM WIDGETS LIMIT 5, 20;
        * SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20;
        * SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20 WHERE LastName = 'Smith';
        *
        * @method Read
        * @param {Object} pParameters SQL Query parameters
        * @return {String} Returns the current Query for chaining.
        */
        var Read = function (pParameters) {
          var tmpFieldList = generateFieldList(pParameters);
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpOrderBy = generateOrderBy(pParameters);
          var tmpLimit = generateLimit(pParameters);
          const tmpOptDistinct = pParameters.distinct ? ' DISTINCT' : '';
          if (pParameters.queryOverride) {
            try {
              var tmpQueryTemplate = _Fable.Utility.template(pParameters.queryOverride);
              return tmpQueryTemplate({
                FieldList: tmpFieldList,
                TableName: tmpTableName,
                Where: tmpWhere,
                OrderBy: tmpOrderBy,
                Limit: tmpLimit,
                Distinct: tmpOptDistinct,
                _Params: pParameters
              });
            } catch (pError) {
              // This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
              console.log('Error with custom Read Query [' + pParameters.queryOverride + ']: ' + pError);
              return false;
            }
          }
          return `SELECT${tmpOptDistinct}${tmpFieldList} FROM${tmpTableName}${tmpWhere}${tmpOrderBy}${tmpLimit};`;
        };
        var Update = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpUpdateSetters = generateUpdateSetters(pParameters);
          if (!tmpUpdateSetters) {
            return false;
          }
          return 'UPDATE' + tmpTableName + ' SET' + tmpUpdateSetters + tmpWhere + ';';
        };
        var Delete = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpUpdateDeleteSetters = generateUpdateDeleteSetters(pParameters);
          if (tmpUpdateDeleteSetters) {
            //If it has a deleted bit, update it instead of actually deleting the record
            return 'UPDATE' + tmpTableName + ' SET' + tmpUpdateDeleteSetters + tmpWhere + ';';
          } else {
            return 'DELETE FROM' + tmpTableName + tmpWhere + ';';
          }
        };
        var Undelete = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          let tmpDeleteTrackingState = pParameters.query.disableDeleteTracking;
          pParameters.query.disableDeleteTracking = true;
          var tmpWhere = generateWhere(pParameters);
          var tmpUpdateUndeleteSetters = generateUpdateUndeleteSetters(pParameters);
          pParameters.query.disableDeleteTracking = tmpDeleteTrackingState;
          if (tmpUpdateUndeleteSetters) {
            //If it has a deleted bit, update it instead of actually deleting the record
            return 'UPDATE' + tmpTableName + ' SET' + tmpUpdateUndeleteSetters + tmpWhere + ';';
          } else {
            return 'SELECT NULL;';
          }
        };
        var Count = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          const tmpFieldList = pParameters.distinct ? generateFieldList(pParameters, true) : '*';

          // here, we ignore the distinct keyword if no fields have been specified and
          if (pParameters.distinct && tmpFieldList.length < 1) {
            console.warn('Distinct requested but no field list or schema are available, so not honoring distinct for count query.');
          }
          const tmpOptDistinct = pParameters.distinct && tmpFieldList.length > 0 ? 'DISTINCT' : '';
          if (pParameters.queryOverride) {
            try {
              var tmpQueryTemplate = _Fable.Utility.template(pParameters.queryOverride);
              return tmpQueryTemplate({
                FieldList: [],
                TableName: tmpTableName,
                Where: tmpWhere,
                OrderBy: '',
                Limit: '',
                Distinct: tmpOptDistinct,
                _Params: pParameters
              });
            } catch (pError) {
              // This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
              console.log('Error with custom Count Query [' + pParameters.queryOverride + ']: ' + pError);
              return false;
            }
          }
          return `SELECT COUNT(${tmpOptDistinct}${tmpFieldList || '*'}) AS RowCount FROM${tmpTableName}${tmpWhere};`;
        };
        var tmpDialect = {
          Create: Create,
          Read: Read,
          Update: Update,
          Delete: Delete,
          Undelete: Undelete,
          Count: Count
        };

        /**
        * Dialect Name
        *
        * @property name
        * @type string
        */
        Object.defineProperty(tmpDialect, 'name', {
          get: function () {
            return 'ALASQL';
          },
          enumerable: true
        });
        return tmpDialect;
      };
      module.exports = FoxHoundDialectALASQL;
    }, {}],
    6: [function (require, module, exports) {
      /**
      * FoxHound English Dialect
      *
      * Because if I can't ask for it in my native tongue, how am I going to ask a
      * complicated server for it?
      *
      * @license MIT
      *
      * @author Steven Velozo <steven@velozo.com>
      * @class FoxHoundDialectEnglish
      */
      var FoxHoundDialectEnglish = function () {
        var Create = function (pParameters) {
          var tmpScope = pParameters.scope;
          return 'Here is a ' + tmpScope + '.';
        };

        /**
        * Read one or many records
        *
        * Some examples:
        * Please give me all your Widget records.  Thanks.
        * Please give me 20 Widget records.  Thanks.
        * Please give me 20 Widget records starting with record 5.  Thanks.
        * Please give me the ID, Name and Cost of 20 Widget records starting with record 5.  Thanks.
        * Please give me the ID and Name of 20 Widget records starting with record 5, when LastName equals "Smith".  Thanks.
        *
        * @method Read
        * @param {Number} pLogLevel The log level for our object
        * @return {String} Returns the current Query for chaining.
        */
        var Read = function (pParameters) {
          var tmpScope = pParameters.scope;
          const tmpDistinct = pParameters.distinct ? 'unique ' : '';
          return `Please give me all your ${tmpDistinct}${tmpScope} records.  Thanks.`;
        };
        var Update = function (pParameters) {
          var tmpScope = pParameters.scope;
          return 'I am changing your ' + tmpScope + '.';
        };
        var Delete = function (pParameters) {
          var tmpScope = pParameters.scope;
          return 'I am deleting your ' + tmpScope + '.';
        };
        var Undelete = function (pParameters) {
          var tmpScope = pParameters.scope;
          return 'I am undeleting your ' + tmpScope + '.';
        };
        var Count = function (pParameters) {
          var tmpScope = pParameters.scope;
          const tmpDistinct = pParameters.distinct ? 'unique ' : '';
          return `Count your ${tmpDistinct}${tmpScope}.`;
        };
        var tmpDialect = {
          Create: Create,
          Read: Read,
          Update: Update,
          Delete: Delete,
          Undelete: Undelete,
          Count: Count
        };

        /**
         * Dialect Name
         *
         * @property name
         * @type string
         */
        Object.defineProperty(tmpDialect, 'name', {
          get: function () {
            return 'English';
          },
          enumerable: true
        });
        return tmpDialect;
      };
      module.exports = FoxHoundDialectEnglish;
    }, {}],
    7: [function (require, module, exports) {
      /**
      * FoxHound Meadow Endpoints Dialect
      *
      * @license MIT
      *
      * @author Steven Velozo <steven@velozo.com>
      * @class FoxHoundDialectMeadowEndpoints
      */

      var FoxHoundDialectMeadowEndpoints = function () {
        /**
         * Generate a table name from the scope
         *
         * @method: generateTableName
         * @param: {Object} pParameters SQL Query Parameters
         * @return: {String} Returns the table name clause
         */
        var generateTableName = function (pParameters) {
          return pParameters.scope;
        };

        /**
         * Generate the Identity column from the schema or scope
         * 
         * @method: generateIdentityColumnName
         * @param: {Object} pParameters SQL Query Parameters
         * @return: {String} Returns the table name clause
         */
        var generateIdentityColumnName = function (pParameters) {
          // TODO: See about using the Schema or the Schemata for this
          return `ID${pParameters.scope}`;
        };

        /**
         * Generate a field list from the array of dataElements
         *
         * Each entry in the dataElements is a simple string
         *
         * @method: generateFieldList
         * @param: {Object} pParameters SQL Query Parameters
         * @return: {String} Returns the field list clause
         */
        var generateFieldList = function (pParameters) {
          var tmpDataElements = pParameters.dataElements;
          if (!Array.isArray(tmpDataElements) || tmpDataElements.length < 1) {
            return '';
          }
          var tmpFieldList = '';
          for (var i = 0; i < tmpDataElements.length; i++) {
            if (i > 0) {
              tmpFieldList += ',';
            }
            tmpFieldList += tmpDataElements[i];
          }
          return tmpFieldList;
        };

        /**
         * Generate a query from the array of where clauses
         *
         * Each clause is an object like:
        	{
        		Column:'Name', 
        		Operator:'EQ', 
        		Value:'John', 
        		Connector:'And', 
        		Parameter:'Name'
        	}
         *
         * @method: generateWhere
         * @param: {Object} pParameters SQL Query Parameters
         * @return: {String} Returns the WHERE clause prefixed with WHERE, or an empty string if unnecessary
         */
        var generateWhere = function (pParameters) {
          var tmpFilter = Array.isArray(pParameters.filter) ? pParameters.filter : [];
          var tmpTableName = generateTableName(pParameters);
          var tmpURL = '';
          let tmpfAddFilter = (pFilterCommand, pFilterParameters) => {
            if (tmpURL.length > 0) {
              tmpURL += '~';
            }
            tmpURL += `${pFilterCommand}~${pFilterParameters[0]}~${pFilterParameters[1]}~${pFilterParameters[2]}`;
          };
          let tmpfTranslateOperator = pOperator => {
            tmpNewOperator = 'EQ';
            switch (pOperator.toUpperCase()) {
              case '!=':
                tmpNewOperator = 'NE';
                break;
              case '>':
                tmpNewOperator = 'GT';
                break;
              case '>=':
                tmpNewOperator = 'GE';
                break;
              case '<=':
                tmpNewOperator = 'LE';
                break;
              case '<':
                tmpNewOperator = 'LT';
                break;
              case 'LIKE':
                tmpNewOperator = 'LK';
                break;
              case 'IN':
                tmpNewOperator = 'INN';
                break;
              case 'NOT IN':
                tmpNewOperator = 'NI';
                break;
            }
            return tmpNewOperator;
          };

          // Translating Delete Tracking bit on query to a query with automagic
          // This will eventually deprecate this as part of the necessary query
          if (pParameters.query.disableDeleteTracking) {
            tmpfAddFilter('FBV', ['Deleted', 'GE', '0']);
          }
          for (var i = 0; i < tmpFilter.length; i++) {
            if (tmpFilter[i].Operator === '(') {
              tmpfAddFilter('FOP', ['0', '(', '0']);
            } else if (tmpFilter[i].Operator === ')') {
              // Close a logical grouping
              tmpfAddFilter('FCP', ['0', ')', '0']);
            } else if (tmpFilter[i].Operator === 'IN' || tmpFilter[i].Operator === "NOT IN") {
              let tmpFilterCommand = 'FBV';
              if (tmpFilter[i].Connector == 'OR') {
                tmpFilterCommand = 'FBVOR';
              }
              // Add the column name, operator and parameter name to the list of where value parenthetical
              tmpfAddFilter(tmpFilterCommand, [tmpFilter[i].Column, tmpfTranslateOperator(tmpFilter[i].Operator), tmpFilter[i].Value.map(encodeURIComponent).join(',')]);
            } else if (tmpFilter[i].Operator === 'IS NULL') {
              // IS NULL is a special operator which doesn't require a value, or parameter
              tmpfAddFilter('FBV', [tmpFilter[i].Column, 'IN', '0']);
            } else if (tmpFilter[i].Operator === 'IS NOT NULL') {
              // IS NOT NULL is a special operator which doesn't require a value, or parameter
              tmpfAddFilter('FBV', [tmpFilter[i].Column, 'NN', '0']);
            } else {
              let tmpFilterCommand = 'FBV';
              if (tmpFilter[i].Connector == 'OR') {
                tmpFilterCommand = 'FBVOR';
              }
              // Add the column name, operator and parameter name to the list of where value parenthetical
              tmpfAddFilter(tmpFilterCommand, [tmpFilter[i].Column, tmpfTranslateOperator(tmpFilter[i].Operator), encodeURIComponent(tmpFilter[i].Value)]);
            }
          }
          let tmpOrderBy = generateOrderBy(pParameters);
          if (tmpOrderBy) {
            if (tmpURL) {
              tmpURL += '~';
            }
            tmpURL += tmpOrderBy;
          }
          return tmpURL;
        };

        /**
        * Get the flags for the request
         * 
         * These are usually passed in for Update and Create when extra tracking is disabled.
        *
        * @method: generateFlags
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Flags to be sent, if any.
        */
        function generateFlags(pParameters) {
          let tmpDisableAutoDateStamp = pParameters.query.disableAutoDateStamp;
          let tmpDisableDeleteTracking = pParameters.query.disableDeleteTracking;
          let tmpDisableAutoIdentity = pParameters.query.disableAutoIdentity;
          let tmpDisableAutoUserStamp = pParameters.query.disableAutoUserStamp;
          let tmpFlags = '';
          let fAddFlag = (pFlagSet, pFlag) => {
            if (pFlagSet) {
              if (tmpFlags.length > 0) {
                tmpFlags += ',';
              }
              tmpFlags += pFlag;
            }
          };
          fAddFlag(tmpDisableAutoDateStamp, 'DisableAutoDateStamp');
          fAddFlag(tmpDisableDeleteTracking, 'DisableDeleteTracking');
          fAddFlag(tmpDisableAutoIdentity, 'DisableAutoIdentity');
          fAddFlag(tmpDisableAutoUserStamp, 'DisableAutoUserStamp');
          return tmpFlags;
        }
        ;

        /**
        * Get the ID for the record, to be used in URIs
        *
        * @method: getIDRecord
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} ID of the record in string form for the URI
        */
        var getIDRecord = function (pParameters) {
          var tmpFilter = Array.isArray(pParameters.filter) ? pParameters.filter : [];
          var tmpIDRecord = false;
          if (tmpFilter.length < 1) {
            return tmpIDRecord;
          }
          for (var i = 0; i < tmpFilter.length; i++) {
            // Check Schema Entry Type
            var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
            var tmpSchemaEntry = {
              Column: tmpFilter[i].Column,
              Type: 'Default'
            };
            for (var j = 0; j < tmpSchema.length; j++) {
              // If this column is the AutoIdentity, set it.
              if (tmpFilter[i].Column == tmpSchema[j].Column && tmpSchema[j].Type == 'AutoIdentity') {
                tmpIDRecord = tmpFilter[i].Value;
                break;
              }
            }
          }
          return tmpIDRecord;
        };

        /**
        * Generate an ORDER BY clause from the sort array
        *
        * Each entry in the sort is an object like:
        * {Column:'Color',Direction:'Descending'}
        *
        * @method: generateOrderBy
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the field list clause
        */
        var generateOrderBy = function (pParameters) {
          var tmpOrderBy = pParameters.sort;
          var tmpOrderClause = false;
          if (!Array.isArray(tmpOrderBy) || tmpOrderBy.length < 1) {
            return tmpOrderClause;
          }
          tmpOrderClause = '';
          for (var i = 0; i < tmpOrderBy.length; i++) {
            if (i > 0) {
              tmpOrderClause += '~';
            }
            tmpOrderClause += `FSF~${tmpOrderBy[i].Column}~`;
            if (tmpOrderBy[i].Direction == 'Descending') {
              tmpOrderClause += 'DESC~0';
            } else {
              tmpOrderClause += 'ASC~0';
            }
          }
          return tmpOrderClause;
        };

        /**
         * Generate the limit clause
         *
         * @method: generateLimit
         * @param: {Object} pParameters SQL Query Parameters
         * @return: {String} Returns the table name clause
         */
        var generateLimit = function (pParameters) {
          if (!pParameters.cap) {
            return '';
          }
          let tmpBegin = pParameters.begin !== false ? pParameters.begin : 0;
          return `${tmpBegin}/${pParameters.cap}`;
        };
        var Create = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpFlags = generateFlags(pParameters);
          if (tmpTableName) {
            let tmpURL = tmpTableName;
            if (tmpFlags) {
              tmpURL = `${tmpURL}/WithFlags/${tmpFlags}`;
            }
            return tmpURL;
          } else {
            return false;
          }
        };

        /**
        * Read one or many records
        *
        * @method Read
        * @param {Object} pParameters SQL Query parameters
        * @return {String} Returns the current Query for chaining.
        */
        var Read = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpFieldList = generateFieldList(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpLimit = generateLimit(pParameters);
          var tmpURL = `${tmpTableName}`;
          // In the case that there is only a single query parameter, and the parameter is a single identity, 
          // we will cast it to the READ endpoint rather than READS.
          if (pParameters.filter && pParameters.filter.length == 1
          // If there is exactly one query filter parameter
          && pParameters.filter[0].Column === generateIdentityColumnName(pParameters)
          // AND It is the Identity column
          && pParameters.filter[0].Operator === '='
          // AND The comparators is a simple equals 
          && tmpLimit == '' && tmpFieldList == ''
          // AND There is no limit or field list set
          && !pParameters.sort)
            // AND There is no sort clause
            {
              // THEN This is a SINGLE READ by presumption.
              // There are some bad side affects this could cause with chaining and overridden behaviors, if 
              // we are requesting a filtered list of 1 record.
              tmpURL = `${tmpURL}/${pParameters.filter[0].Value}`;
            } else {
            tmpURL = `${tmpURL}s`;
            if (tmpFieldList) {
              tmpURL = `${tmpURL}/LiteExtended/${tmpFieldList}`;
            }
            if (tmpWhere) {
              tmpURL = `${tmpURL}/FilteredTo/${tmpWhere}`;
            }
            if (tmpLimit) {
              tmpURL = `${tmpURL}/${tmpLimit}`;
            }
          }
          return tmpURL;
        };
        var Update = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpFlags = generateFlags(pParameters);
          if (tmpTableName) {
            let tmpURL = tmpTableName;
            if (tmpFlags) {
              tmpURL = `${tmpURL}/WithFlags/${tmpFlags}`;
            }
            return tmpURL;
          } else {
            return false;
          }
        };
        var Delete = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpIDRecord = getIDRecord(pParameters);
          if (!tmpIDRecord) {
            return false;
          }
          return `${tmpTableName}/${tmpIDRecord}`;
        };
        var Count = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          let tmpCountQuery = `${tmpTableName}s/Count`;
          if (tmpWhere) {
            return `${tmpTableName}s/Count/FilteredTo/${tmpWhere}`;
          }
          return tmpCountQuery;
        };
        var tmpDialect = {
          Create: Create,
          Read: Read,
          Update: Update,
          Delete: Delete,
          Count: Count
        };

        /**
         * Dialect Name
         *
         * @property name
         * @type string
         */
        Object.defineProperty(tmpDialect, 'name', {
          get: function () {
            return 'MeadowEndpoints';
          },
          enumerable: true
        });
        return tmpDialect;
      };
      module.exports = FoxHoundDialectMeadowEndpoints;
    }, {}],
    8: [function (require, module, exports) {
      /**
      * FoxHound MySQL Dialect
      *
      * @license MIT
      *
      * For a MySQL query override:
      // An underscore template with the following values:
      //      <%= DataElements %> = Field1, Field2, Field3, Field4
      //      <%= Begin %>        = 0
      //      <%= Cap %>          = 10
      //      <%= Filter %>       = WHERE StartDate > :MyStartDate
      //      <%= Sort %>         = ORDER BY Field1
      // The values are empty strings if they aren't set.
      *
      * @author Steven Velozo <steven@velozo.com>
      * @class FoxHoundDialectMySQL
      */

      var FoxHoundDialectMySQL = function (pFable) {
        //Request time from SQL server with microseconds resolution
        const SQL_NOW = "NOW(3)";
        _Fable = pFable;

        /**
        * Generate a table name from the scope
        *
        * @method: generateTableName
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateTableName = function (pParameters) {
          if (pParameters.scope && pParameters.scope.indexOf('`') >= 0) return ' ' + pParameters.scope + '';else return ' `' + pParameters.scope + '`';
        };

        /**
        * Generate a field list from the array of dataElements
        *
        * Each entry in the dataElements is a simple string
        *
        * @method: generateFieldList
        * @param: {Object} pParameters SQL Query Parameters
        * @param {Boolean} pIsForCountClause (optional) If true, generate fields for use within a count clause.
        * @return: {String} Returns the field list clause, or empty string if explicit fields are requested but cannot be fulfilled
        *          due to missing schema.
        */
        var generateFieldList = function (pParameters, pIsForCountClause) {
          var tmpDataElements = pParameters.dataElements;
          if (!Array.isArray(tmpDataElements) || tmpDataElements.length < 1) {
            const tmpTableName = generateTableName(pParameters);
            if (!pIsForCountClause) {
              return tmpTableName + '.*';
            }
            // we need to list all of the table fields explicitly; get them from the schema
            const tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
            if (tmpSchema.length < 1) {
              // this means we have no schema; returning an empty string here signals the calling code to handle this case
              return '';
            }
            const idColumn = tmpSchema.find(entry => entry.Type === 'AutoIdentity');
            if (!idColumn) {
              // this means there is no autoincrementing unique ID column; treat as above
              return '';
            }
            const qualifiedIDColumn = `${tmpTableName}.${idColumn.Column}`;
            return ` ${generateSafeFieldName(qualifiedIDColumn)}`;
          }
          var tmpFieldList = ' ';
          for (var i = 0; i < tmpDataElements.length; i++) {
            if (i > 0) {
              tmpFieldList += ', ';
            }
            if (Array.isArray(tmpDataElements[i])) {
              tmpFieldList += generateSafeFieldName(tmpDataElements[i][0]);
              if (tmpDataElements[i].length > 1 && tmpDataElements[i][1]) {
                tmpFieldList += " AS " + generateSafeFieldName(tmpDataElements[i][1]);
              }
            } else {
              tmpFieldList += generateSafeFieldName(tmpDataElements[i]);
            }
          }
          return tmpFieldList;
        };
        const SURROUNDING_QUOTES_AND_WHITESPACE_REGEX = /^[` ]+|[` ]+$/g;
        const cleanseQuoting = str => {
          return str.replace(SURROUNDING_QUOTES_AND_WHITESPACE_REGEX, '');
        };

        /**
        * Ensure a field name is properly escaped.
        */
        var generateSafeFieldName = function (pFieldName) {
          let pFieldNames = pFieldName.split('.');
          if (pFieldNames.length > 1) {
            const cleansedFieldName = cleanseQuoting(pFieldNames[1]);
            if (cleansedFieldName === '*') {
              // do not put * as `*`
              return "`" + cleanseQuoting(pFieldNames[0]) + "`.*";
            }
            return "`" + cleanseQuoting(pFieldNames[0]) + "`.`" + cleansedFieldName + "`";
          }
          const cleansedFieldName = cleanseQuoting(pFieldNames[0]);
          if (cleansedFieldName === '*') {
            // do not put * as `*`
            return '*';
          }
          return "`" + cleanseQuoting(pFieldNames[0]) + "`";
        };

        /**
        * Generate a query from the array of where clauses
        *
        * Each clause is an object like:
        	{
        		Column:'Name',
        		Operator:'EQ',
        		Value:'John',
        		Connector:'And',
        		Parameter:'Name'
        	}
        *
        * @method: generateWhere
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the WHERE clause prefixed with WHERE, or an empty string if unnecessary
        */
        var generateWhere = function (pParameters) {
          var tmpFilter = Array.isArray(pParameters.filter) ? pParameters.filter : [];
          var tmpTableName = generateTableName(pParameters);
          if (!pParameters.query.disableDeleteTracking) {
            // Check if there is a Deleted column on the Schema. If so, we add this to the filters automatically (if not already present)
            var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
            for (var i = 0; i < tmpSchema.length; i++) {
              // There is a schema entry for it.  Process it accordingly.
              var tmpSchemaEntry = tmpSchema[i];
              if (tmpSchemaEntry.Type === 'Deleted') {
                var tmpHasDeletedParameter = false;

                //first, check to see if filters are already looking for Deleted column
                if (tmpFilter.length > 0) {
                  for (var x = 0; x < tmpFilter.length; x++) {
                    if (tmpFilter[x].Column === tmpSchemaEntry.Column) {
                      tmpHasDeletedParameter = true;
                      break;
                    }
                  }
                }
                if (!tmpHasDeletedParameter) {
                  //if not, we need to add it
                  tmpFilter.push({
                    Column: tmpTableName + '.' + tmpSchemaEntry.Column,
                    Operator: '=',
                    Value: 0,
                    Connector: 'AND',
                    Parameter: 'Deleted'
                  });
                }
                break;
              }
            }
          }
          if (tmpFilter.length < 1) {
            return '';
          }
          var tmpWhere = ' WHERE';

          // This is used to disable the connectors for subsequent queries.
          // Only the open parenthesis operator uses this, currently.
          var tmpLastOperatorNoConnector = false;
          for (var i = 0; i < tmpFilter.length; i++) {
            if (tmpFilter[i].Connector != 'NONE' && tmpFilter[i].Operator != ')' && tmpWhere != ' WHERE' && tmpLastOperatorNoConnector == false) {
              tmpWhere += ' ' + tmpFilter[i].Connector;
            }
            tmpLastOperatorNoConnector = false;
            var tmpColumnParameter;
            if (tmpFilter[i].Operator === '(') {
              // Open a logical grouping
              tmpWhere += ' (';
              tmpLastOperatorNoConnector = true;
            } else if (tmpFilter[i].Operator === ')') {
              // Close a logical grouping
              tmpWhere += ' )';
            } else if (tmpFilter[i].Operator === 'IN' || tmpFilter[i].Operator === "NOT IN") {
              tmpColumnParameter = tmpFilter[i].Parameter + '_w' + i;
              // Add the column name, operator and parameter name to the list of where value parenthetical
              tmpWhere += ' ' + tmpFilter[i].Column + ' ' + tmpFilter[i].Operator + ' ( :' + tmpColumnParameter + ' )';
              pParameters.query.parameters[tmpColumnParameter] = tmpFilter[i].Value;
            } else if (tmpFilter[i].Operator === 'IS NULL') {
              // IS NULL is a special operator which doesn't require a value, or parameter
              tmpWhere += ' ' + tmpFilter[i].Column + ' ' + tmpFilter[i].Operator;
            } else if (tmpFilter[i].Operator === 'IS NOT NULL') {
              // IS NOT NULL is a special operator which doesn't require a value, or parameter
              tmpWhere += ' ' + tmpFilter[i].Column + ' ' + tmpFilter[i].Operator;
            } else {
              tmpColumnParameter = tmpFilter[i].Parameter + '_w' + i;
              // Add the column name, operator and parameter name to the list of where value parenthetical
              tmpWhere += ' ' + tmpFilter[i].Column + ' ' + tmpFilter[i].Operator + ' :' + tmpColumnParameter;
              pParameters.query.parameters[tmpColumnParameter] = tmpFilter[i].Value;
            }
          }
          return tmpWhere;
        };

        /**
        * Generate an ORDER BY clause from the sort array
        *
        * Each entry in the sort is an object like:
        * {Column:'Color',Direction:'Descending'}
        *
        * @method: generateOrderBy
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the field list clause
        */
        var generateOrderBy = function (pParameters) {
          var tmpOrderBy = pParameters.sort;
          if (!Array.isArray(tmpOrderBy) || tmpOrderBy.length < 1) {
            return '';
          }
          var tmpOrderClause = ' ORDER BY';
          for (var i = 0; i < tmpOrderBy.length; i++) {
            if (i > 0) {
              tmpOrderClause += ',';
            }
            tmpOrderClause += ' ' + tmpOrderBy[i].Column;
            if (tmpOrderBy[i].Direction == 'Descending') {
              tmpOrderClause += ' DESC';
            }
          }
          return tmpOrderClause;
        };

        /**
        * Generate the limit clause
        *
        * @method: generateLimit
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateLimit = function (pParameters) {
          if (!pParameters.cap) {
            return '';
          }
          var tmpLimit = ' LIMIT';
          // If there is a begin record, we'll pass that in as well.
          if (pParameters.begin !== false) {
            tmpLimit += ' ' + pParameters.begin + ',';
          }
          // Cap is required for a limit clause.
          tmpLimit += ' ' + pParameters.cap;
          return tmpLimit;
        };

        /**
        * Generate the join clause
        *
        * @method: generateJoins
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the join clause
        */
        var generateJoins = function (pParameters) {
          var tmpJoins = pParameters.join;
          if (!Array.isArray(tmpJoins) || tmpJoins.length < 1) {
            return '';
          }
          var tmpJoinClause = ''; //ex. ' INNER JOIN';
          for (var i = 0; i < tmpJoins.length; i++) {
            var join = tmpJoins[i];
            //verify that all required fields are valid
            if (join.Type && join.Table && join.From && join.To) {
              tmpJoinClause += ` ${join.Type} ${join.Table} ON ${join.From} = ${join.To}`;
            }
          }
          return tmpJoinClause;
        };

        /**
        * Generate the update SET clause
        *
        * @method: generateUpdateSetters
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateUpdateSetters = function (pParameters) {
          var tmpRecords = pParameters.query.records;
          // We need to tell the query not to generate improperly if there are no values to set.
          if (!Array.isArray(tmpRecords) || tmpRecords.length < 1) {
            return false;
          }

          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpUpdate = '';
          // If there is more than one record in records, we are going to ignore them for now.
          var tmpCurrentColumn = 0;
          for (var tmpColumn in tmpRecords[0]) {
            // No hash table yet, so, we will just linear search it for now.
            // This uses the schema to decide if we want to treat a column differently on insert
            var tmpSchemaEntry = {
              Column: tmpColumn,
              Type: 'Default'
            };
            for (var i = 0; i < tmpSchema.length; i++) {
              if (tmpColumn == tmpSchema[i].Column) {
                // There is a schema entry for it.  Process it accordingly.
                tmpSchemaEntry = tmpSchema[i];
                break;
              }
            }
            if (pParameters.query.disableAutoDateStamp && tmpSchemaEntry.Type === 'UpdateDate') {
              // This is ignored if flag is set
              continue;
            }
            if (pParameters.query.disableAutoUserStamp && tmpSchemaEntry.Type === 'UpdateIDUser') {
              // This is ignored if flag is set
              continue;
            }
            switch (tmpSchemaEntry.Type) {
              case 'AutoIdentity':
              case 'CreateDate':
              case 'CreateIDUser':
              case 'DeleteDate':
              case 'DeleteIDUser':
                // These are all ignored on update
                continue;
            }
            if (tmpCurrentColumn > 0) {
              tmpUpdate += ',';
            }
            switch (tmpSchemaEntry.Type) {
              case 'UpdateDate':
                // This is an autoidentity, so we don't parameterize it and just pass in NULL
                tmpUpdate += ' ' + tmpColumn + ' = ' + SQL_NOW;
                break;
              case 'UpdateIDUser':
                // This is the user ID, which we hope is in the query.
                // This is how to deal with a normal column
                var tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
                tmpUpdate += ' ' + tmpColumn + ' = :' + tmpColumnParameter;
                // Set the query parameter
                pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                break;
              default:
                var tmpColumnDefaultParameter = tmpColumn + '_' + tmpCurrentColumn;
                tmpUpdate += ' ' + tmpColumn + ' = :' + tmpColumnDefaultParameter;

                // Set the query parameter
                pParameters.query.parameters[tmpColumnDefaultParameter] = tmpRecords[0][tmpColumn];
                break;
            }

            // We use a number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (tmpUpdate === '') {
            return false;
          }
          return tmpUpdate;
        };

        /**
        * Generate the update-delete SET clause
        *
        * @method: generateUpdateDeleteSetters
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateUpdateDeleteSetters = function (pParameters) {
          if (pParameters.query.disableDeleteTracking) {
            //Don't generate an UPDATE query if Delete tracking is disabled
            return false;
          }
          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCurrentColumn = 0;
          var tmpHasDeletedField = false;
          var tmpUpdate = '';
          // No hash table yet, so, we will just linear search it for now.
          // This uses the schema to decide if we want to treat a column differently on insert
          var tmpSchemaEntry = {
            Type: 'Default'
          };
          for (var i = 0; i < tmpSchema.length; i++) {
            // There is a schema entry for it.  Process it accordingly.
            tmpSchemaEntry = tmpSchema[i];
            var tmpUpdateSql = null;
            switch (tmpSchemaEntry.Type) {
              case 'Deleted':
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = 1';
                tmpHasDeletedField = true; //this field is required in order for query to be built
                break;
              case 'DeleteDate':
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = ' + SQL_NOW;
                break;
              case 'UpdateDate':
                // Delete operation is an Update, so we should stamp the update time
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = ' + SQL_NOW;
                break;
              case 'DeleteIDUser':
                // This is the user ID, which we hope is in the query.
                // This is how to deal with a normal column
                var tmpColumnParameter = tmpSchemaEntry.Column + '_' + tmpCurrentColumn;
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = :' + tmpColumnParameter;
                // Set the query parameter
                pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                break;
              default:
                //DON'T allow update of other fields in this query
                continue;
            }
            if (tmpCurrentColumn > 0) {
              tmpUpdate += ',';
            }
            tmpUpdate += tmpUpdateSql;

            // We use a number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (!tmpHasDeletedField || tmpUpdate === '') {
            return false;
          }
          return tmpUpdate;
        };

        /**
        * Generate the update-undelete SET clause
        *
        * @method: generateUpdateUndeleteSetters
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateUpdateUndeleteSetters = function (pParameters) {
          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCurrentColumn = 0;
          var tmpHasDeletedField = false;
          var tmpUpdate = '';
          // No hash table yet, so, we will just linear search it for now.
          // This uses the schema to decide if we want to treat a column differently on insert
          var tmpSchemaEntry = {
            Type: 'Default'
          };
          for (var i = 0; i < tmpSchema.length; i++) {
            // There is a schema entry for it.  Process it accordingly.
            tmpSchemaEntry = tmpSchema[i];
            var tmpUpdateSql = null;
            switch (tmpSchemaEntry.Type) {
              case 'Deleted':
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = 0';
                tmpHasDeletedField = true; //this field is required in order for query to be built
                break;
              case 'UpdateDate':
                // The undelete operation is an Update, so we should stamp the update time
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = ' + SQL_NOW;
                break;
              case 'UpdateIDUser':
                var tmpColumnParameter = tmpSchemaEntry.Column + '_' + tmpCurrentColumn;
                tmpUpdateSql = ' ' + tmpSchemaEntry.Column + ' = :' + tmpColumnParameter;
                pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                break;
              default:
                //DON'T allow update of other fields in this query
                continue;
            }
            if (tmpCurrentColumn > 0) {
              tmpUpdate += ',';
            }
            tmpUpdate += tmpUpdateSql;

            // We use a number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (!tmpHasDeletedField || tmpUpdate === '') {
            return false;
          }
          return tmpUpdate;
        };

        /**
        * Generate the create SET clause
        *
        * @method: generateCreateSetList
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateCreateSetValues = function (pParameters) {
          var tmpRecords = pParameters.query.records;
          // We need to tell the query not to generate improperly if there are no values to set.
          if (!Array.isArray(tmpRecords) || tmpRecords.length < 1) {
            return false;
          }

          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCreateSet = '';
          // If there is more than one record in records, we are going to ignore them for now.
          var tmpCurrentColumn = 0;
          for (var tmpColumn in tmpRecords[0]) {
            // No hash table yet, so, we will just linear search it for now.
            // This uses the schema to decide if we want to treat a column differently on insert
            var tmpSchemaEntry = {
              Column: tmpColumn,
              Type: 'Default'
            };
            for (var i = 0; i < tmpSchema.length; i++) {
              if (tmpColumn == tmpSchema[i].Column) {
                // There is a schema entry for it.  Process it accordingly.
                tmpSchemaEntry = tmpSchema[i];
                break;
              }
            }
            if (!pParameters.query.disableDeleteTracking) {
              if (tmpSchemaEntry.Type === 'DeleteDate' || tmpSchemaEntry.Type === 'DeleteIDUser') {
                // These are all ignored on insert (if delete tracking is enabled as normal)
                continue;
              }
            }
            if (tmpCurrentColumn > 0) {
              tmpCreateSet += ',';
            }

            //define a re-usable method for setting up field definitions in a default pattern
            var buildDefaultDefinition = function () {
              var tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
              tmpCreateSet += ' :' + tmpColumnParameter;
              // Set the query parameter
              pParameters.query.parameters[tmpColumnParameter] = tmpRecords[0][tmpColumn];
            };
            var tmpColumnParameter;
            switch (tmpSchemaEntry.Type) {
              case 'AutoIdentity':
                if (pParameters.query.disableAutoIdentity) {
                  buildDefaultDefinition();
                } else {
                  // This is an autoidentity, so we don't parameterize it and just pass in NULL
                  tmpCreateSet += ' NULL';
                }
                break;
              case 'AutoGUID':
                if (pParameters.query.disableAutoIdentity) {
                  buildDefaultDefinition();
                } else if (tmpRecords[0][tmpColumn] && tmpRecords[0][tmpColumn].length >= 5 && tmpRecords[0][tmpColumn] !== '0x0000000000000000')
                  //stricture default
                  {
                    // Allow consumer to override AutoGUID
                    buildDefaultDefinition();
                  } else {
                  // This is an autoidentity, so we don't parameterize it and just pass in NULL
                  tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
                  tmpCreateSet += ' :' + tmpColumnParameter;
                  // Set the query parameter
                  pParameters.query.parameters[tmpColumnParameter] = pParameters.query.UUID;
                }
                break;
              case 'UpdateDate':
              case 'CreateDate':
              case 'DeleteDate':
                if (pParameters.query.disableAutoDateStamp) {
                  buildDefaultDefinition();
                } else {
                  // This is an autoidentity, so we don't parameterize it and just pass in NULL
                  tmpCreateSet += ' ' + SQL_NOW;
                }
                break;
              case 'DeleteIDUser':
              case 'UpdateIDUser':
              case 'CreateIDUser':
                if (pParameters.query.disableAutoUserStamp) {
                  buildDefaultDefinition();
                } else {
                  // This is the user ID, which we hope is in the query.
                  // This is how to deal with a normal column
                  tmpColumnParameter = tmpColumn + '_' + tmpCurrentColumn;
                  tmpCreateSet += ' :' + tmpColumnParameter;
                  // Set the query parameter
                  pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
                }
                break;
              default:
                buildDefaultDefinition();
                break;
            }

            // We use an appended number to make sure parameters are unique.
            tmpCurrentColumn++;
          }

          // We need to tell the query not to generate improperly if there are no values set.
          if (tmpCreateSet === '') {
            return false;
          }
          return tmpCreateSet;
        };

        /**
        * Generate the create SET clause
        *
        * @method: generateCreateSetList
        * @param: {Object} pParameters SQL Query Parameters
        * @return: {String} Returns the table name clause
        */
        var generateCreateSetList = function (pParameters) {
          // The records were already validated by generateCreateSetValues
          var tmpRecords = pParameters.query.records;

          // Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
          var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];
          var tmpCreateSet = '';
          // If there is more than one record in records, we are going to ignore them for now.
          for (var tmpColumn in tmpRecords[0]) {
            // No hash table yet, so, we will just linear search it for now.
            // This uses the schema to decide if we want to treat a column differently on insert
            var tmpSchemaEntry = {
              Column: tmpColumn,
              Type: 'Default'
            };
            for (var i = 0; i < tmpSchema.length; i++) {
              if (tmpColumn == tmpSchema[i].Column) {
                // There is a schema entry for it.  Process it accordingly.
                tmpSchemaEntry = tmpSchema[i];
                break;
              }
            }
            if (!pParameters.query.disableDeleteTracking) {
              if (tmpSchemaEntry.Type === 'DeleteDate' || tmpSchemaEntry.Type === 'DeleteIDUser') {
                // These are all ignored on insert (if delete tracking is enabled as normal)
                continue;
              }
            }
            switch (tmpSchemaEntry.Type) {
              default:
                if (tmpCreateSet != '') {
                  tmpCreateSet += ',';
                }
                tmpCreateSet += ' ' + tmpColumn;
                break;
            }
          }
          return tmpCreateSet;
        };
        var Create = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpCreateSetList = generateCreateSetList(pParameters);
          var tmpCreateSetValues = generateCreateSetValues(pParameters);
          if (!tmpCreateSetValues) {
            return false;
          }
          return 'INSERT INTO' + tmpTableName + ' (' + tmpCreateSetList + ') VALUES (' + tmpCreateSetValues + ');';
        };

        /**
        * Read one or many records
        *
        * Some examples:
        * SELECT * FROM WIDGETS;
        * SELECT * FROM WIDGETS LIMIT 0, 20;
        * SELECT * FROM WIDGETS LIMIT 5, 20;
        * SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20;
        * SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20 WHERE LastName = 'Smith';
        *
        * @method Read
        * @param {Object} pParameters SQL Query parameters
        * @return {String} Returns the current Query for chaining.
        */
        var Read = function (pParameters) {
          var tmpFieldList = generateFieldList(pParameters);
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpJoin = generateJoins(pParameters);
          var tmpOrderBy = generateOrderBy(pParameters);
          var tmpLimit = generateLimit(pParameters);
          const tmpOptDistinct = pParameters.distinct ? ' DISTINCT' : '';
          if (pParameters.queryOverride) {
            try {
              var tmpQueryTemplate = _Fable.Utility.template(pParameters.queryOverride);
              return tmpQueryTemplate({
                FieldList: tmpFieldList,
                TableName: tmpTableName,
                Where: tmpWhere,
                Join: tmpJoin,
                OrderBy: tmpOrderBy,
                Limit: tmpLimit,
                Distinct: tmpOptDistinct,
                _Params: pParameters
              });
            } catch (pError) {
              // This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
              console.log('Error with custom Read Query [' + pParameters.queryOverride + ']: ' + pError);
              return false;
            }
          }
          return `SELECT${tmpOptDistinct}${tmpFieldList} FROM${tmpTableName}${tmpJoin}${tmpWhere}${tmpOrderBy}${tmpLimit};`;
        };
        var Update = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpUpdateSetters = generateUpdateSetters(pParameters);
          if (!tmpUpdateSetters) {
            return false;
          }
          return 'UPDATE' + tmpTableName + ' SET' + tmpUpdateSetters + tmpWhere + ';';
        };
        var Delete = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          var tmpWhere = generateWhere(pParameters);
          var tmpUpdateDeleteSetters = generateUpdateDeleteSetters(pParameters);
          if (tmpUpdateDeleteSetters) {
            //If it has a deleted bit, update it instead of actually deleting the record
            return 'UPDATE' + tmpTableName + ' SET' + tmpUpdateDeleteSetters + tmpWhere + ';';
          } else {
            return 'DELETE FROM' + tmpTableName + tmpWhere + ';';
          }
        };
        var Undelete = function (pParameters) {
          var tmpTableName = generateTableName(pParameters);
          // TODO: Fix these
          let tmpDeleteTrackingState = pParameters.query.disableDeleteTracking;
          pParameters.query.disableDeleteTracking = true;
          var tmpWhere = generateWhere(pParameters);
          var tmpUpdateUndeleteSetters = generateUpdateUndeleteSetters(pParameters);
          pParameters.query.disableDeleteTracking = tmpDeleteTrackingState;
          if (tmpUpdateUndeleteSetters) {
            //If the table has a deleted bit, go forward with the update to change things.
            return 'UPDATE' + tmpTableName + ' SET' + tmpUpdateUndeleteSetters + tmpWhere + ';';
          } else {
            // This is a no-op because the record can't be undeleted.
            // TODO: Should it throw instead?
            return 'SELECT NULL;';
          }
        };
        var Count = function (pParameters) {
          var tmpFieldList = pParameters.distinct ? generateFieldList(pParameters, true) : '*';
          var tmpTableName = generateTableName(pParameters);
          var tmpJoin = generateJoins(pParameters);
          var tmpWhere = generateWhere(pParameters);
          // here, we ignore the distinct keyword if no fields have been specified and
          if (pParameters.distinct && tmpFieldList.length < 1) {
            console.warn('Distinct requested but no field list or schema are available, so not honoring distinct for count query.');
          }
          const tmpOptDistinct = pParameters.distinct && tmpFieldList.length > 0 ? 'DISTINCT' : '';
          if (pParameters.queryOverride) {
            try {
              var tmpQueryTemplate = _Fable.Utility.template(pParameters.queryOverride);
              return tmpQueryTemplate({
                FieldList: [],
                TableName: tmpTableName,
                Where: tmpWhere,
                OrderBy: '',
                Limit: '',
                Distinct: tmpOptDistinct,
                _Params: pParameters
              });
            } catch (pError) {
              // This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
              console.log('Error with custom Count Query [' + pParameters.queryOverride + ']: ' + pError);
              return false;
            }
          }
          return `SELECT COUNT(${tmpOptDistinct}${tmpFieldList || '*'}) AS RowCount FROM${tmpTableName}${tmpJoin}${tmpWhere};`;
        };
        var tmpDialect = {
          Create: Create,
          Read: Read,
          Update: Update,
          Delete: Delete,
          Undelete: Undelete,
          Count: Count
        };

        /**
        * Dialect Name
        *
        * @property name
        * @type string
        */
        Object.defineProperty(tmpDialect, 'name', {
          get: function () {
            return 'MySQL';
          },
          enumerable: true
        });
        return tmpDialect;
      };
      module.exports = FoxHoundDialectMySQL;
    }, {}]
  }, {}, [1])(1);
});