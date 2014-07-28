function HomeViewController ($scope, $http, socket)
{
	var _dataURI = "/api/home/",
		_mediaDataEventName = "mediaData-all",
		_routeChangeSuccessOff;

	$scope.mediaDataArray = [];

	// Setup listeners.
	_routeChangeSuccessOff = $scope.$on("$routeChangeSuccess", routeChangeSuccess);
	$scope.$on("$destroy", destroy);


	function routeChangeSuccess ($currentRoute, $previousRoute)
	{
		_routeChangeSuccessOff();

		$http.get(_dataURI).success(viewDataReceived);
	}

	function viewDataReceived (data)
	{
		// console.log("HomeViewController:: [viewDataReceived] data:", data);

		$scope.mediaDataArray = angular.fromJson(data);

		// listen for new media data from all teams and update the view when recieved.
		socket.on(_mediaDataEventName, mediaDataHandler);
	}

	function mediaDataHandler (data)
	{
		// console.log("HomeViewController:: [mediaDataHandler] data:", data);

		// update data on view scope.
		$scope.mediaDataArray = data.concat($scope.mediaDataArray);
	}

	function destroy ()
	{
		// console.log("HomeViewController:: [destroy]");

		// remove the media event listener.
		socket.removeAllListeners(_mediaDataEventName);
	}
}

module.exports = HomeViewController;