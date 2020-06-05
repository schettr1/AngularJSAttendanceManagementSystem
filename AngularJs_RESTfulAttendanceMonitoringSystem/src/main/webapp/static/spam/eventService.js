/**
 * inject dependencies inside square-bracket [] and pass objects inside the function()
 * '$http' object is needed to make call to the REST service
 * '$q' is called Promise object. It is used to handle asynchronous call to REST api.
 * Once you call defer() method, it will promise us resolve() or reject() 
 * If we handle asynchronous calls using jQuery plugin, it wouldn't be so much fun!
 *
 * In AngularJS, Services can be created using .factory() method or .service() method
 * 
 */ 

app.factory('EventService', ['$http', '$q', function($http, $q){
 
	console.log("Inside eventService.js");
	
    var REST_SERVICE_URI = "http://localhost:8080/AngularJS_REST_Spring5_Hibernate5_Jpa2_MappingRelation_ExceptionController_UnitTesting/events";
 
    var factory = {
        getAllEvents: getAllEvents,
        getEventById: getEventById,
        getEventsByStatus: getEventsByStatus,
        getGenderPercentByEventId: getGenderPercentByEventId,
        getShiftPercentByEventId: getShiftPercentByEventId,
        createEvent: createEvent,
        updateEvent: updateEvent,
        deleteEvent: deleteEvent,
        getEventsByYear: getEventsByYear
    };
 
    return factory;
    
    
    /**
     * GET ALL EVENTS 
     * @return array of events 
     */
    function getAllEvents() {
    	console.log("Inside eventService.js + fetchAllEvents()");
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI, 
	        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside eventService.js + fetchAllEvents() + function (response)");            
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Events');
                console.log("Inside eventService.js + fetchAllEvents() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
 
 
    /**
     * GET EVENT BY ID 
     * @return event 
     */
    function getEventById(eventId) {
    	console.log("Inside eventService.js + getEventById()");
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/'+eventId, 
	        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside eventService.js + getEventById() + function (response)");            
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Event by Id');
                console.log("Inside eventService.js + getEventById() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    
    
    /**
     * GET EVENTS BY STATUS
     * @param status(0 for pending and 1 for completed)
     * @return array of events 
     */
    function getEventsByStatus(statusCode) {
    	console.log("Inside attendanceService.js + getEventsByStatus()");
        var deferred = $q.defer();
        
        $http({
        	method: 'get', 
        	url: REST_SERVICE_URI + '/status/' + statusCode, 
        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside attendanceService.js + getEventsByStatus() + function (response)");            
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Events by status');
                console.log("Inside attendanceService.js + getEventsByStatus() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    

    function getGenderPercentByEventId(eventId) {
    	console.log("Inside eventService.js + getGenderPercentByEventId()");
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI + '/' + eventId + '/gender', 
	        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside eventService.js + getGenderPercentByEventId() + function (response)");
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Gender Percent by event Id');
                console.log("Inside eventService.js + getGenderPercentByEventId() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    

    function getShiftPercentByEventId(eventId) {
    	console.log("Inside eventService.js + getShiftPercentByEventId()");
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI + '/' + eventId + '/shift', 
	        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside eventService.js + getShiftPercentByEventId() + function (response)");
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Shift Percent by event Id');
                console.log("Inside eventService.js + getShiftPercentByEventId() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    
    
    function getEventsByYear(year) {
    	console.log("Inside eventService.js + getEventsByYear()");
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/year/'+year, 
	        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside eventService.js + getEventsByYear() + function (response)");
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Events By Year');
                console.log("Inside eventService.js + getEventsByYear() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    
    function createEvent(event) {
    	console.log("Inside eventService.js + createEvent()");
    	console.error("(Javascript Object) event=" + event);
    	console.error("(JSON String) event=" + JSON.stringify(event))
        var deferred = $q.defer();
        var url = 'http://localhost:8080/AngularJS_REST_Spring5_Hibernate5_Jpa2_MappingRelation_ExceptionController_UnitTesting/admin/events';
        
        $http.post(url, JSON.stringify(event))
        .then(
	        function (response) {
	        	console.log("Inside eventService.js + createEvent() + function (response)");
	            deferred.resolve(response.data);
	        },
	        function(errResponse){
	            console.error('Error while creating Event');
	            console.log("Inside eventService.js + createEvent() + function (errResponse)");
	            deferred.reject(errResponse);
	        }
        );
        return deferred.promise;
    }
 
 
    function updateEvent(event, id) {
    	console.log("Inside eventService.js + updateEvent()");
    	console.log("id: " + id);
    	console.log("event: " + event);
        var deferred = $q.defer();
        var url = 'http://localhost:8080/AngularJS_REST_Spring5_Hibernate5_Jpa2_MappingRelation_ExceptionController_UnitTesting/admin/events';
        
        $http.put(url + "/" + id, event, config)
        .then(
	        function (response) {              
	            console.log("Inside eventService.js + updateEvent() + function (response)");
	            deferred.resolve(response.data);
	        },
	        function(errResponse){
	            console.error('Error while updating Event');
	            console.log("Inside eventService.js + updateEvent() + function (errResponse)");
	            deferred.reject(errResponse);
	        }
	    );
        return deferred.promise;
    }
 
    
    function deleteEvent(id) {
    	console.log("Inside eventService.js + deleteEvent()");
    	console.log("id: " + id);
        var deferred = $q.defer();
        
        $http({
        		method:'delete', 
        		url:'http://localhost:8080/AngularJS_REST_Spring5_Hibernate5_Jpa2_MappingRelation_ExceptionController_UnitTesting/admin/events'+'/'+id, 
        		headers:{}
        })
        .then(
	        function (response) {                
	            console.log("Inside eventService.js + deleteEvent() + function (response)");
	            console.log(response.data);
	            deferred.resolve(response.data);
	        },
	        function(errResponse){
	            console.error('Error while deleting Event');
	            console.log("Inside eventService.js + deleteEvent() + function (errResponse)");
	            deferred.reject(errResponse);
	        }
        );
        return deferred.promise;
    }
    

}]);