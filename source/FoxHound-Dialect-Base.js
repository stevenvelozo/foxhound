/**
* FoxHound Base Dialect
*
* Base dialect file
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @class FoxHoundDialectBase
*/
class FoxHoundDialectBase
{
    constructor()
    {
    	this.scope = `UnknownRecordType`;
    }

	get name()
    {
    	return 'Unnamed Dialect';
    }

    Create (pParameters)
	{
		return `Create behavior not overloaded for dialect ${this.name} scope ${this.scope}.`;
	}

	Read (pParameters)
	{
		return `Read behavior not overloaded for dialect ${this.name} scope ${this.scope}.`;
	}

	Update (pParameters)
	{
		var tmpScope = pParameters.scope;

		return ``;
	}

	Delete (pParameters)
	{
		return `Delete behavior not overloaded for dialect ${this.name} scope ${this.scope}.`;
	}

	Count (pParameters)
	{
		return `Count behavior not overloaded for dialect ${this.name} scope ${this.scope}.`;
	}
}

// This is for backwards compatibility
function autoConstruct(pSettings)
{
	return new FoxHoundDialectBase(pSettings);
}

module.exports = FoxHoundDialectBase;
