/**
* Query Parameters Object
*
* @class FoxHoundQueryParameters
* @constructor
*/
var FoxHoundQueryParameters = (
{
		scope: false,        // STR: The scope of the data
								// TSQL: the "Table" or "View"
								// MongoDB: the "Collection"

		dataElements: false, // ARR of STR: The data elements to return
								// TSQL: the "Columns"
								// MongoDB: the "Fields"

		begin: false,        // INT: Record index to start at
								// TSQL: n in LIMIT 1,n
								// MongoDB: n in Skip(n)

		cap: false,          // INT: Maximum number of records to return
								// TSQL: n in LIMIT n
								// MongoDB: n in limit(n)

		filter: false,       // ARR of OBJ: Data filter expression list
								// TSQL: the WHERE clause
								// MongoDB: a find() expression

		sort: false,         // ARR of OBJ: The sort order
								// TSQL: ORDER BY
								// MongoDB: sort()

		// Force a specific query to run regardless of above ... this is used to override the query generator.
		queryoverride: false,

		// Where the generated query goes
		query: (
			{
				body: false,
				parameters: {}
			}),

		// Where the query results are stuck
		result: (
			{
				executed: false, // True once we've run a query.
				records: false,  // The records to be created or changed
				value: false,    // The mysql return value of the last query run
				error: false     // The error message of the last run query
			})
});

module.exports = FoxHoundQueryParameters;