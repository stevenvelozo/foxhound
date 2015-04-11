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
var FoxHoundDialectMySQL = function()
{
	var Create = function(pParameters)
	{
	};

	/**
	* Read one or many records
	*
	* Some examples:
	* SELECT * FROM WIDGETS;
	* SELECT * FROM WIDGETS LIMIT 0,20;
	* SELECT * FROM WIDGETS LIMIT 5,20;
	* SELECT ID, Name, Cost FROM WIDGETS LIMIT 5,20;
	* SELECT ID, Name, Cost FROM WIDGETS LIMIT 5,20 WHERE LastName = 'Smith';
	*
	* @method Read
	* @param {Number} pLogLevel The log level for our object
	* @return {String} Returns the current Query for chaining.
	*/
	var Read = function(pParameters)
	{
		return 'SELECT * FROM '+pParameters.scope+';';
	};

	var Update = function(pParameters)
	{
	};

	var Delete = function(pParameters)
	{
	};

	var Count = function(pParameters)
	{
	};

	var tmpDialect = ({
		Create: Create,
		Read: Read,
		Update: Update,
		Delete: Delete,
		Count: Count
	});

	/**
	 * Dialect Name
	 *
	 * @property name
	 * @type string
	 */
	Object.defineProperty(tmpDialect, 'name',
		{
			get: function() { return 'MySQL'; },
			enumerable: true
		});

	return tmpDialect;
};

module.exports = new FoxHoundDialectMySQL();