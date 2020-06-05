app.factory('EventsService', ['$http', '$q', function($http, $q){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/events";
    
    var factory = {
        getAllEvents: getAllEvents,
        getEventsByYear: getEventsByYear
    };
 
    return factory;
    
    
    /**
     * GET ALL EVENTS 
     * @return array of events 
     */
    function getAllEvents() {
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI
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
     * GET EVENTS BY YEAR
     * @param year(4 digits)
     * @return array of events 
     */
    function getEventsByYear(year) {
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/year/'+year
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