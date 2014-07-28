function TeamViewController ($scope, $http, $routeParams, socket)
{
	var _dataURI,
		_mediaDataEventName,
		_routeChangeSuccessOff;

	$scope.mediaDataArray = [];

	// Setup listeners.
	_routeChangeSuccessOff = $scope.$on("$routeChangeSuccess", routeChangeSuccess);
	$scope.$on("$destroy", destroy);

	
	function routeChangeSuccess ($currentRoute, $previousRoute)
	{
		_routeChangeSuccessOff();

		_dataURI = "/api/teams/" + $routeParams.teamName;
		_mediaDataEventName = "mediaData-" + $routeParams.teamName;
		
		$http.get(_dataURI).success(viewDataReceived);
	}

	function viewDataReceived (data)
	{
		// console.log("TeamViewController:: [viewDataReceived] data:", data);

		var userData = angular.fromJson(data);

		$scope.teamName = userData.teamName;
		//$scope.profilePicture = userData.profilePicture;
		$scope.teamImage = userData.teamImage;
		$scope.teamThumb = userData.teamThumb;
		$scope.mediaDataArray = userData.mediaVOArray;
		$scope.teamMembers = userData.teamMembers;

		// listen for new media data for the current team and update the view when recieved.
		socket.on(_mediaDataEventName, mediaDataHandler);
	}

	function mediaDataHandler (data)
	{
		// console.log("TeamViewController:: [mediaDataHandler] data:", data);

		var mediaDataArray = angular.fromJson(data);

		// update data on view scope.
		$scope.mediaDataArray = mediaDataArray.concat($scope.mediaDataArray);
	}

	function destroy ()
	{
		// console.log("TeamViewController:: [destroy]");

		// remove the media event listener.
		socket.removeAllListeners(_mediaDataEventName);
	}
}

module.exports = TeamViewController;