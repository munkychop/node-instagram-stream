module.exports = {
	local : {

		appURL : "https://YOUR-APP-URL-HERE", // this has to use https, rather than just http.

		auth : {
			client_id: "YOUR-CLIENT-ID-HERE",
			client_secret: "YOUR-CLIENT-SECRET-HERE"
		},

		hashtag : "",

		teamData : {

			"Some Team Name" : {
				username : "some-instagram-account-name",
				teamName : "Some Team Name",
				teamImage : "/img/teams/some-team-image.jpg",
				teamThumb : "/img/teams/some-team-thumb.jpg",
				teamMembers : ["Ivan", "Ash", "Zander"]
			},

			"Some Other Team Name" : {
				username : "some-other-instagram-account-name",
				teamName : "Some Other Team Name",
				teamImage : "/img/teams/some-other-team-image.jpg",
				teamThumb : "/img/teams/some-other-team-thumb.jpg",
				teamMembers : ["Fabian", "Ciaran", "Andrew"]
			}
		}
	},

	dev : {

		appURL : "",

		auth : {
			client_id: "",
			client_secret: ""
		},

		hashtag : "",

		teamData : {}
	},
	
	prod : {
		
		appURL : "",

		auth : {
			client_id: "",
			client_secret: ""
		},

		hashtag : "",

		teamData : {}
	}
};