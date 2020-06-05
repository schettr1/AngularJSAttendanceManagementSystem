app.factory('EventService', ['$http', '$q', function($http, $q){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/events";
    
    var factory = {
        getEventById: getEventById,
        createEvent: createEvent,
        updateEvent: updateEvent,
        deleteEvent: deleteEvent,
        checkIfEmployeeIsPresentInEvent: checkIfEmployeeIsPresentInEvent
    };
    return factory;
    
    
    /**
     * GET EVENT BY ID 
     * @return event 
     */
    function getEventById(eventId) {
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/events/' + eventId
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
     * CREATE EVENT
     * @param event
     */
    function createEvent(event) {
    	console.error("event=", event);
    	//console.error("(JSON String) event=", JSON.stringify(event))
        var deferred = $q.defer();
  
        $http({
    		method: 'POST', 
    		url: REST_SERVICE_URI, 
    		data: event
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
     * UPDATE EVENT
     * @param event, eventId
     */
    function updateEvent(event, eventId) {
    	console.log("eventId= ", eventId);
    	console.log("event= ", event);
        var deferred = $q.defer();

        $http({
    		method: 'PUT', 
    		url: REST_SERVICE_URI + '/' + eventId, 
    		data: event
        })
        .then(
	        function (response) {    
            	console.log('response=', response);
                deferred.resolve(response);
	        },
	        function(errResponse){
	        	console.log('errResponse.data=' + errResponse);
	            deferred.reject(errResponse);
	        }
	    );
        return deferred.promise;
    }
 
    
    /**
     * DELETE EVENT
     */
    function deleteEvent(id) {
    	console.log("id: " + id);
        var deferred = $q.defer();
        
        $http({
        		method: 'delete', 
        		url: REST_SERVICE_URI + '/' + id
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
     * CHECK WHETHER EMPLOYEE HAS ATTENDED AN EVENT
     * @param eventId, employeeId
     * @return 
     */
    function checkIfEmployeeIsPresentInEvent(employeeId, eventId) {
    	var deferred = $q.defer();
        
        $http({
        		method:'get', 
        		url:REST_SERVICE_URI+'/'+employeeId+'/events/'+eventId, 
        		headers: { 
	        		'Content-Type': 'application/json',
	        		'Authorization': AUTH_HEADER
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
 
    
}]);