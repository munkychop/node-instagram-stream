
/*!
 * Module dependencies.
 */

var async = require("async");


/**
 * Expose routes
 */

module.exports = function (app, instagram) {

	// ----------------------------------------
	// API ROUTES
	// ----------------------------------------
	app.route("/api/instagram-data")
				
		.get(instagram.tagDataGet)
		.post(instagram.tagDataPost);


	app.get("/api/home", function (req, res) {

		res.send(instagram.getPageData());
	});

	app.get("/api/teams", function (req, res) {
		
		res.send(instagram.getTeamData());
	});

	
	app.get("/api/teams/:teamName", function (req, res) {

		if (instagram.isTeamNameAllowed(req.params.teamName))
		{
			console.log("team is allowed, sending page data...");
			res.send(instagram.getPageData(req.params.teamName));
		}
		else
		{
			console.log("team name is not allowed... throwing API Error...");
			// TODO : throw API error, as the team is not allowed. And possibly send error to the client.
		}
	});


	app.get("/api/slideshow", function (req, res) {

		console.log("slideshow api route...");
		res.send(instagram.getSlideshowData());
	});



	// ----------------------------------------
	// APPLICATION ROUTES
	// ----------------------------------------

	app.get(["/teams", "/slideshow", "/"], function (req, res) {

		res.render("index");
		res.end();
	});

	app.get("/teams/:teamName", function (req, res, next) {

		if (instagram.isTeamNameAllowed(req.params.teamName))
		{
			console.log("team is allowed, rendering index and sending page data...");

			res.render("index");
			res.end();
		}
		else
		{
			console.log("team name is not allowed, running 'next' method...");

			next();
		}
	});


	// ----------------------------------------
	// CATCH-ALL ROUTE (except '/api/*')
	// ----------------------------------------
	/*
	// Render the index page for any deep link other than paths starting with '/api' or '/teams'.
	app.get(/^((?!\/api|\/teams).)*$/, function (req, res) {

		res.render("index");
	});
	*/

	/*
		:var sets the req.param that you don't use. it's only used in this case to set the regex.
		(bla|blabla) sets the regex to match, so it matches the strings bla and blabla.
		? makes the entire regex optional, so it matches / as well.
	*/

	/*
	app.route("/:var(example|poop)?")
	
		.get(function(req, res) {
			res.render("index");
		});
	*/

	// assume "not found" in the error msgs
	// is a 404. this is somewhat silly, but
	// valid, you can do whatever you like, set
	// properties, use instanceof etc.
	app.use(function(err, req, res, next){
		// treat as 404
		if  (err.message &&
			(~err.message.indexOf("not found") ||
			(~err.message.indexOf("Cast to ObjectId failed")))) {
			return next();
		}

		// log it
		// send emails if you want
		console.error(err.stack);

		// error page
		res.status(500).render("500", { error: err.stack });
	});

	// assume 404 since no middleware responded
	app.use(function(req, res, next){
		res.status(404).render("404", {
			url: req.originalUrl,
			error: "Not found"
		});
	});

	//showError
};
