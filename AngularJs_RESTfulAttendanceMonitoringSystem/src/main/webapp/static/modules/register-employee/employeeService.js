app.factory('EmployeeService', ['$http', '$q', 'RootStorage', function($http, $q, RootStorage){
 
    var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/employees";
    
    // contains methods that handle employee only
    var factory = {
        getEmployeeById: getEmployeeById,
        createEmployee: createEmployee,
        createAdmin: createAdmin,
        createSupervisor: createSupervisor,
        createMedtech: createMedtech,
        updateEmployee: updateEmployee,
        deleteEmployee: deleteEmployee,
        changeEmployeeStatus: changeEmployeeStatus
    };
    return factory;
    
    
    /**
     * GET EMPLOYEE BY ID
     * @param  employeeId
     * @return employee
     */
    function getEmployeeById(employeeId) {
    	var deferred = $q.defer();
        
        $http({
        		method:'get', 
        		url: REST_SERVICE_URI + '/' + employeeId
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
     * 1. CREATE NEW EMPLOYEE
     * @param employee
     * @return array of employees
     */
    function createEmployee(employee) {

        if (employee.employee_type == 'ADMIN') {
        	return createAdmin(employee);	// call method
        }
        else if (employee.employee_type == 'SUPERVISOR') {
        	return createSupervisor(employee);	// call method
        }
        else if (employee.employee_type == 'MEDTECH') {
        	return createMedtech(employee);	// call method
        }

    }
 

    /**
     * 2. CREATE ADMIN
     * @param employee
     * @return array of employees
     */
    function createAdmin(employee) {
    	console.log("employee= ", employee);
    	
        var deferred = $q.defer();        
        $http({
    		method: 'post', 
    		url: "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/admins", 
    		data: employee
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
     * 2. CREATE SUPERVISOR
     * @param employee
     * @return array of employees
     */
    function createSupervisor(employee) {
    	console.log("employee= ", employee);
    	
        var deferred = $q.defer();       
        $http({
    		method: 'post', 
    		url: "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/supervisors", 
    		data: employee
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
     * 2. CREATE MEDTECH
     * @param employee
     * @return array of employees
     */
    function createMedtech(employee) {
    	console.log("JSON.stringify(employee)= ", JSON.stringify(employee));
    	
        var deferred = $q.defer();
        $http({
        	method: 'post', 
        	url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/medtechs',
        	data: JSON.stringify(employee)	        	
        })
        .then(
	        function (response) {
	            console.log('response=', response);
	            deferred.resolve(response);
	        }
	    )
	    .catch(
	    	function(errResponse){
	    		console.log('errResponse=' + errResponse);
	            deferred.reject(errResponse);             
	        }
        );
        
        return deferred.promise;
    }
    
    
    /**
     * UPDATE EMPLOYEE
     * @param employeeId, employee
     * @return 
     */
    function updateEmployee(employee, employee_type) {
    	console.log("employee=", employee);
    	console.log("employee_type= ", employee_type);
    	
        var deferred = $q.defer();        
        $http({
    		method: 'put', 
    		url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/employees/employee_type?employee_type=' + employee_type, 
    		data: employee
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
 
    
    function deleteEmployee(id) {
    	console.log("id: " + id);
    	
        var deferred = $q.defer();       
        $http({
        		method:'delete', 
        		url:REST_SERVICE_URI+'/'+id
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
     * CHANGE EMPLOYEE STATUS
     * @param  employeeId
     * @return employee
     */
    function changeEmployeeStatus(employeeId) {
    	var deferred = $q.defer();
        
        $http({
        		method: 'put', 
        		url: 'http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/admin/employees/'+employeeId+'/status'
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