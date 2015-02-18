/**
* Query Parameters Object
*
* @class FoxHoundQueryParameters
* @constructor
*/
var FoxHoundQueryParameters = (
{
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
});

module.exports = FoxHoundQueryParameters;