/*
 * SOURCES -
 * http://thecodebarbarian.com/2015/01/24/angularjs-interceptors.html
 * https://github.com/witoldsz/angular-http-auth/blob/master/src/http-auth-interceptor.js
 * http://plnkr.co/edit/am6IDw?p=preview ($emit, $broadcast, $on with $scope and $rootScope)
 */

app.factory('HttpInterceptor', ['$q', '$injector', '$rootScope', 'jwtService', '$localStorage', '$cookieStore', '$window', '$location',
	function($q, $injector, $rootScope, jwtService, $localStorage, $cookieStore, $window, $location) {
		
    var factory = {
    		request: request,
    		//requestError: requestError,
    		//response: response,
    		responseError: responseError
    };
    return factory;	
    
    
    /************************** INTERCEPTING REQUEST **************************/    
    function request(request) {
    	console.log('request.url=', request.url);
    	
    	if(
    		// request to access views (you wont have to specify these lines if front end app and server were built separately.)
    		request.url == './static/modules/login/views/login.html' || 
    		request.url == './static/modules/reset-password/views/reset-password-link.html' ||
    		request.url == './static/modules/reset-password/views/change-password-form.html' ||
    		request.url == './static/modules/reset-password/views/updated-password-modal.html' ||
    		request.url == 'uib/template/modal/window.html' ||
    		// request to api resource
    		request.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/authorize' ||
    		request.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/reset-password' ||
    		request.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/renew-access-token' ||
    		request.url.includes('http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/verify-change-password-token') ||
    		request.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/token-based-update-password' ||
    		request.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/update-password') 
    	{        		
    		// do not modify the headers
    	}
    	// for request '/send-email' add content-type & access token to the header
    	else if(request.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/employees/send-email') {
    		access_token = JSON.parse(localStorage.getItem('user')).access_token;
    		console.log("AUTH_HEADER added to the request");
    		var AUTH_HEADER = 'Bearer ' + access_token;   		
    		request.headers = { 
        		'Content-Type': undefined,
        		'Authorization': AUTH_HEADER
        	};
    	}
    	// for request '/reset-password' add content-type to the header
    	else if(request.url.includes('http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/reset-password')) {		
    		request.headers = { 
        		'Content-Type': undefined
        	};
    	}
    	// for all other requests add access token & content-type to the header
    	else {
    		const access_token = JSON.parse(localStorage.getItem('user')).access_token;
    		console.log('access_token=', access_token);
    		var AUTH_HEADER = 'Bearer ' + access_token;   		
    		request.headers = { 
        		'Content-Type': 'application/json',
        		'Authorization': AUTH_HEADER
        	};
    	}
    	
    	// return the request
    	return request;
    };


    /************************* INTERCEPTING RESPONSE ERROR *****************************/ 
    function responseError(response) {
    	if(response == null) {
    		return response; 
    	}
    	console.error('response=', response);
    	var originalRequest = response.config;          // response = {data: '', status: '', config: '', statusText: '', headers: ''....}
        var deferred = $q.defer();
    	console.error('originalRequest=', originalRequest); 
    	
        // if 401 response is due to failed authentication, return the response so that 'invalid credentials' message will be displayed by the controller; you don't want to fire the '/renew-access-token' request for failed authentication
        if(response.status == 401 && originalRequest.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/authorize') {
          return response;   
        }

        // if expired refresh token, return login page or else it will infinitly call original failed request 
        if(response.status == 401 && originalRequest.url == 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/renew-access-token') {
            localStorage.setItem('isRefreshTokenExpired', true);
      	  	localStorage.removeItem('user');
      	  	window.location.href = '/AngularJs_RESTfulAttendanceMonitoringSystem/#!/login';           // send to login page
        }
        
        // if expired access_token for password reset link, return response or else it will infinitly call original failed request  
        if(response.status == 401 && originalRequest.url.includes('http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/verify-change-password-token')) {
            return response;  
        }
        
        // execute this code if response.status is 401 and originalRequest has been rejected only once
        if(response.status == 401 && !originalRequest._retry) {   // i.e. originalRequest._retry !== undefined
          console.log('inside 401 and "original-request failed once"');
          originalRequest._retry = true;    // this will ensure that the above condition will fail second time i.e. originalRequest is not sent to Server more than one time.
          const refreshToken = JSON.parse(localStorage.getItem('user')).refresh_token;         
          
          $injector.get('$http')({
        	method: 'post', 
        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/renew-access-token', 
        	headers: {
                "Authorization" : "Bearer " + refreshToken
            }
          })
          .then(
              function (response) { 
            	  // if renew access_token returns status 200
            	  if (response.status == 200) {    
                      console.log('New jwtToken=', response.data);      // response.data = {access_token: 'new', refresh_token: 'old', userId: 'old', role: 'old'}
                      localStorage.setItem('user', JSON.stringify(response.data));
                      // Prepare Authorization Header for failed original request using re-newed access_token
                      $injector.get("$http")(originalRequest)
                      .then(
                		  function(resp) {
                			  console.log('originalRequest=', originalRequest);
	                          deferred.resolve(resp);
	                      },function(resp) {	                    	  
	                          deferred.reject();
	                      });
                  } 
            	  // if renew access_token returns status 401
            	  else {           		  
                      deferred.reject();
                  }
              },
              function(errResponse){
            	  console.log('errResponse=', errResponse);
            	  deferred.reject();
            	  return;
              }
          );
          return deferred.promise;                    
        }

        // default return - if above conditions are not met
        console.log('response=', response);
    	return response;
    }; 
    
    
}]);





/**
 * CIRCULAR DEPENDENCY (CDEP)
 */
/*
 * PROBLEM - app.factory('HttpInterceptor', ['$q', '$http',...
 * If you inject '$http' in 'HttpInterceptor', you get cdep error.
 * $http <- HttpInterceptor <- $http <- Keepalive <- Idle
 *  
 * SOLUTION - app.factory('HttpInterceptor', ['$q', '$injector',...
 * And access '$http' using '$injector' 
 * $injector.get('$http')({
 * 
 */ 

