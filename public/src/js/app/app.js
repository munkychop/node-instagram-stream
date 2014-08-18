// Require global 'moment' object, as this is a dependancy of the 'angular-moment' module.
window.moment = require("moment");

// Setup moment's default relativeTime object.
moment.lang("en", {
	relativeTime : {
		future : "in %s",
		past   : "%s",
		s      : "%ds",
		m      : "1m",
		mm     : "%dm",
		h      : "1h",
		hh     : "%dh",
		d      : "1d",
		dd     : "%dd",
		M      : "1mth",
		MM     : "%dmths",
		y      : "1y",
		yy     : "%dy"
	}
});

// Force compilation of global libs that don't return a value.
require("angular/angular");
require("angular-route/angular-route");
require("angular-animate/angular-animate");
require("angular-moment/angular-moment");

(function (KO) {

	KO.Config = {

		init : function ()
		{
			// Setup the main app module.
			var TMWHuntApp = angular.module("TMWHuntApp", ["ngRoute", "ngAnimate", "angularMoment"]);


			// Setup a wrapper service for socket.io so that we can inject it into our modules when necessary.
			// We need to explicitly list the dependancies of the service, which in this case is just the root scope.
			TMWHuntApp.factory("socket", ["$rootScope", require("services/socket-io-service")]);


			// Setup directives.
			TMWHuntApp.directive("backgroundImageUrl", require("directives/background-image-url"));


			// Setup controllers.
			TMWHuntApp.controller("NavigationController", ["$scope", "$location", require("controllers/navigation-controller")]);
			TMWHuntApp.controller("HomeViewController", ["$scope", "$http", "socket", require("controllers/home-view-controller")]);
			TMWHuntApp.controller("AllTeamsViewController", ["$scope", "$http", "socket", require("controllers/all-teams-view-controller")]);
			TMWHuntApp.controller("TeamViewController", ["$scope", "$http", "$routeParams", "socket", require("controllers/team-view-controller")]);
			TMWHuntApp.controller("SlideshowViewController", ["$scope", "$http", "$interval", require("controllers/slideshow-view-controller")]);


			// Setup routes.
			TMWHuntApp.config(["$routeProvider", "$locationProvider", "$sceDelegateProvider",
				function($routeProvider, $locationProvider, $sceDelegateProvider)
				{
					$routeProvider
						.when("/", {templateUrl: "/partials/home.html", controller: "HomeViewController"})
						.when("/teams", {templateUrl: "/partials/all-teams.html", controller: "AllTeamsViewController"})
						.when("/teams/:teamName", {templateUrl: "/partials/team.html", controller: "TeamViewController"})
						.when("/slideshow", {templateUrl: "/partials/slideshow.html", controller: "SlideshowViewController"});

					$locationProvider
						.html5Mode(true)
						.hashPrefix("!");

					$sceDelegateProvider.resourceUrlWhitelist([
						
						"self",
						"http://*.cdninstagram.com/**",
						"https://*.cdninstagram.com/**"
					]);
				}
			]);
		}
	};

	KO.Config.init();

})(window.KO = window.KO || {});