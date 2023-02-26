'use strict';

// We aren't abstracting this yet but here's the ... "Config"
const _CONFIG = (
	{
		// The input source file that should be passed to browserify:
		// (if you need to auto-instantiate an object, for instance)
		EntrypointInputSourceFile: `${__dirname}/source/Foxhound-Browser-Shim.js`,

		// The name of the packaged object to be passed to browserify:
		// (browserify sets this to global scope and window.SOMEOBJECTNAMEHERE where SOMEOBJECTNAMEHERE is the string below)
		LibraryObjectName: `Foxhound`,

		// The folder to write the library files and maps out to:
		LibraryOutputFolder: `${__dirname}/dist/`,

		// The name of the unminified version of the packaged library, for easy debugging:
		LibraryUniminifiedFileName: `foxhound.js`,

		// The name of the minified version of the packaged library, for production release:
		LibraryMinifiedFileName: `foxhound.min.js`
	});

// --->  Boilerplate Browser Uglification and Packaging  <--- \\

const libBrowserify = require('browserify');
const libGulp = require('gulp');

const libVinylSourceStream = require('vinyl-source-stream');
const libVinylBuffer = require('vinyl-buffer');

const libSourcemaps = require('gulp-sourcemaps');
const libGulpUtil = require('gulp-util');
const libBabel = require('gulp-babel');
const libTerser = require('gulp-terser');

// Build the module for the browser
libGulp.task('minified',
() => {
	// set up the custom browserify instance for this task
	var tmpBrowserify = libBrowserify(
	{
		entries: _CONFIG.EntrypointInputSourceFile,
		standalone: _CONFIG.LibraryObjectName,
		debug: true
	});

	return tmpBrowserify.bundle()
		.pipe(libVinylSourceStream(_CONFIG.LibraryMinifiedFileName))
		.pipe(libVinylBuffer())
		.pipe(libSourcemaps.init({loadMaps: true}))
				// Add transformation tasks to the pipeline here.
				.pipe(libBabel())
				.pipe(libTerser())
				.on('error', libGulpUtil.log)
		.pipe(libSourcemaps.write('./'))
		.pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));
});

// Build the module for the browser
libGulp.task('debug',
	() => {
		// set up the custom browserify instance for this task
		var tmpBrowserify = libBrowserify(
		{
			entries: _CONFIG.EntrypointInputSourceFile,
			standalone: _CONFIG.LibraryObjectName,
			debug: true
		});

		return tmpBrowserify.bundle()
			.pipe(libVinylSourceStream(_CONFIG.LibraryUniminifiedFileName))
			.pipe(libVinylBuffer())
					.pipe(libBabel())
					.on('error', libGulpUtil.log)
			.pipe(libGulp.dest(_CONFIG.LibraryOutputFolder));
	});

libGulp.task
(
	'build',
	libGulp.series('debug', 'minified')
);