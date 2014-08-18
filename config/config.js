
var path = require("path"),
	rootPath = path.normalize(__dirname + "/.."), //sets root path
	config,
	sharedConfig;

sharedConfig = {
	root: rootPath,
	db : {
		path: {}
	},

	ssl : {
		key : rootPath + "/keys/key.pem",
		cert : rootPath + "/keys/cert.pem",
	}
};

config = {
	local: {
		mode:	"local",
		port:	8888,
		app: {
			name: "Instagram photo stream - local"
		},
		instagram: require("./privconfig-instagram").local,
		global:	sharedConfig
	},

	dev: {
		mode:	"dev",
		port:	4443,
		app: {
			name: "Instagram photo stream - Dev"
		},
		instagram: require("./privconfig-instagram").dev,
		global:	sharedConfig
	},

	prod: {
		mode:	"prod",
		port:	4444,
		app: {
			name: "Instagram photo stream - Prod"
		},
		instagram: require("./privconfig-instagram").prod,
		global:	sharedConfig
	}
};


// Export config
module.exports = config;