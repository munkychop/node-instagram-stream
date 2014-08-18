/**
 * Module dependencies.
 */
var _express = require("express"),
	_http = require("http"),
	_app,
	_server,
	_env = process.env.NODE_ENV || "local",		// get the environemnt var or set as development
	_config = require("./config/config")[_env],	// get config based on the specifed environment
	_instagram;


console.log("ENVIRONMENT = " + _env);


//  ================================
//  === EXPRESS SETUP AND CONFIG ===
//  ================================

// create an express app.
_app = _express();

// express settings.
require("./core/express")(_app, _config);


// create the HTTP server with the express app as an argument.
_server = _http.createServer(_app);

// create the server.
_server.listen(_app.get("port"), function(){
	console.log("index.js: Express server listening on port " + _app.get("port"));
});


// import instagram module.
_instagram = require("./core/instagram")(_app, _server, _config);

// bootstrap routes.
require("./core/routes")(_app, _instagram);

// only initialise instagram after the routes have been defined.
_instagram.init();


// expose app as the scope.
exports = module.exports = _app;


