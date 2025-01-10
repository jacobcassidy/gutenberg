/**
 * External dependencies
 */
const { sync: spawn } = require( 'cross-spawn' );
const { sync: resolveBin } = require( 'resolve-bin' );

/**
 * Internal dependencies
 */
const {
	fromConfigRoot,
	getArgsFromCLI,
	hasArgInCLI,
	hasFileArgInCLI,
	hasProjectFile,
	hasPackageProp,
} = require( '../utils' );

const args = getArgsFromCLI();

const defaultFilesArgs = hasFileArgInCLI() ? [] : [ '.' ];

const hasLegacyLintConfig =
	hasProjectFile( '.eslintrc.js' ) ||
	hasProjectFile( '.eslintrc.json' ) ||
	hasProjectFile( '.eslintrc.yaml' ) ||
	hasProjectFile( '.eslintrc.yml' ) ||
	hasProjectFile( 'eslintrc.config.js' ) ||
	hasProjectFile( '.eslintrc' ) ||
	hasPackageProp( 'eslintConfig' );

if ( hasLegacyLintConfig ) {
	// Backward compatibility with eslintrc mode.
	// See: https://eslint.org/docs/latest/use/configure/configuration-files-deprecated.
	const hasIgnoredFiles =
		hasArgInCLI( '--ignore-path' ) || hasProjectFile( '.eslintignore' );

	const legacyIgnoreArgs = ! hasIgnoredFiles
		? [
				'--ignore-pattern',
				'build',
				'--ignore-pattern',
				'node_modules',
				'--ignore-pattern',
				'vendor',
		  ]
		: [];

	const legacyExtArgs = hasArgInCLI( '--ext' )
		? []
		: [ '--ext', 'js,jsx,ts,tsx' ];

	process.env.ESLINT_USE_FLAT_CONFIG = 'false';

	const result = spawn(
		resolveBin( 'eslint' ),
		[ ...legacyIgnoreArgs, ...legacyExtArgs, ...args, ...defaultFilesArgs ],
		{ stdio: 'inherit' }
	);

	process.emitWarning(
		'Deprecated eslintrc configuration file detected. The support will be finished soon. See https://github.com/WordPress/gutenberg/pull/65648 for details.',
		'WordPressScriptsWarning'
	);

	// Don't use process.exit, warnings are not shown that way.
	return result.status;
}

// Enforce flat mode for ESLint v8.
process.env.ESLINT_USE_FLAT_CONFIG = 'true';

// See: https://eslint.org/docs/latest/use/configure/configuration-files.
const hasLintConfig =
	hasArgInCLI( '-c' ) ||
	hasArgInCLI( '--config' ) ||
	hasProjectFile( 'eslint.config.js' ) ||
	hasProjectFile( 'eslint.config.mjs' ) ||
	hasProjectFile( 'eslint.config.cjs' ) ||
	hasProjectFile( 'eslint.config.ts' ) ||
	hasProjectFile( 'eslint.config.mts' ) ||
	hasProjectFile( 'eslint.config.cts' );

// When a configuration is not provided by the project, use from the default
// provided with the scripts module. Instruct ESLint to avoid discovering via
// the `--no-config-lookup` flag.
const defaultConfigArgs = ! hasLintConfig
	? [ '--no-config-lookup', '--config', fromConfigRoot( 'eslint.config.js' ) ]
	: [];

const result = spawn(
	resolveBin( 'eslint' ),
	[ ...defaultConfigArgs, ...args, ...defaultFilesArgs ],
	{ stdio: 'inherit' }
);

return result.status;
