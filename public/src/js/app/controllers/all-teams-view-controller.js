function AllTeamsViewController ($scope, $http)
{
	var _dataURI = "/api/teams/",
		_routeChangeSuccessOff;

	$scope.mediaDataArray = [];
	
	// Setup listeners.
	_routeChangeSuccessOff = $scope.$on("$routeChangeSuccess", routeChangeSuccess);


	function routeChangeSuccess ($currentRoute, $previousRoute)
	{		
		_routeChangeSuccessOff();

		$http.get(_dataURI).success(viewDataReceived);
	}

	function viewDataReceived (data)
	{
		// console.log("AllTeamsViewController:: [viewDataReceived] data:", data);

		$scope.mediaDataArray = angular.fromJson(data);
	}
}

module.exports = AllTeamsViewController;