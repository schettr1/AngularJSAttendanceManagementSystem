app.controller('HomeController', [ '$scope', '$location', 'LoginService', 'EmployeeService', 'EmployeesService', 
	function($scope, $location, LoginService, EmployeeService, EmployeesService) {
	
	/* 1. DEFINE VARIABLES */
	var self = this;
	
	// find current location and set the class active in Navbar
	self.isActive = function(currentLocation) { 
        return currentLocation === $location.path();
    };
	
    self.employee = {
		    		employeeId: null, 
		    		firstname: '', 
		    		lastname: '', 
		    		email: '',
		    		birth: '', 
		    		gender: '', 
		    		shift: '', 
		    		enabled: '', 
		    		address: '', 
		    		username: '',
		    		password: '',
		    		supervisor: ''
    			};
     
    self.employeeTypes = ["MEDTECH", "SUPERVISOR", "ADMIN", "- - ALL - -"];
    self.selectedEmployeeType = "- - ALL - -";
       
    self.options = ["- - ALL - -", "DAY SHIFT", "EVENING SHIFT", "NIGHT SHIFT"];
    self.selectedOption = "- - ALL - -";					
    
    
    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
     
    function init() {
	    /* CALL METHODS WHEN PAGE IS LOADED */
	    if(LoginService.getUser()) {
	    	getEmployeeById(LoginService.getUser().employeeId);   
	    }
    }
	
       
    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.editFunc = editFunc;
    

    /* 4. DEFINE FUNCTIONS */
    /**
     * GET EMPLOYEE BY ID
     * @param employeeID
     * @return employee
     */
    function getEmployeeById(employeeId){
    	EmployeeService.getEmployeeById(employeeId)
            .then(
            function(response) {
                self.employee = response.data.employee;
                console.log('self.employee=', self.employee);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    

    /**
     * GO TO '/registerMedtech' URL
     * @param employeeId
     * @return 
     */
    function editFunc(employeeId){
    	$location.path('/registerEmployee/'+employeeId);  		
    }  
    
     
}]);