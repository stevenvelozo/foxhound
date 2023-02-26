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
var FoxHoundDialectEnglish = function()
{
	var Create = function(pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'Here is a '+tmpScope+'.';
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
	var Read = function(pParameters)
	{
		var tmpScope = pParameters.scope;
		const tmpDistinct = pParameters.distinct ? 'unique ' : '';

		return `Please give me all your ${tmpDistinct}${tmpScope} records.  Thanks.`;
	};

	var Update = function(pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'I am changing your '+tmpScope+'.';
	};

	var Delete = function(pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'I am deleting your '+tmpScope+'.';
	};

	var Undelete = function(pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'I am undeleting your '+tmpScope+'.';
	};

	var Count = function(pParameters)
	{
		var tmpScope = pParameters.scope;
		const tmpDistinct = pParameters.distinct ? 'unique ' : '';

		return `Count your ${tmpDistinct}${tmpScope}.`;
	};

	var tmpDialect = ({
		Create: Create,
		Read: Read,
		Update: Update,
		Delete: Delete,
		Undelete: Undelete,
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
			get: function() { return 'English'; },
			enumerable: true
		});

	return tmpDialect;
};

module.exports = FoxHoundDialectEnglish;
