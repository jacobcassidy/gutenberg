/**
 * External dependencies
 */
const { cosmiconfigSync } = require( 'cosmiconfig' );
const eslintConfigPrettier = require( 'eslint-config-prettier' );
const tseslint = require( 'typescript-eslint' );
const prettierRecommended = require( 'eslint-plugin-prettier/recommended' );

/**
 * WordPress dependencies
 */

/**
 * Internal dependencies
 */
const { isPackageInstalled } = require( '../utils' );
const defaultPrettierConfig = require( '@wordpress/prettier-config' );

const config = [ ...require( './recommended-with-formatting.js' ) ];

if ( isPackageInstalled( 'typescript' ) ) {
	const typeScriptConfig = tseslint.config( {
		extends: [ tseslint.configs.base, tseslint.configs.eslintRecommended ],
		files: [ '**/*.ts', '**/*.tsx' ],
		settings: {
			'import/resolver': {
				node: {
					extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
				},
			},
		},
		rules: {
			'no-duplicate-imports': 'off',
			'import/no-duplicates': 'error',
			// Don't require redundant JSDoc types in TypeScript files.
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-returns-type': 'off',
			// Use eslint for unused variable and parameter detection.
			// This overlaps with TypeScript noUnusedLocals and noUnusedParameters settings.
			// TypeScript may only run on a subset of files. Prefer eslint which is more
			// likely to run on the entire codebase.
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ ignoreRestSiblings: true, caughtErrors: 'none' },
			],
			// no-shadow doesn't work correctly in TS, so let's use a TS-dedicated version instead.
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/method-signature-style': 'error',
		},
	} );

	config.push( ...typeScriptConfig );
}

if ( isPackageInstalled( 'prettier' ) ) {
	config.push( eslintConfigPrettier );

	const { config: localPrettierConfig } =
		cosmiconfigSync( 'prettier' ).search() || {};
	const prettierConfig = { ...defaultPrettierConfig, ...localPrettierConfig };
	config.push( prettierRecommended, {
		rules: {
			'prettier/prettier': [ 'error', prettierConfig ],
			// Prettier _disables_ this rule, but we want it!
			// See https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#curly
			// > This rule requires certain options.
			// > …
			// > If you like this rule, it can be used just fine with Prettier as long as you don’t use the "multi-line" or "multi-or-nest" option.
			curly: [ 'error', 'all' ],
		},
	} );
}

module.exports = config;
