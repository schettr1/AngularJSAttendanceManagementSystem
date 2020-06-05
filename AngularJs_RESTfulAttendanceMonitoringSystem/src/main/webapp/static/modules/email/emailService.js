app.factory('EmailService', ['$http', '$q', function($http, $q){
 
	var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/employees";
    
    var factory = {
    	sendEmail: sendEmail,
    	findAllEmails: findAllEmails
    };
    return factory;
    
    
    /**
     * SEND EMAIL w/attachment
     * @return 
     */
    function sendEmail(jsonData, files) {
        var deferred = $q.defer();
        console.error('jsonData=', jsonData);
        console.error('files=', files);
        $http({
	        	method: 'POST', 
	        	url: REST_SERVICE_URI + '/send-email',
	        	data: { 
	        		model: jsonData, 
	        		files: files 
	        	},
	        	transformRequest: function (data) {  
	                var formData = new FormData();  
	                formData.append('model', JSON.stringify(data.model));  
	                for (var i = 0; i < data.files.length; i++) {  
	                	formData.append('files', data.files[i]);		// append all files to same variable name 'files'
	                }  
	                return formData;  
	            }        	
        })
        .then(
            function (response) {
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
     * SEND EMAIL w/attachment
     * @return 
     */
    function findAllEmails() {
        var deferred = $q.defer();
        $http({
	        	method: 'GET', 
	        	url: REST_SERVICE_URI + '/get-emails',        	   	
        })
        .then(
            function (response) {
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