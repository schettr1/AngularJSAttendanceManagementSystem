app.factory('BarchartService', ['$http', '$q', function($http, $q){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/events";
    
    var factory = {
    	listEventsPerYearByEmployee: listEventsPerYearByEmployee
    };
    return factory;
    
    
    /**
     * LIST EMPLOYEES PER YEAR BY EMPLOYEE
     * @param year(4 digits), employeeId
     * @return array of events
     */
    function listEventsPerYearByEmployee(year, employeeId) {
        var deferred = $q.defer();
        var employee_type = 3;	// medtechs
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI + '/year/' + year + '/employeeId/' + employeeId
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