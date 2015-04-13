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
	/**
	 * Generate a table name from the scope
	 *
	 * @method: generateTableName
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the table name clause
	 */
	var generateTableName = function(pParameters)
	{
		return ' `'+pParameters.scope+'`';
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
	var generateFieldList = function(pParameters)
	{
		var tmpDataElements = pParameters.dataElements;
		if (!Array.isArray(tmpDataElements) || tmpDataElements.length < 1)
		{
			return ' *';
		}

		var tmpFieldList = ' ';
		for (var i = 0; i < tmpDataElements.length; i++)
		{
			if (i > 0)
			{
				tmpFieldList += ', ';
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
	var generateWhere = function(pParameters)
	{
		var tmpFilter = pParameters.filter;
		if (!tmpFilter || tmpFilter.length < 1)
		{
			return '';
		}

		var tmpWhere = ' WHERE';

		// This is used to disable the connectors for subsequent queries.
		// Only the open parenthesis operator uses this, currently.
		var tmpLastOperatorNoConnector = false;

		for (var i = 0; i < tmpFilter.length; i++)
		{
			if ((tmpFilter[i].Connector != 'NONE') && (tmpFilter[i].Operator != ')') && (tmpWhere != ' WHERE') && (tmpLastOperatorNoConnector == false))
			{
				tmpWhere += ' '+tmpFilter[i].Connector;
			}

			tmpLastOperatorNoConnector = false;

			if (tmpFilter[i].Operator == '(')
			{
				// Open a logical grouping
				tmpWhere += ' (';
				tmpLastOperatorNoConnector = true;
			}
			else if (tmpFilter[i].Operator == ')')
			{
				// Close a logical grouping
				tmpWhere += ' )';
			}
			else if (tmpFilter[i].Operator == 'IN')
			{
				var tmpColumnParameter = tmpFilter[i].Parameter+'_w'+i;
				// Add the column name, operator and parameter name to the list of where value parenthetical
				tmpWhere += ' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator+' ( :'+tmpColumnParameter+' )';
				pParameters.query.parameters[tmpColumnParameter] = tmpFilter[i].Value;
			}
			else if (tmpFilter[i].Operator == 'IS NOT NULL')
			{
				// IS NOT NULL is a special operator which doesn't require a value, or parameter
				tmpWhere += ' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator;
			}
			else
			{
				var tmpColumnParameter = tmpFilter[i].Parameter+'_w'+i;
				// Add the column name, operator and parameter name to the list of where value parenthetical
				tmpWhere += ' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator+' :'+tmpColumnParameter;
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
	var generateOrderBy = function(pParameters)
	{
		var tmpOrderBy = pParameters.sort;
		if (!Array.isArray(tmpOrderBy) || tmpOrderBy.length < 1)
		{
			return '';
		}

		var tmpOrderClause = ' ORDER BY';
		for (var i = 0; i < tmpOrderBy.length; i++)
		{
			if (i > 0)
			{
				tmpOrderClause += ',';
			}
			tmpOrderClause += ' '+tmpOrderBy[i].Column;

			if (tmpOrderBy[i].Direction == 'Descending')
			{
				tmpOrderClause += ' DESC'
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
	var generateLimit = function(pParameters)
	{
		if (!pParameters.cap)
		{
			return '';
		}

		var tmpLimit = ' LIMIT';
		// If there is a begin record, we'll pass that in as well.
		if (pParameters.begin !== false)
		{
			tmpLimit += ' ' + pParameters.begin + ',';
		}
		// Cap is required for a limit clause.
		tmpLimit += ' ' + pParameters.cap;

		return tmpLimit;
	};

	/**
	 * Generate the update SET clause
	 *
	 * @method: generateUpdateSetters
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the table name clause
	 */
	var generateUpdateSetters = function(pParameters)
	{
		var tmpRecords = pParameters.query.records;
		// We need to tell the query not to generate improperly if there are no values to set.
		if (!Array.isArray(tmpRecords) || tmpRecords.length < 1)
		{
			return false;
		}

		// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
		var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];

		var tmpUpdate = '';
		// If there is more than one record in records, we are going to ignore them for now.
		var tmpCurrentColumn = 0;
		for(var tmpColumn in tmpRecords[0])
		{
			// No hash table yet, so, we will just linear search it for now.
			// This uses the schema to decide if we want to treat a column differently on insert
			var tmpSchemaEntry = {Column:tmpColumn, Type:'Default'};
			for (var i = 0; i < tmpSchema.length; i++)
			{
				if (tmpColumn == tmpSchema[i].Column)
				{
					// There is a schema entry for it.  Process it accordingly.
					tmpSchemaEntry = tmpSchema[i];
					break;
				}
			}

			switch (tmpSchemaEntry.Type)
			{
				case 'AutoIdentity':
				case 'CreateDate':
				case 'CreateIDUser':
				case 'DeleteDate':
				case 'DeleteIDUser':
					// These are all ignored on update
					continue;
					break;				
			}
			if (tmpCurrentColumn > 0)
			{
				tmpUpdate += ',';
			}
			switch (tmpSchemaEntry.Type)
			{
				case 'UpdateDate':
					// This is an autoidentity, so we don't parameterize it and just pass in NULL
					tmpUpdate += ' '+tmpColumn+' = NOW()';
					break;
				case 'UpdateIDUser':
					// This is the user ID, which we hope is in the query.
					// This is how to deal with a normal column
					var tmpColumnParameter = tmpColumn+'_'+tmpCurrentColumn;
					tmpUpdate += ' '+tmpColumn+' = :'+tmpColumnParameter;
					// Set the query parameter
					pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
					break;
				default:
					var tmpColumnParameter = tmpColumn+'_'+tmpCurrentColumn;
					tmpUpdate += ' '+tmpColumn+' = :'+tmpColumnParameter;

					// Set the query parameter
					pParameters.query.parameters[tmpColumnParameter] = tmpRecords[0][tmpColumn];
					break;
			}

			// We use a number to make sure parameters are unique.
			tmpCurrentColumn++;
		}

		// We need to tell the query not to generate improperly if there are no values set.
		if (tmpUpdate === '')
		{
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
	var generateCreateSetValues = function(pParameters)
	{
		var tmpRecords = pParameters.query.records;
		// We need to tell the query not to generate improperly if there are no values to set.
		if (!Array.isArray(tmpRecords) || tmpRecords.length < 1)
		{
			return false;
		}

		// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
		var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];


		var tmpCreateSet = '';
		// If there is more than one record in records, we are going to ignore them for now.
		var tmpCurrentColumn = 0;
		for(var tmpColumn in tmpRecords[0])
		{
			// No hash table yet, so, we will just linear search it for now.
			// This uses the schema to decide if we want to treat a column differently on insert
			var tmpSchemaEntry = {Column:tmpColumn, Type:'Default'};
			for (var i = 0; i < tmpSchema.length; i++)
			{
				if (tmpColumn == tmpSchema[i].Column)
				{
					// There is a schema entry for it.  Process it accordingly.
					tmpSchemaEntry = tmpSchema[i];
					break;
				}
			}

			switch (tmpSchemaEntry.Type)
			{
				case 'DeleteDate':
				case 'DeleteIDUser':
					// These are all ignored on insert
					continue;
					break;				
			}
			if (tmpCurrentColumn > 0)
			{
				tmpCreateSet += ',';
			}
			switch (tmpSchemaEntry.Type)
			{
				case 'AutoIdentity':
					// This is an autoidentity, so we don't parameterize it and just pass in NULL
					tmpCreateSet += ' NULL';
					break;
				case 'AutoGUID':
					// This is an autoidentity, so we don't parameterize it and just pass in NULL
					var tmpColumnParameter = tmpColumn+'_'+tmpCurrentColumn;
					tmpCreateSet += ' :'+tmpColumnParameter;
					// Set the query parameter
					pParameters.query.parameters[tmpColumnParameter] = pParameters.query.UUID;
					break;
				case 'UpdateDate':
				case 'CreateDate':
					// This is an autoidentity, so we don't parameterize it and just pass in NULL
					tmpCreateSet += ' NOW()';
					break;
				case 'UpdateIDUser':
				case 'CreateIDUser':
					// This is the user ID, which we hope is in the query.
					// This is how to deal with a normal column
					var tmpColumnParameter = tmpColumn+'_'+tmpCurrentColumn;
					tmpCreateSet += ' :'+tmpColumnParameter;
					// Set the query parameter
					pParameters.query.parameters[tmpColumnParameter] = pParameters.query.IDUser;
					break;
				default:
					var tmpColumnParameter = tmpColumn+'_'+tmpCurrentColumn;
					tmpCreateSet += ' :'+tmpColumnParameter;
					// Set the query parameter
					pParameters.query.parameters[tmpColumnParameter] = tmpRecords[0][tmpColumn];
					break;
			}
			// We use an appended number to make sure parameters are unique.
			tmpCurrentColumn++;
		}

		// We need to tell the query not to generate improperly if there are no values set.
		if (tmpCreateSet === '')
		{
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
	var generateCreateSetList = function(pParameters)
	{
		// The records were already validated by generateCreateSetValues
		var tmpRecords = pParameters.query.records;

		// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
		var tmpSchema = Array.isArray(pParameters.query.schema) ? pParameters.query.schema : [];

		var tmpCreateSet = '';
		// If there is more than one record in records, we are going to ignore them for now.
		for(var tmpColumn in tmpRecords[0])
		{
			// TODO: Validate against pParameters.query.schema
			if (tmpCreateSet != '')
			{
				tmpCreateSet += ',';
			}

			// No hash table yet, so, we will just linear search it for now.
			// This uses the schema to decide if we want to treat a column differently on insert
			var tmpSchemaEntry = {Column:tmpColumn, Type:'Default'};
			for (var i = 0; i < tmpSchema.length; i++)
			{
				if (tmpColumn == tmpSchema[i].Column)
				{
					// There is a schema entry for it.  Process it accordingly.
					tmpSchemaEntry = tmpSchema[i];
					break;
				}
			}
			switch (tmpSchemaEntry.Type)
			{
				case 'UpdateDate':
				case 'UpdateIDUser':
				case 'DeleteDate':
				case 'DeleteIDUser':
					// These are all ignored on insert
					break;
				default:
					tmpCreateSet += ' '+tmpColumn;
					break;
			}
		}

		return tmpCreateSet;
	};


	var Create = function(pParameters)
	{
		var tmpCreateSetValues = generateCreateSetValues(pParameters);

		if (!tmpCreateSetValues)
		{
			return false;
		}

		return 'INSERT INTO'+
					generateTableName(pParameters)+
					' ('+generateCreateSetList(pParameters)+')'+
				' VALUES'+
					' ('+tmpCreateSetValues+')'+
				';';
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
	var Read = function(pParameters)
	{
		return 'SELECT'+
					generateFieldList(pParameters)+
				' FROM'+
					generateTableName(pParameters)+
				generateWhere(pParameters)+
				generateOrderBy(pParameters)+
				generateLimit(pParameters)+
				';';
	};

	var Update = function(pParameters)
	{
		var tmpUpdateSetters = generateUpdateSetters(pParameters);

		if (!tmpUpdateSetters)
		{
			return false;
		}

		// TODO: Potentially throw a huge warning if there is no WHERE
		return 'UPDATE'+
					generateTableName(pParameters)+
				' SET'+
					tmpUpdateSetters+
				generateWhere(pParameters)+
				';';
	};

	var Delete = function(pParameters)
	{
		return 'DELETE FROM'+
					generateTableName(pParameters)+
					generateWhere(pParameters)+
					';';
	};

	var Count = function(pParameters)
	{
		return 'SELECT COUNT(*) AS RowCount FROM'+
					generateTableName(pParameters)+
					generateWhere(pParameters)+
					';';
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
