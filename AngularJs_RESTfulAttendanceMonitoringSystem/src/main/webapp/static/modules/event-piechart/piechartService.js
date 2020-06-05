app.factory('PiechartService', ['$http', '$q', function($http, $q){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/events";
 
    var factory = {
        getGenderPercentByEventId: getGenderPercentByEventId,
        getShiftPercentByEventId: getShiftPercentByEventId
    };
    return factory;
    
    
    /**
     * FIND GENDER PERCENTAGES OF EVENT
     * @param eventId
     */
    function getGenderPercentByEventId(eventId) {
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI + '/' + eventId + '/gender', 
	        	headers: { 'Content-Type': 'application/json' }
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
     * FIND SHIFT PERCENTAGES OF EVENT
     * @param eventId
     */
    function getShiftPercentByEventId(eventId) {
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI + '/' + eventId + '/shift', 
	        	headers: { 'Content-Type': 'application/json' }
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