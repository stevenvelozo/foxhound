/**
* FoxHound MySQL Dialect
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
		var tmpScope = pParameters.scope;

		return 'SELECT * FROM '+tmpScope+';';
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