/**
* Unit tests for FoxHound
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

suite
(
	'FoxHound',
	function()
	{
		var testFoxHound = false;

		setup
		(
			function()
			{
				testFoxHound = require('../source/FoxHound.js');
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					function()
					{
						Expect(testFoxHound).to.be.an('object', 'FoxHound should initialize as an object directly from the require statement.');
					}
				);
				test
				(
					'There should be some basic metadata on the class parameters',
					function()
					{
						Expect(testFoxHound).to.have.a.property('parameters')
						.that.is.a('object');
						Expect(testFoxHound.parameters).to.have.a.property('scope')
						.that.is.a('boolean'); // Scope is boolean false by default.
						Expect(testFoxHound.parameters).to.have.a.property('dataElements')
						.that.is.a('boolean'); // Scope is boolean false by default.
						Expect(testFoxHound.parameters).to.have.a.property('filter')
						.that.is.a('boolean'); // Scope is boolean false by default.
						Expect(testFoxHound.parameters).to.have.a.property('begin')
						.that.is.a('boolean'); // Scope is boolean false by default.
						Expect(testFoxHound.parameters).to.have.a.property('cap')
						.that.is.a('boolean'); // Scope is boolean false by default.
						Expect(testFoxHound.parameters).to.have.a.property('sort')
						.that.is.a('boolean'); // Scope is boolean false by default.

						Expect(testFoxHound).to.have.a.property('uuid')
						.that.is.a('string')
						.that.is.not.empty;
					}
				);
			}
		);
	}
);