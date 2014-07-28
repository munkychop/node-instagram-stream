function SocketIOService ($rootScope)
{
	var socket = require("socket.io-client")(window.location.host);

	return {
		on: function (eventName, callback)
		{
			socket.on(eventName, function () {
				
				var args = arguments;

				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},

		removeAllListeners: function (eventName)
		{
			socket.off(eventName);
		},

		emit: function (eventName, data, callback)
		{
			socket.emit(eventName, data, function () {

				var args = arguments;

				$rootScope.$apply(function () {

					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
}

module.exports = SocketIOService;