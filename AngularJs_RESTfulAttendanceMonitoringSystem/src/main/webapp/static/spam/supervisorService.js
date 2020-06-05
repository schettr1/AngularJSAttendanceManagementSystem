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

app.factory('SupervisorService', ['$http', '$q', function($http, $q){
 
	console.log("Inside supervisorService.js");

	/**
    var REST_SERVICE_URI = "http://localhost:8080/AngularJS_REST_Spring5_Hibernate5_Jpa2_MappingRelation_ExceptionController_UnitTesting/admin/employees";
 
    var factory = {
        getAllSupervisors: getAllSupervisors       
    };
 
    return factory;
 
    function getAllSupervisors() {
    	console.log("Inside supervisorService.js + getAllSupervisors()");
        var deferred = $q.defer();
        var employee_type = 2;
        
        $http({
	        	method: 'get', 
	        	url: REST_SERVICE_URI+'/type?value='+employee_type, 
	        	headers: { 'Content-Type': 'application/json' }
        })
        .then(
            function (response) {
            	console.log("Inside supervisorService.js + getAllSupervisors() + function (response)");
                deferred.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching Supervisors');
                console.log("Inside supervisorService.js + getAllSupervisors() + function (errResponse)");
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }
 
    */
    
}]);