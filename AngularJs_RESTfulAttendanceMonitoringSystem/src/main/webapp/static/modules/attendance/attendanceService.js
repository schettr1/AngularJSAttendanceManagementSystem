app.factory('AttendanceService', ['$http', '$q', function($http, $q){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem";
    
    var factory = {
    	getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId: getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId,       
    	getAllEmployeesByEventIdAndByShift: getAllEmployeesByEventIdAndByShift,
        addEmployeeToEvent: addEmployeeToEvent,
        removeEmployeeFromEvent: removeEmployeeFromEvent,
        checkIfEmployeeIsPresentInEvent: checkIfEmployeeIsPresentInEvent,
        updateEventStatus: updateEventStatus
    };
    return factory;
        
    
    /**
     * GET ALL ACTIVE MEDTECHS (PRESENT+ABSENT) IN THE EVENT USING EVENT ID 
     * Medtechs could be those who attended the event and those who did not attend the event.
     * Those medtechs who attended the event will have {employeeId: 2001, eventId = 5001, ...}
     * Those medtechs who did not attend the event will have {employeeId: 2002, eventId = 0, ...}
     * @param eventId, employee_type
     * @return array of employees
     */
    function getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId(eventId) {
        var deferred = $q.defer();
        var employee_type = 3;      // medtechs only 
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/admin-or-supervisor/employees'+'/type/'+employee_type+'/events/'+eventId
        })
        .then(
            function (response) {
            	console.log('response=', response);
                deferred.resolve(response);
            },
            function(errResponse){
            	console.error('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    

    /**
     * GET ALL EMPLOYEES BY EVENT ID AND BY SHIFT
     * @param eventId, shift
     * @return array of employees
     */
    function getAllEmployeesByEventIdAndByShift(eventId, shift) {
    	console.log('shift=' + shift);
        var deferred = $q.defer();
        var employee_type = 3;      // medtechs
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/admin-or-supervisor/employees' + '/type/'+employee_type+'/shift/'+shift+'/events/'+eventId
        })
        .then(
            function (response) {
            	console.log('response=' + response);
                deferred.resolve(response);
            },
            function(errResponse){
            	console.error('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
    
    
        
    /**
     * ADD EMPLOYEE TO EVENT
     * @param eventId, employeeId
     * @return 
     */
    function addEmployeeToEvent(employeeId, eventId) {
    	console.log("Inside EmployeeService.js + addEmployeeToEvent()");
        var deferred = $q.defer();
        
        $http({
        		method:'put', 
        		url:REST_SERVICE_URI+'/admin/events/'+eventId+'/add/employees/'+employeeId
        })
        .then(
	        function (response) {                
	        	console.log('response=' + response);
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
     * REMOVE EMPLOYEE FROM EVENT
     * @param eventId, employeeId
     * @return updated result from database
     */
    function removeEmployeeFromEvent(employeeId, eventId) {
    	console.log("Inside EmployeeService.js + removeEmployeeFromEvent()");
        var deferred = $q.defer();
        
        $http({
        		method: 'put', 
        		url: REST_SERVICE_URI+'/admin/events/'+eventId+'/remove/employees/'+employeeId
        })
        .then(
	        function (response) {                
	        	console.log('response=' + response);
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
    	console.log("Inside EmployeeService.js + checkIfEmployeeIsPresentInEvent()");
    	var deferred = $q.defer();
        
        $http({
        		method:'get', 
        		url:REST_SERVICE_URI+'/employees/'+employeeId+'/events/'+eventId
        })
        .then(
	        function (response) {                
	        	console.log('response=' + response);
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
     * UPDATE EVENT STATUS
     * @param eventId
     * @return 
     */
    function updateEventStatus(eventId) {
    	console.log("Inside AttendanceService.js + updateEventStatus()");
    	var deferred = $q.defer();
    	var status = 1;	// completed status
    	
        $http({
        		method:'put', 
        		url:REST_SERVICE_URI+'/admin/events/'+eventId+'/status/'+status
        })
        .then(
	        function (response) {                
	        	console.log('response=' + response);
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