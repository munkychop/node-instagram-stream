var _instagram = require("instagram-node").instagram(),
	_io = require("socket.io"), // socket.io - used for our websocket connection
	_shuffle = require("shuffle-array"), // function to randomise arrays based on the Fisher-Yates algorithm.
	_socketServer,
	_ticker,
	_allMediaDictionary,
	_tagData,
	_teamData,
	_teamNameMap,
	_initialised = false,
	_serverJustStarted = true;


module.exports = function (app, server, config)
{
	//  ===============================
	//  === State related data  ===
	//  ===============================
	_allMediaDictionary = {};

	_tagData = {

		name : config.instagram.hashtag,
		minTagID : 0,
		newDataAvailable : true,
		mediaVOArray : [],
		userDataDictionary : {}
	};

	_teamData = config.instagram.teamData;

	// Map Instagram account usernames to team names by inverting some of
	// the properties of the _teamData object, so that usernames become keys.
	_teamNameMap = createTeamNameMap(_teamData);


	_instagram.init = function ()
	{
		if (_initialised) return;

		_initialised = true;

		// Open a socket connection.
		_socketServer = _io.listen(server);

		// Start a ticker to check whether or not to request new image data from Instagram.
		_ticker = setInterval(tick, 5000);

		// Instantiate the instagram component.
		_instagram.use(config.instagram.auth);

		// Delete all subscriptions before re-subscribing.
		deleteAllSubscriptions(addTagSubscription);
	};

	_instagram.destroy = function ()
	{
		if (!_initialised) return;

		_initialised = false;

		deleteAllSubscriptions();
		
		clearInterval(_ticker);

		_socketServer.sockets.removeAllListeners();
		_socketServer.disconnect();
	};

	_instagram.tagDataGet = function (req, res)
	{
		// Handle the handshake for the current tag subscription request.
		res.send(req.query["hub.challenge"]);
		res.end();
	};

	_instagram.tagDataPost = function (req, res)
	{
		// New data is available for us to request from the Instagram API.
		_tagData.newDataAvailable = true;
		res.end();
	};

	_instagram.isTeamNameAllowed = function (teamName)
	{
		var username = getUsernameFromTeamName(teamName);
		return typeof username !== "undefined" ? true : false;
	};

	_instagram.getTeamData = function ()
	{
		var dataArray = [];
		
		for (var team in _teamData)
		{
			dataArray.push(_teamData[team]);
		}

		return dataArray;
	};

	_instagram.getPageData = function (teamName)
	{
		var username,
			storedUserMediaData,
			userData,
			pageData,
			mediaVOArray = [];

		if (typeof teamName !== "undefined")
		{
			username = getUsernameFromTeamName(teamName);

			storedUserMediaData = _tagData.userDataDictionary[username];

			if (typeof storedUserMediaData !== "undefined")
			{
				// Lookup stored media data for the requested team.
				mediaVOArray = storedUserMediaData.mediaVOArray;
			}

			userData = _teamData[teamName];
			
			pageData = {

				//username : userData.username
				teamName : userData.teamName,
				teamImage : userData.teamImage,
				teamThumb : userData.teamThumb,
				teamMembers : userData.teamMembers,
				mediaVOArray : mediaVOArray
			};
		}
		else
		{
			// Return all media data (for all users) that we have already stored.
			pageData = _tagData.mediaVOArray;
		}

		return JSON.stringify(pageData);
	};

	_instagram.getSlideshowData = function ()
	{
		// Return a shuffled copy of the global mediaVOArray if there is more than one item in the array,
		// otherwise return an empty array, since we nee more than one item for the slideshow to work properly.
		return _tagData.mediaVOArray.length > 1 ? _shuffle(_tagData.mediaVOArray.concat(), true) : [];
	};

	function deleteAllSubscriptions (cb)
	{
		_instagram.del_subscription({ all: true }, function(err, subscriptions, limit){

			if (!err && typeof cb === "function")
			{
				cb();
			}
		});
	}

	function addTagSubscription ()
	{
		//console.log("instagram:: [addTagSubscription] tag name:", _tagData.name);

		_instagram.add_tag_subscription(_tagData.name, config.instagram.appURL + "/api/instagram-data", function(err, result, limit)
		{				
			if (err) console.log(err);
		});
	}

	function requestMediaData ()
	{
		_instagram.tag_media_recent(_tagData.name, {min_tag_id: _tagData.minTagID}, mediaRecentHandler);
	}

	function mediaRecentHandler (err, dataArray, pagination, remaining, limit, previousUserDataDictionary, previousAllMediaDataArray, recursing)
	{
		if (err)
		{
			console.log(err);
			return;
		}

		var i = 0,
			length = dataArray.length,
			allMediaVOArray = previousAllMediaDataArray || [],
			userDataDictionary = previousUserDataDictionary || {},
			mediaData,
			shouldPaginate = true;

		for (i; i < length; i++)
		{
			mediaData = dataArray[i];

			var mediaType = mediaData.type;
			
			// Construct the media URL allowing for either an image or a video.
			var mediaURL = mediaType === "image" ? mediaData.images.standard_resolution.url : mediaData.videos.standard_resolution.url;
			// We could alternatively use a low res image (320*320px): mediaData.images.low_resolution.url;
			// Or we could use a thumbnail image (150*150px): mediaData.images.thumbnail.url;


			// Stop looping and set a flag so that we know not to paginate later, otherwise we'll
			// end up getting duplicate content.
			if (typeof _allMediaDictionary[mediaURL] !== "undefined")
			{
				shouldPaginate = false;
				break;
			}

			var username = mediaData.user.username;
			var teamName = getTeamNameFromUsername(username);
			var profilePicture = mediaData.user.profile_picture;
			var timestamp = mediaData.created_time;
			var caption = mediaData.caption ? mediaData.caption.text : "";

			// Skip this iteration of the loop if the username that posted the image is
			// not one of our approved users, or if there is no caption.
			if (!isUserAllowed(username) || !mediaData.caption) continue;


			// Add the media URL to the dictionary so that we can check for its existence the
			// next time this function runs.
			_allMediaDictionary[mediaURL] = mediaURL;
			
			var mediaVO = {

				media : {
					type : mediaType,
					url : mediaURL,
					timestamp : timestamp,
					caption : caption
				},

				user : {
					username : username,
					teamName : teamName,
					profilePicture : profilePicture,
					teamImage : _teamData[teamName].teamImage,
					teamThumb : _teamData[teamName].teamThumb
				}
			};

			// Add media VOs into the array that we will emit to connected clients.
			allMediaVOArray.push(mediaVO);


			// Create a user object within the local user data dictionary if one doesn't exist already for this user.
			if (typeof userDataDictionary[username] === "undefined")
			{
				userDataDictionary[username] = {
					username : username,
					teamName : teamName,
					profilePicture : profilePicture,
					teamImage : _teamData[teamName].teamImage,
					teamThumb : _teamData[teamName].teamThumb,
					teamMembers : _teamData[teamName].teamMembers,
					mediaVOArray : []
				};
			}

			// Push the new VO data for this user into the media array within the local user data dictionary.
			userDataDictionary[username].mediaVOArray.push(mediaVO);
		}

		// Send the media data to connected clients.
		if (length > 0)
		{
			// If there is no more media data to paginate...
			if (!shouldPaginate || typeof pagination === "undefined" || typeof pagination.next === "undefined")
			{
				// Concatenate the new media VOs to the start of our global mediaVO array, which includes media from all users.
				// The newest item will be at the first index of the array.
				_tagData.mediaVOArray = allMediaVOArray.concat(_tagData.mediaVOArray);

				// Only emit if the server hasn't just started.
				if (!_serverJustStarted)
				{
					// Emit all new media data to commected clients.
					_socketServer.sockets.emit("mediaData-all", allMediaVOArray);
				}

				// Emit data for each team name included in the temporary userDataDictionary.
				for (var userDataVO in userDataDictionary)
				{
					var vo = userDataDictionary[userDataVO];

					var eventName = "mediaData-" + vo.teamName;

					// Only emit if the server hasn't just started.
					if (!_serverJustStarted)
					{
						_socketServer.sockets.emit(eventName, vo.mediaVOArray);
					}


					// Create a user object within the global user data dictionary if one doesn't exist already for this user.
					if (typeof _tagData.userDataDictionary[vo.username] === "undefined")
					{
						_tagData.userDataDictionary[vo.username] = {

							username : vo.username,
							teamName : vo.teamName,
							profilePicture : vo.profilePicture,
							teamImage : vo.teamImage,
							teamThumb : vo.teamThumb,
							teamMembers : vo.teamMembers,
							mediaVOArray : vo.mediaVOArray
						};
					}
					else
					{
						// Concatenate the current user's new media VO array to the start of their global mediaVO array.
						// The newest item will be at the first index of the array.
						_tagData.userDataDictionary[vo.username].mediaVOArray = vo.mediaVOArray.concat(_tagData.userDataDictionary[vo.username].mediaVOArray);
					}
				}

				// Ensure that we will emit the next time this method runs within this conditional block.
				if (_serverJustStarted) _serverJustStarted = false;
			}
			else
			{
				// Set the min tag ID, if it exists, only once, rather than every time we recurse the function due to pagination.
				if (!recursing && typeof pagination.min_tag_id !== "undefined") _tagData.minTagID = pagination.min_tag_id;

				if (typeof pagination.next === "function") pagination.next(function (err, dataArray, pagination, limit) {

					// Recurse the 'mediaRecentHandler' function, passing in some custom params.
					mediaRecentHandler(err, dataArray, pagination, remaining, limit, userDataDictionary, allMediaVOArray, true);
				});
			}
		}
	}

	function emitMediaData (mediaVOArray)
	{
		_socketServer.sockets.emit("mediaData", mediaVOArray);
	}

	function tick ()
	{
		if (_tagData.newDataAvailable)
		{
			_tagData.newDataAvailable = false;
			requestMediaData();
		}
	}

	function getUsernameFromTeamName (teamName)
	{
		return typeof _teamData[teamName] !== "undefined" ? _teamData[teamName].username : undefined;
	}

	function getTeamNameFromUsername (username)
	{
		return _teamNameMap[username];
	}

	function isUserAllowed (username)
	{
		return typeof username !== "undefined" && typeof _teamNameMap[username] !== "undefined" ? true : false;
	}

	function invertObject (obj)
	{
		var invertedObject = {};

		for (var prop in obj)
		{
			if (obj.hasOwnProperty(prop))
			{
				invertedObject[obj[prop]] = prop;
			}
		}

		return invertedObject;
	}

	function createTeamNameMap (teamData)
	{
		var teamNameMap = {};

		for (var team in teamData)
		{
			if (teamData.hasOwnProperty(team))
			{
				teamNameMap[teamData[team].username] = teamData[team].teamName;
			}
		}

		return teamNameMap;
	}


	return _instagram;
};


