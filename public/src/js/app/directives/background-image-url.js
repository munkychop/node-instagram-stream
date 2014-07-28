function BackgroundImageUrl ()
{
	function linkFunction (scope, element, attributes)
	{
		var backgroundImageUrlString = "url('" + attributes.backgroundImageUrl + "')";

		element.css("background-image", backgroundImageUrlString);
	}

	return {

		restrict: "A",
		link: linkFunction
	};
}

module.exports = BackgroundImageUrl;