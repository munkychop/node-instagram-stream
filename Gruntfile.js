module.exports = function (grunt) {

	"use strict";

	var util = require("util"),
		jsSrcFile = "public/src/js/app/app.js",
		jsFile = "app.min.js",
		jsDistDir = "public/dist/js/",
		libsDir = "public/src/js/libs/",

		// a variable to alias all js files in the app directory, allowing them to be
		// require'd without any complicated relative filepaths.
		browserifyAliasAppFilesArray = aliasMappingsToAliasArray({
			
			cwd: "public/src/js/app",
			src: ["**/*.js"],
			dest: ""
		});



	// Takes grunt-browserify aliasMappings config and converts it into an alias array
	function aliasMappingsToAliasArray(aliasMappings)
	{
		var aliasArray = [],
			aliases = util.isArray(aliasMappings) ? aliasMappings : [aliasMappings];

		aliases.forEach(function (alias) {

			grunt.file.expandMapping(alias.src, alias.dest, {cwd: alias.cwd}).forEach(function(file) {
				
				var expose = file.dest.substr(0, file.dest.lastIndexOf("."));
				aliasArray.push("./" + file.src[0] + ":" + expose);
			});
		});

		return aliasArray;
	}


	// Project configuration.
	grunt.initConfig({

		pkg: require("./package"),

		/**
		 * Browserify
		 * https://github.com/jmreidy/grunt-browserify
		 * Browserify lets you require('modules') in the browser.
		 */
		browserify: {

			dev: {

				options : {
					alias: browserifyAliasAppFilesArray,
					transform: ["uglifyify"],
					browserifyOptions : {
						debug: true
					}
				},

				src: jsSrcFile,
				dest: jsDistDir + jsFile,
			},

			dist: {

				options : {
					alias: browserifyAliasAppFilesArray,
					transform: ["uglifyify"]
				},

				src: jsSrcFile,
				dest: jsDistDir + jsFile
			}
		},


		/**
		 * Sass
		 * https://github.com/gruntjs/grunt-contrib-sass
		 * Compiles Sass into CSS.
		 */
		sass: {

			dev: {
				options: {
					unixNewlines: true,
					style: "expanded",
					lineNumbers: false,
					debugInfo : false,
					precision : 8,
					sourcemap : true
				},
				files: {
					"public/dist/css/kickoff.css": "public/src/scss/kickoff.scss"
				}
			},

			dist: {
				options: {
					style: "compressed",
					precision : 8
				},
				files: {
					"public/dist/css/kickoff.css": "public/src/scss/kickoff.scss"
				}

			}
		},


		/**
		 * Autoprefixer
		 * https://github.com/ai/autoprefixer
		 * Auto prefixes your CSS using caniuse data.
		 */
		autoprefixer: {
			dist : {
				options: {
					// support the last 2 browsers, any browsers with >5% market share,
					// and ensure that we support IE9+ and Anroid 4 stock browsers with prefixes.
					browsers: ["> 5%", "last 2 versions", "ie >= 9", "Android 4"],
					map: true
				},
				files: {
					"public/dist/css/kickoff.css": "public/dist/css/kickoff.css"
				}
			}
		},


		/**
		 * CSSO
		 * https://github.com/t32k/grunt-csso
		 * Minify CSS files with CSSO.
		 */
		csso: {
			dist: {
				
				options: {
					restructure: false
				},

				files: {
					"public/dist/css/kickoff.css" : "public/dist/css/kickoff.css"
				},
			}
		},


		/**
		 * Copy
		 * https://github.com/gruntjs/grunt-contrib-copy
		 * Copy files and folders.
		 */
		copy: {
			
			img: {
				files: [
					{ expand: true, cwd: "public/src/img", src: ["./**/*.*"], dest: "public/dist/img" }
				]
			},

			partials: {
				files: [
					{ expand: true, cwd: "public/src/partials", src: ["./**/*.*"], dest: "public/dist/partials" }
				]	
			},

			fonts: {
				files: [
					{ expand: true, cwd: "public/src/fonts", src: ["./**/*.*"], dest: "public/dist/fonts" }
				]
			}
		},


		/**
		 * Watch
		 * https://github.com/gruntjs/grunt-contrib-watch
		 * Watch the listed files and, if changed, run the specified tasks.
		 */
		watch: {
			scss: {
				files: ["public/src/scss/**/*.scss"],
				tasks: ["sass:dev", "autoprefixer:dist"]
			},

			js: {
				files: [
					"Gruntfile.js",
					"public/src/js/app/**/*.js",
					"public/src/js/libs/**/*.js"
				],

				tasks: ["browserify:dev"]
			},

			html: {
				files: ["public/src/partials/*.html"],

				tasks: ["copy:partials"]
			},

			img: {
				files: ["public/src/img/**/*.*"],

				tasks: ["copy:img"]
			},

			fonts: {
				files: ["public/src/fonts/**/*.*"],

				tasks: ["copy:fonts"]
			},
			
			livereload: {
				options: { livereload: true },
				files: [
					"public/dist/css/*.css"
				]
			}
		}
	});


	// Load all the grunt task modules.
	require("load-grunt-tasks")(grunt, {pattern: ["grunt-*"]});

	// =============
	// === Tasks ===
	// =============

	// A task for creating a development build.
	grunt.registerTask("dev", ["browserify:dev", "sass:dev", "autoprefixer:dist", "copy"]);

	// A task for creating a deployment build.
	grunt.registerTask("deploy", ["browserify:dist", "sass:dist", "autoprefixer:dist", "csso:dist"]);
};