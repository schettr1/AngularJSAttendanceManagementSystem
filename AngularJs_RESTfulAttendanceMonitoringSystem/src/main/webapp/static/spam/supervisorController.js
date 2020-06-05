/**
 * inject dependencies inside square-bracket [] 
 * '$scope' object helps to bind data between controller and view 
 * while injecting dependency always use the name of controller or service instead of their filenames 
 *
 */ 

app.controller('SupervisorController', ['$scope', '$location', 'SupervisorService', function($scope, $location, SupervisorService) {
	
	console.log("Inside supervisorController.js");	
    
	/**
	var self = this;
    self.employee = {
		    		employeeId: null, 
		    		firstname: '', 
		    		lastname: '', 
		    		email: '', 
		    		employee_type: '', 
		    		birth: '', 
		    		gender: '', 
		    		shift: '', 
		    		enabled: '', 
		    		address: '', 
		    		username: '', 
		    		password: '',
		    		supervisor: ''
    			};
    self.employees = [];
    self.supervisor_employees = [];
    
    
    self.listEmployeesBySupervisorFunc = listEmployeesBySupervisorFunc;
    
    
    getAllSupervisors();
    

    function getAllSupervisors(){
    	console.log("Inside supervisorController.js + getAllSupervisors()");
        SupervisorService.getAllSupervisors()
            .then(
            function(response) {
            	console.log("Inside supervisorController.js + getAllSupervisors() +  function(response)");
                self.employees = response;
                console.log(self.employees);
                
            },
            function(errResponse){
                console.error('Error while fetching Supervisors');
                console.log("Inside supervisorController.js + getAllSupervisors() + function(errResponse)");
            }
        );
    }
    
    
    function listAllEmployeesBySupervisorId(id){
    	console.log("Inside supervisorController.js + listAllEmployeesBySupervisorId()");
        EmployeeService.listAllEmployeesBySupervisorId(id)
            .then(
            function(response) {
            	console.log("Inside supervisorController.js + listAllEmployeesBySupervisorId() +  function(response)");
                self.supervisor_employees = response;
                console.log(self.supervisor_employees);
                
            },
            function(errResponse){
                console.error('Error while fetching Employees by SupervisorID');
                console.log("Inside supervisorController.js + listAllEmployeesBySupervisorId() + function(errResponse)");
            }
        );
    }
    
    function listEmployeesBySupervisorFunc(selectedSupervisorId){
    	console.log("Inside supervisorController.js + listEmployeesBySupervisorFunc()");
    	console.log("selectedSupervisorId=" + selectedSupervisorId);
    	$location.path('/supervisors/medtechs').search({selectedSupervisorId: String(selectedSupervisorId)});  	// specify filename inside .path() and pass parameter by inside .search()
   
    }    

    */
    
}]);