function NavigationController ($scope, $location)
{
	$scope.getNavigationItemState = getNavigationItemState;

	function getNavigationItemState (routeName)
	{
		var currentRoute = $location.path().substring(1) || "home";

		return routeName === currentRoute ? "active" : "";
	}
}

module.exports = NavigationController;