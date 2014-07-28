/**
 * Module dependencies.
 */
var express = require('express')	//express - application framework for node
 	, fs = require('fs')			//fs - filesystem libraru
	, http = require('http');		//http - give me server
	//, https = require('https')		//https - give me a secure server


/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

var env = process.env.NODE_ENV || 'local'		//get the environemnt var or set as development
	, config = require('./config/config')[env];	//get config based on the specifed environment
	
	/*, sslKeyOptions = {
		key: fs.readFileSync(config.global.ssl.key),
		cert: fs.readFileSync(config.global.ssl.cert)
	};
	*/


console.log('ENVIRONMENT = ' + env);


//  ================================
//  === EXPRESS SETUP AND CONFIG ===
//  ================================

//Create an express app
var app = express();

// express settings
require('./core/express')(app, config);


//Create the HTTP server with the express app as an argument
var server = http.createServer(app);

// Create an HTTPS service
//var server = https.createServer(sslKeyOptions, app);



//Create the server
server.listen(app.get('port'), function(){
	console.log('app.js: Express server listening on port ' + app.get('port'));
});

server.on('close', function(socket) {
	console.log('app.js: Server has closed');
});


// import instagram module
var instagram = require('./core/instagram')(app, server, config);
//instagram.init();

// Bootstrap routes
require('./core/routes')(app, instagram);

instagram.init();


// expose app as the scope
exports = module.exports = app;


