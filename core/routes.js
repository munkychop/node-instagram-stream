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

		// log the error
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
};
