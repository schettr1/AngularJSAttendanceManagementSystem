app.factory('ResetPasswordService', ['$http', '$q', function ($http, $q) {

	var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem";
	
	var factory = {
    		sendPasswordResetLink: sendPasswordResetLink,
    		verifyPasswordResetToken: verifyPasswordResetToken,
    		tokenBasedNewPasswordSubmitFunc: tokenBasedNewPasswordSubmitFunc,
    		updateLoggedInUserPasswordFunc: updateLoggedInUserPasswordFunc
    };
    return factory;
    
    
    /**
     * PASSWORD RESET LINK
     */
    function sendPasswordResetLink(email) {
        var deferred = $q.defer();
        console.error("email=" + email);

        $http({
	        	method: 'GET', 
	        	url: REST_SERVICE_URI+'/reset-password?email='+email, 
	        	headers: {
	        		'Content-Type': undefined
	        	}
        })
        .then(
            function (response) {  
	            console.log('response=', response);
	            deferred.resolve(response);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;	
    }
	
	
    
    /**
     * PASSWORD RESET LINK
     */
    function verifyPasswordResetToken(token) {
		var deferred = $q.defer();
		console.error('token=', token);
    	$http({
    		method: 'GET',
    		url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/verify-change-password-token?token=' + token 
    	})
    	.then(
            function (response) { 
	            console.log('response=', response);
	            deferred.resolve(response);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;	       
    }
    
    
    /**
     * UPDATE NEW PASSWORD BY USING TOKEN
     */
    function tokenBasedNewPasswordSubmitFunc(employee) {  
		var deferred = $q.defer();
		console.error('employee=', employee);
    	$http({
    		method: 'POST',
    		url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/token-based-update-password',
    		data: JSON.stringify(employee)
    	})
    	.then(
            function (response) { 
	            console.log('response=', response);
	            deferred.resolve(response);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;	       
    }
    
    
    /**
     * UPDATE NEW PASSWORD SUBMITTED BY LOGGED USER
     */
    function updateLoggedInUserPasswordFunc(employee) { 
		var deferred = $q.defer();
		console.error('employee=', employee);
    	$http({
    		method: 'POST',
    		url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/logged-user-update-password',
    		data: employee,
    		headers: {}
    	})
    	.then(
            function (response) {  
	            console.log('response=', response);
	            deferred.resolve(response);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;	       
    }    
    
    
}]);
