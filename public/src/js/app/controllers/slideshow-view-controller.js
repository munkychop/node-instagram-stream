function SlideshowViewController ($scope, $http, $interval)
{
	var _dataURI = "/api/slideshow/",
		_ticker,
		_routeChangeSuccessOff;

	$scope.mediaIndex = 0;
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
		// console.log("SlideshowViewController:: [viewDataReceived] data:", data);

		$scope.mediaDataArray = angular.fromJson(data);

		_ticker = $interval(updateMediaIndex, 16000);
	}

	function updateMediaIndex ()
	{
		$scope.mediaIndex++;
		if ($scope.mediaIndex === $scope.mediaDataArray.length) $scope.mediaIndex = 0;
	}

	function destroy ()
	{
		// cancel the interval if it exists.
		if (angular.isDefined(_ticker)) $interval.cancel(_ticker);
	}
}

module.exports = SlideshowViewController;