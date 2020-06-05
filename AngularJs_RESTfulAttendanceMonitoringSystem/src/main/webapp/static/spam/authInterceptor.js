app.factory('AuthInterceptor', function() {
	
	console.log("Inside authInterceptor.js");
	
	return {
		// Send the Authorization header with each request
		'request' : function(config) {
			config.headers = config.headers || {};
			var encodedString = btoa("lydia:password");
			config.headers.Authorization = 'Basic ' + encodedString;
			return config;
		}
	};
});