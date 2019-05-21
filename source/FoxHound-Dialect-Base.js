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
    };

    Create (pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'Here is a '+tmpScope+'.';
	};

	/**
	* Read one or many records
	*
	* @method Read
	* @param {Object} pParameters The query parameters.
	* @return {String} Returns the current Query string.
	*/
	Read (pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'Please give me all your '+tmpScope+' records.  Thanks.';
	};

	Update (pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'I am changing your '+tmpScope+'.';
	};

	Delete (pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'I am deleting your '+tmpScope+'.';
	};

	Count (pParameters)
	{
		var tmpScope = pParameters.scope;

		return 'Count your '+tmpScope+'.';
	};
};

// This is for backwards compatibility
function autoConstruct(pSettings)
{
	return new FoxHoundDialectBase(pSettings);
}

module.exports =  {new:autoConstruct, FoxHoundDialectBase:FoxHoundDialectBase};
