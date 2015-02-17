
var path = require("path"),
	rootPath = path.normalize(__dirname + "/.."), //sets root path
	config,
	sharedConfig;

sharedConfig = {
	root: rootPath
};

config = {
	local: {
		mode: "local",
		port: process.env.PORT || 8000,
		app: {
			name: "Instagram Stream"
		},
		instagram: {

			appURL : process.env.APP_URL, // this has to use https, rather than just http.

			auth : {
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET
			},

			hashtag : process.env.HASHTAG,

			teamData : {
				"Team Awesome" : {
					username : "nodeigstream",
					teamName : "Team Awesome",
					teamImage : "/img/teams/team-awesome.jpg",
					teamThumb : "/img/teams/team-awesome-thumb.jpg",
					teamMembers : ["Ivan"]
				}
			}
		},
		global:	sharedConfig
	},

	production: {
		mode: "production",
		port: process.env.PORT,
		app: {
			name: "Instagram Stream"
		},
		instagram: {

			appURL : process.env.APP_URL, // this has to use https, rather than just http.

			auth : {
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET
			},

			hashtag : process.env.HASHTAG,

			teamData : {
				"Team Awesome" : {
					username : "nodeigstream",
					teamName : "Team Awesome",
					teamImage : "/img/teams/team-awesome.jpg",
					teamThumb : "/img/teams/team-awesome-thumb.jpg",
					teamMembers : ["Ivan"]
				}
			}
		},
		global:	sharedConfig
	}
};


// Export config
module.exports = config;