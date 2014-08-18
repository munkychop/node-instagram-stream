
/**
 * Module dependencies.
 */

var _express = require("express"),
	_compress = require("compression"),
	_logger  = require("morgan"),
	_bodyParser = require("body-parser"),
	_methodOverride = require("method-override"),
	_pkg = require("../package.json");


module.exports = function (app, config) {

	app.set("showStackError", true);

	// should be placed before express.static - compressed with gzip
	app.use(_compress({
		filter: function (req, res) {
			return /json|text|javascript|css/.test(res.getHeader("Content-Type"));
		},
		level: 9
	}));

	// don't use logger for test env
	if (process.env.NODE_ENV !== "test") {
		app.use(_logger("dev"));
	}

	//app.use(express.favicon(__dirname + "../public/favicon.ico"));
	app.use(_express.static(config.global.root + "/public/dist"));

	// set views path, template engine and default layout
	app.set("views", config.global.root + "/app/views");
	app.set("view engine", "jade");


	app.set("port", config.port || process.env.PORT);

	// expose package.json to views
	app.use(function (req, res, next) {
		res.locals.pkg = _pkg;
		next();
	});

	// bodyParser should be above methodOverride
	app.use(_bodyParser());
	app.use(_methodOverride());

	// development env config
	if (config.mode === "local") {
		app.locals.pretty = true;
	}
};
