app.factory('EmployeesService', ['$http', '$q', function($http, $q){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/employees";
    
    // contains methods that handle employees[]
    var factory = {
    	getAllEmployees: getAllEmployees,
    	getEmployeesByType: getEmployeesByType,
        getAllMedtechsAndEventId: getAllMedtechsAndEventId,
        getEventsByEmployeeId: getEventsByEmployeeId,
        getEmployeesByShift: getEmployeesByShift,
        listAllEmployeesBySupervisorId: listAllEmployeesBySupervisorId
        
    };
    return factory;
    

    /**
     * LIST ALL EMPLOYEES 
     * @return array of employees
     */
    function getAllEmployees() {
        var deferred = $q.defer();
        var employee_type = 3;	// medtechs
        
        $http({
	        	method: 'get', 
	        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/employees'
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
     * LIST EMPLOYEES BY TYPE 
     * @param employee_type
     * @return array of employees
     */
    function getEmployeesByType(type) {
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/employees'+'/type?value='+type
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
     * GET ALL MEDTECHS AND EVENTID_FK COLUMN (EMPLOYEES INNER JOIN EVENTS_EMPLOYEES)
     * @param eventId
     * @return array of employees and eventId_FK
     */
    function getAllMedtechsAndEventId(eventId) {
        var deferred = $q.defer();
        var employee_type = 3;      // medtechs
        
        $http({
	        	method: 'get', 
	        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/employees'+'/type/'+employee_type+'/events/'+eventId
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
     * GET EVENTS BY EMPLOYEE ID 
     * @param employee ID 
     * @return array of events
     */
    function getEventsByEmployeeId(employeeId) {
    	console.error("employeeId=" + employeeId);
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/events/employees/'+employeeId
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
     * GET EMPLOYEES BY SHIFT
     * @param shiftId [{0, Day}, {1, Evening}, {2, Night}]
     * @return array of employees
     */
    function getEmployeesByShift(shiftId) {
    	console.log("shiftId=" + shiftId);
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/shift/'+shiftId
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
     * GET EMPLOYEES BY SUPERVISOR ID
     * @param supervisorId
     * @return array of employees
     */
    function listAllEmployeesBySupervisorId(supervisorId) {
    	console.log("supervisorId= " + supervisorId);
        var deferred = $q.defer();
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/supervisors/'+supervisorId
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