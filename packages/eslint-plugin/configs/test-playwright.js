/**
 * External dependencies
 */
const playwright = require( 'eslint-plugin-playwright' );

module.exports = {
	...playwright.configs[ 'flat/recommended' ],
	name: '@wordpress/test-playwright',
};
