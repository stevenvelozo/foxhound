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
let baseFoxHoundDialect = require('../../Foxhound-Dialect-Base.js');

class FoxHoundDialectEnglish extends baseFoxHoundDialect
{
	constructor ()
	{
		super();
	}

	/**
	 * Dialect Name
	 *
	 * @method name
	 * @type string
	 */
	get name()
    {
    	return 'English';
    }

	Create (pParameters)
	{
		return `Make your own ${this.scope} records.  Thanks for asking me to, though.`;
	}

	Read (pParameters)
	{
		return `Please give me all your ${this.scope} records.  Thanks.`;
	}

	Update (pParameters)
	{
		return `Changing ${this.scope} records is impossible.  Because change is hard.`;
	}

	Delete(pParameters)
	{
		return `I don't know how to delete ${this.scope} records.  Sorry.`;
	}

	Count(pParameters)
	{
		return `You are going to have to count your ${this.scope} records yourself.  Apologies.`;
	}
}

module.exports = FoxHoundDialectEnglish;
