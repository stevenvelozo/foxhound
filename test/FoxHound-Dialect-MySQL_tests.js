/**
* Unit tests for FoxHound
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require('chai');
var Expect = Chai.expect;
var Assert = Chai.assert;

var libFable = require('fable').new({});
var libFoxHound = require('../source/FoxHound.js');

var _AnimalSchema = (
[
	{ Column: "IDAnimal",        Type:"AutoIdentity" },
	{ Column: "GUIDAnimal",      Type:"AutoGUID" },
	{ Column: "CreateDate",      Type:"CreateDate" },
	{ Column: "CreatingIDUser",  Type:"CreateIDUser" },
	{ Column: "UpdateDate",        Type:"UpdateDate" },
	{ Column: "UpdatingIDUser", Type:"UpdateIDUser" },
	{ Column: "Deleted",         Type:"Deleted" },
	{ Column: "DeletingIDUser",  Type:"DeleteIDUser" },
	{ Column: "DeleteDate",      Type:"DeleteDate" }
]);

var _AnimalSchemaWithoutDeleted = (
[
	{ Column: "IDAnimal",        Type:"AutoIdentity" },
	{ Column: "GUIDAnimal",      Type:"AutoGUID" },
	{ Column: "CreateDate",      Type:"CreateDate" },
	{ Column: "CreatingIDUser",  Type:"CreateIDUser" },
	{ Column: "UpdateDate",        Type:"UpdateDate" },
	{ Column: "UpdatingIDUser", Type:"UpdateIDUser" }
]);

suite
(
	'FoxHound-Dialect-MySQL',
	function()
	{
		setup
		(
			function()
			{
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'initialize should build a happy little object',
					function()
					{
						var testFoxHound = libFoxHound.new(libFable).setDialect('MySQL');
						Expect(testFoxHound.dialect.name)
							.to.equal('MySQL');
						Expect(testFoxHound)
							.to.be.an('object', 'FoxHound with MySQL should initialize as an object directly from the require statement.');
					}
				);
			}
		);

		suite
		(
			'Basic Query Generation',
			function()
			{
				test
				(
					'Create Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setLogLevel(5)
							.setDialect('MySQL')
							.setScope('Animal')
							.addRecord({IDAnimal:null, Name:'Foo Foo', Age:15});
						// Build the query
						tmpQuery.buildCreateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Create Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal("INSERT INTO `Animal` ( IDAnimal, Name, Age) VALUES ( :IDAnimal_0, :Name_1, :Age_2);");
					}
				);
				test
				(
					'Bad Create Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL');
						// Build the query
						tmpQuery.buildCreateQuery();
						tmpQuery.addRecord({});
						tmpQuery.buildCreateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Create Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal(false);
					}
				);
				test
				(
					'Read Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL').setScope('Animal');
						tmpQuery.addSort({Column:'Cost',Direction:'Descending'});
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Simple Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Animal`.* FROM `Animal` ORDER BY Cost DESC;');
					}
				);
				test
				(
					'Read Query with Distinct',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL').setScope('Animal');
						tmpQuery.addSort({Column:'Cost',Direction:'Descending'})
							.setDistinct(true);
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Simple Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT DISTINCT `Animal`.* FROM `Animal` ORDER BY Cost DESC;');
					}
				);
				test
				(
					'Complex Read Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setSort([{Column:'Age',Direction:'Ascending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.addSort('Cost');
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Name`, `Age`, `Cost` FROM `Animal` WHERE Age = :Age_w0 ORDER BY Age, Cost LIMIT 0, 10;');
					}
				);
				test
				(
					'Complex Read Query with qualified and unqualified "SELECT *" cases',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['*', 'Name', 'Age', 'Cost', 'Animal.*'])
							.setSort([{Column:'Age',Direction:'Ascending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.addSort('Cost');
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT *, `Name`, `Age`, `Cost`, `Animal`.* FROM `Animal` WHERE Age = :Age_w0 ORDER BY Age, Cost LIMIT 0, 10;');
					}
				);
				test
				(
					'Complex Read Query 2',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDataElements(['Name', 'Age', 'Cost'])
							.setCap(100)
							.addFilter('Age', '25')
							.addFilter('', '', '(')
							.addFilter('Color', 'Red')
							.addFilter('Color', 'Green', '=', 'OR')
							.addFilter('', '', ')')
							.addFilter('Description', '', 'IS NOT NULL')
							.addFilter('IDOffice', [10, 11, 15, 18, 22], 'IN');
						tmpQuery.setLogLevel(3).addSort('Age');
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Name`, `Age`, `Cost` FROM `Animal` WHERE Age = :Age_w0 AND ( Color = :Color_w2 OR Color = :Color_w3 ) AND Description IS NOT NULL AND IDOffice IN ( :IDOffice_w6 ) ORDER BY Age LIMIT 100;');
					}
				);
				test
				(
					'Custom Read Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setSort([{Column:'Age',Direction:'Ascending'},{Column:'Cost',Direction:'Descending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.parameters.queryOverride = 'SELECT Name, Age * 5, Cost FROM <%= TableName %> <%= Where %> <%= Limit %>;';
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Custom Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT Name, Age * 5, Cost FROM  `Animal`  WHERE Age = :Age_w0  LIMIT 0, 10;');
					}
				);
				test
				(
					'Custom Read Query with Custom Parameters',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setSort([{Column:'Age',Direction:'Ascending'},{Column:'Cost',Direction:'Descending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.parameters.CustomFields = 'Name, Age * 5, Cost';
						tmpQuery.parameters.queryOverride = 'SELECT <%= _Params.CustomFields %> FROM <%= TableName %> <%= Where %> <%= Limit %>;';
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Custom Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT Name, Age * 5, Cost FROM  `Animal`  WHERE Age = :Age_w0  LIMIT 0, 10;');
					}
				);
				test
				(
					'Bad Custom Read Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setSort([{Column:'Age',Direction:'Ascending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.parameters.queryOverride = 'SELECT Name, Age * 5, Cost FROM <%= TableName  <%= Where %> <%= Limit ;';
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Custom Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal(false);
					}
				);
				test
				(
					'Bad Custom Count Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.parameters.queryOverride = 'SELECT COUNT(*) AS RowCount FROM <%= TableName  <%= TableName %> <%= Where;';
						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Custom Count Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal(false);
					}
				);
				test
				(
					'Custom Count Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.parameters.queryOverride = 'SELECT COUNT(*) AS RowCount FROM <%= TableName %> <%= Where %>;';
						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Custom Count Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT COUNT(*) AS RowCount FROM  `Animal`  WHERE Age = :Age_w0;');
					}
				);
				test
				(
					'Custom Count Query with Custom Parameters',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'});
						tmpQuery.parameters.CountAlias = 'RowCount';
						tmpQuery.parameters.queryOverride = 'SELECT COUNT(*) AS <%= _Params.CountAlias %> FROM <%= TableName %> <%= Where %>;';
						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Custom Count Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT COUNT(*) AS RowCount FROM  `Animal`  WHERE Age = :Age_w0;');
					}
				);
				test
				(
					'Update Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.addFilter('IDAnimal', 9)
							.addRecord({Age:15,Color:'Brown'});

						// Build the query
						tmpQuery.buildUpdateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Update Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET Age = :Age_0, Color = :Color_1 WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Bad Update Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL');

						// Build the query
						tmpQuery.buildUpdateQuery();
						tmpQuery.addRecord({});
						tmpQuery.buildUpdateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Update Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal(false);
					}
				);
				test
				(
					'Delete Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setScope('Animal')
							.addFilter('IDAnimal', 10);

						// Build the query
						tmpQuery.buildDeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Delete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('DELETE FROM `Animal` WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Count Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal');

						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Count Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT COUNT(*) AS RowCount FROM `Animal`;');
					}
				);
				test
				(
					'Count Distinct Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal');
						tmpQuery.setDistinct(true);
						tmpQuery.query.schema = _AnimalSchema;

						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Count Distinct Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT COUNT(DISTINCT `Animal`.`IDAnimal`) AS RowCount FROM `Animal` WHERE  `Animal`.Deleted = :Deleted_w0;');
					}
				);
				test
				(
					'Count Distinct Query without Schema',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal');
						tmpQuery.setDistinct(true);

						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Count Distinct Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT COUNT(*) AS RowCount FROM `Animal`;');
					}
				);
				test
				(
					'Count Distinct Query with Custom Fields',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDataElements(['Name', 'Age', 'Cost']);
						tmpQuery.setDistinct(true);

						// Build the query
						tmpQuery.buildCountQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Count Distinct Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT COUNT(DISTINCT `Name`, `Age`, `Cost`) AS RowCount FROM `Animal`;');
					}
				);
			}
		);

		suite
		(
			'Complex Query Generation - Schemas',
			function()
			{
				test
				(
					'Create Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setLogLevel(5)
							.setDialect('MySQL')
							.setScope('Animal')
							.addRecord(
							{
								IDAnimal:false,
								GUIDAnimal:false,
								CreateDate:false,
								CreatingIDUser:false,
								UpdateDate:false,
								UpdatingIDUser:false,
								Deleted:false,
								DeletingIDUser:false,
								DeleteDate:false,
								Name:'Froo Froo',
								Age:18
							});
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildCreateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Create Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal("INSERT INTO `Animal` ( IDAnimal, GUIDAnimal, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser, Deleted, Name, Age) VALUES ( NULL, :GUIDAnimal_1, NOW(3), :CreatingIDUser_3, NOW(3), :UpdatingIDUser_5, :Deleted_6, :Name_7, :Age_8);");
					}
				);
				test
				(
					'Create Query -- with GUID specified',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setLogLevel(5)
							.setDialect('MySQL')
							.setScope('Animal')
							.addRecord(
							{
								IDAnimal:false,
								GUIDAnimal:'0xabcdef',
								CreateDate:false,
								CreatingIDUser:false,
								UpdateDate:false,
								UpdatingIDUser:false,
								Deleted:false,
								DeletingIDUser:false,
								DeleteDate:false,
								Name:'Froo Froo',
								Age:18
							});
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildCreateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Create Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal("INSERT INTO `Animal` ( IDAnimal, GUIDAnimal, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser, Deleted, Name, Age) VALUES ( NULL, :GUIDAnimal_1, NOW(3), :CreatingIDUser_3, NOW(3), :UpdatingIDUser_5, :Deleted_6, :Name_7, :Age_8);");
					}
				);
				test
				(
					'Create Query - with AutoIdentity disabled',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setLogLevel(5)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDisableAutoIdentity(true)
							.setDisableDeleteTracking(true)
							.setDisableAutoDateStamp(true)
							.setDisableAutoUserStamp(true)
							.addRecord(
							{
								IDAnimal:false,
								GUIDAnimal:false,
								CreateDate:false,
								CreatingIDUser:false,
								UpdateDate:false,
								UpdatingIDUser:false,
								Deleted:false,
								DeletingIDUser:false,
								DeleteDate:false,
								Name:'Froo Froo',
								Age:18
							});
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildCreateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Create Query (AutoIdentity disabled)', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal("INSERT INTO `Animal` ( IDAnimal, GUIDAnimal, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser, Deleted, DeletingIDUser, DeleteDate, Name, Age) VALUES ( :IDAnimal_0, :GUIDAnimal_1, :CreateDate_2, :CreatingIDUser_3, :UpdateDate_4, :UpdatingIDUser_5, :Deleted_6, :DeletingIDUser_7, :DeleteDate_8, :Name_9, :Age_10);");
					}
				);
				test
				(
					'Complex Read Query 2, verify checking Deleted bit with no filters',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDataElements(['Name', 'Age', 'Cost'])
							.setCap(100);

						//Use a schema that already defines a deleted bit
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Name`, `Age`, `Cost` FROM `Animal` WHERE  `Animal`.Deleted = :Deleted_w0 LIMIT 100;');
					}
				);
				test
				(
					'Complex Read Query 2, verify checking Deleted bit with no filters, with Distinct',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDataElements(['Name', 'Age', 'Cost'])
							.setCap(100)
							.setDistinct(true);

						//Use a schema that already defines a deleted bit
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT DISTINCT `Name`, `Age`, `Cost` FROM `Animal` WHERE  `Animal`.Deleted = :Deleted_w0 LIMIT 100;');
					}
				);
				test
				(
					'Complex Read Query 2, manually checking Deleted bit with Schema that has one',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDataElements(['Name', 'Age', 'Cost'])
							.setCap(100)
							.addFilter('Age', '25')
							.addFilter('', '', '(')
							.addFilter('Color', 'Red')
							.addFilter('Color', 'Green', '=', 'OR')
							.addFilter('', '', ')')
							.addFilter('Description', '', 'IS NOT NULL')
							.addFilter('IDOffice', [10, 11, 15, 18, 22], 'IN')
							.addFilter('Deleted', '1');

						//Use a schema that already defines a deleted bit
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Name`, `Age`, `Cost` FROM `Animal` WHERE Age = :Age_w0 AND ( Color = :Color_w2 OR Color = :Color_w3 ) AND Description IS NOT NULL AND IDOffice IN ( :IDOffice_w6 ) AND Deleted = :Deleted_w7 LIMIT 100;');
					}
				);
				test
				(
					'Complex Read Query 2, delete tracking disabled',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setDisableDeleteTracking(true)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setCap(100);

						//Use a schema that already defines a deleted bit
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Name`, `Age`, `Cost` FROM `Animal` LIMIT 100;');
					}
				);
				test
				(
					'Delete Query with Filters',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setScope('Animal')
							.addFilter('IDAnimal', 10);
						//Perform delete with no record specified, but has a Deleted bit in the schema

						//Use a schema that already defines a deleted bit
						tmpQuery.query.schema = _AnimalSchema;

						// Build the query
						tmpQuery.buildDeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Delete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET UpdateDate = NOW(3), Deleted = 1, DeletingIDUser = :DeletingIDUser_2, DeleteDate = NOW(3) WHERE IDAnimal = :IDAnimal_w0 AND  `Animal`.Deleted = :Deleted_w1;');
					}
				);
				test
				(
					'Update Query -- without Deleted',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.addFilter('IDAnimal', 9)
							.addRecord({
								IDAnimal:82,
								GUIDAnimal:'1111-2222-3333-4444-5555-6666-7777',
								CreateDate:false,
								CreatingIDUser:false,
								UpdateDate:false,
								UpdatingIDUser:false,
								Name:'Froo Froo',
								Age:18
							});
						tmpQuery.query.schema = _AnimalSchemaWithoutDeleted;
						// Build the query
						tmpQuery.buildUpdateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Update Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET GUIDAnimal = :GUIDAnimal_0, UpdateDate = NOW(3), UpdatingIDUser = :UpdatingIDUser_2, Name = :Name_3, Age = :Age_4 WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Update Query -- without Deleted, UpdateDate and UpdatingIDUser',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.addFilter('IDAnimal', 9)
							.setDisableAutoUserStamp(true)
							.setDisableAutoDateStamp(true)
							.addRecord({
								IDAnimal:82,
								GUIDAnimal:'1111-2222-3333-4444-5555-6666-7777',
								CreateDate:false,
								CreatingIDUser:false,
								UpdateDate:false,
								UpdatingIDUser:false,
								Name:'Froo Froo',
								Age:18
							});
						tmpQuery.query.schema = _AnimalSchemaWithoutDeleted;
						// Build the query
						tmpQuery.buildUpdateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Update Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET GUIDAnimal = :GUIDAnimal_0, Name = :Name_1, Age = :Age_2 WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Delete Query -- without Deleted',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.addFilter('IDAnimal', 9)
							.addRecord({
								IDAnimal:82,
								GUIDAnimal:'1111-2222-3333-4444-5555-6666-7777'
							});
						tmpQuery.query.schema = _AnimalSchemaWithoutDeleted;
						// Build the query
						tmpQuery.buildDeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Delete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('DELETE FROM `Animal` WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Update Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.addFilter('IDAnimal', 9)
							.addFilter('Deleted', 0) //cover case where this can be overridden instead of automatically added
							.addRecord({
								IDAnimal:82,
								GUIDAnimal:'1111-2222-3333-4444-5555-6666-7777',
								CreateDate:false,
								CreatingIDUser:false,
								UpdateDate:false,
								UpdatingIDUser:false,
								Deleted:false,
								DeletingIDUser:false,
								DeleteDate:false,
								Name:'Froo Froo',
								Age:18
							});
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildUpdateQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Update Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET GUIDAnimal = :GUIDAnimal_0, UpdateDate = NOW(3), UpdatingIDUser = :UpdatingIDUser_2, Deleted = :Deleted_3, Name = :Name_4, Age = :Age_5 WHERE IDAnimal = :IDAnimal_w0 AND Deleted = :Deleted_w1;');
					}
				);
				test
				(
					'Delete Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.addFilter('IDAnimal', 9)
							.addRecord({
								IDAnimal:82,
								GUIDAnimal:'1111-2222-3333-4444-5555-6666-7777'
							});
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query 
						tmpQuery.buildDeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Delete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET UpdateDate = NOW(3), Deleted = 1, DeletingIDUser = :DeletingIDUser_2, DeleteDate = NOW(3) WHERE IDAnimal = :IDAnimal_w0 AND  `Animal`.Deleted = :Deleted_w1;');
					}
				);
				test
				(
					'Delete Query with Delete Tracking Disabled',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setLogLevel(5)
							.setScope('Animal')
							.setDisableDeleteTracking(true)
							.addFilter('IDAnimal', 9)
							.addRecord({
								IDAnimal:82,
								GUIDAnimal:'1111-2222-3333-4444-5555-6666-7777'
							});
						tmpQuery.query.schema = _AnimalSchema;
						// Build the query
						tmpQuery.buildDeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Delete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('DELETE FROM `Animal` WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Undelete Query with Deleted Bit',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setScope('Animal')
							.addFilter('IDAnimal', 10);

						//Use a schema that already defines a deleted bit
						tmpQuery.query.schema = _AnimalSchema;

						// Build the query
						tmpQuery.buildUndeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Undelete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('UPDATE `Animal` SET UpdateDate = NOW(3), UpdatingIDUser = :UpdatingIDUser_1, Deleted = 0 WHERE IDAnimal = :IDAnimal_w0;');
					}
				);
				test
				(
					'Undelete Query without Deleted Bit',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable).setDialect('MySQL')
							.setScope('Animal')
							.addFilter('IDAnimal', 10);

						// Build the query
						tmpQuery.buildUndeleteQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Undelete Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT NULL;');
					}
				);
			}
		);

		suite
		(
			'Join Query Generation',
			function()
			{
				test
				(
					'Join Read Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setSort([{Column:'Age',Direction:'Ascending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'})
							.setJoin({Table: 'Test', From:'Test.IDAnimal', To: 'Animal.IDAnimal'});

						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Name`, `Age`, `Cost` FROM `Animal` INNER JOIN Test ON Test.IDAnimal = Animal.IDAnimal WHERE Age = :Age_w0 ORDER BY Age LIMIT 0, 10;');
					}
				);
				test
				(
					'Join Read Query with Distinct',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setCap(10)
							.setBegin(0)
							.setDataElements(['Name', 'Age', 'Cost'])
							.setSort([{Column:'Age',Direction:'Ascending'}])
							.setFilter({Column:'Age',Operator:'=',Value:'15',Connector:'AND',Parameter:'Age'})
							.setJoin({Table: 'Test', From:'Test.IDAnimal', To: 'Animal.IDAnimal'})
							.setDistinct(true);

						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT DISTINCT `Name`, `Age`, `Cost` FROM `Animal` INNER JOIN Test ON Test.IDAnimal = Animal.IDAnimal WHERE Age = :Age_w0 ORDER BY Age LIMIT 0, 10;');
					}
				);
				test
				(
					'Bad Join Read Query',
					function()
					{
						var tmpQuery = libFoxHound.new(libFable)
							.setDialect('MySQL')
							.setScope('Animal')
							.setJoin({Table: 'Test', From:'Bad.IDAnimal', To: 'Animal.IDAnimal'});

						// Build the query
						tmpQuery.buildReadQuery();
						// This is the query generated by the MySQL dialect
						libFable.log.trace('Select Query', tmpQuery.query);
						Expect(tmpQuery.query.body)
							.to.equal('SELECT `Animal`.* FROM `Animal`;'); //bad join is ignored, warn log is generated
					}
				);
			}
		);
	}
);
