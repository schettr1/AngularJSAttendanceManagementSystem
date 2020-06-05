/**
 * inject dependencies inside square-bracket [] 
 * '$scope' object helps to bind data between controller and view 
 * while injecting dependency always use the name of controller or service instead of their filenames 
 *
 */ 

app.controller('AdminController', ['$scope', '$location', 'AdminService', function($scope, $location, AdminService) {
	
	console.log("Inside adminController.js");	
    
    /* DEFINE OBJECTS */
	var self = this;
    self.employee = {
		    		id:null, 
		    		firstname:'', 
		    		lastname:'', 
		    		email:'', 
		    		role:'', 
		    		birth:'', 
		    		gender:'', 
		    		shift:'', 
		    		active:'', 
		    		address:'', 
		    		username:'', 
		    		password:'',
		    		supervisor:''
    			};
    self.employees = [];
    
    
    /* LIST FUNCTIONS DEFINED IN THE VIEW */
    self.submitFunc = submitFunc;		// to submit form
    self.searchFunc = searchFunc;		// to search by employee id
    self.editFunc = editFunc;			// to edit employee by id
    self.removeFunc = removeFunc;		// to remove an employee by id
    self.resetFunc = resetFunc;			// to reset or clear the form fields
    
    
    /* CALL METHODS WHEN PAGE IS LOADED */
    getAllEmployees();	
    getAllEvents();
    
    
    /**
     * GET ALL EMPLOYEES
     * @return array of employees
     */
    function getAllEmployees(){
    	console.log("Inside adminController.js + getAllEmployees()");
        AdminService.getAllEmployees()
            .then(
            function(response) {
            	console.log("Inside adminController.js + getAllEmployees() +  function(response)");
                self.employees = response;
                console.log(self.employees);
                
            },
            function(errResponse){
                console.error('Error while fetching Employees');
                console.log("Inside adminController.js + getAllEmployees() + function(errResponse)");
            }
        );
    }

    
       
    /**
     * SAVE OR UPDATE EMPLOYEE BY EMPLOYEE ID
     * @param employee, employeeId
     */
    function submitFunc() {
    	console.log("Inside adminController.js + submit()");
        if(self.employee.id === null){
            console.log('Saving New Employee', self.employee);
            createEmployee(self.employee);
        }else{
            updateEmployee(self.employee, self.employee.id);
            console.log('Employee updated with id ', self.employee.id);
        }
        reset();
    }


    /**
     * CREATE NEW EMPLOYEE
     * @param id, firstname, lastname, role, shift, address, birth, gender, etc
     * @return array of employees
     */
    function createEmployee(employee){
    	console.log("Inside adminController.js + createEmployee()");
    	AdminService.createEmployee(employee)
            .then(
            getAllEmployees,
            function(errResponse){
                console.error('Error while creating Employee');
                console.log("Inside adminController.js + createEmployee() + function(errResponse)");
            }
        );
    }

    
    /**
     * UPDATE EMPLOYEE
     * @param firstname, lastname, role, shift, address, birth, gender, etc
     * @return array of employees
     */
    function updateEmployee(medtech, id){
    	console.log("Inside adminController.js + updateEmployee()");
    	AdminService.updateEmployee(medtech, id)
            .then(
            getAllEmployees,
            function(errResponse){
                console.error('Error while updating Employee');
                console.log("Inside adminController.js + updateEmployee() + function(errResponse)");
            }
        );
    }

    
    /**
     * LOAD EMPLOYEE FOR UPDATE
     * @param employeeId
     * @return employee 
     */
    function editFunc(id){
        console.log("Inside adminController.js + edit()");
        console.log('id to be edited:' + id);
        for(var i = 0; i < self.employees.length; i++){
            if(self.employees[i].employee.id === id) {
                self.employee = angular.copy(self.employees[i].employee);
                console.log(self.employee);
                break;
            }
        }
    }
 
    
    /**
     * SEARCH EMPLOYEE BY ID
     * @param employeeId
     * @return employee 
     */
    function searchFunc(){
        console.log("Inside adminController.js + search()");
        var id = document.getElementById('id').value;
        console.log('id to be searched:' + id);
        for(var i = 0; i < self.employees.length; i++){
            if(self.employees[i].employee.id === parseInt(id)) {
                self.employee = angular.copy(self.employees[i].employee);
                console.log(self.employee);
                break;
            }
            // if no input, reset the Form
            if(id == "" || id == null) {
            	console.log("call reset() method");
            	reset();
                break;
            }
        }
    }
    
    
    /**
     * CALL THE DELETE EMPLOYEE FUNCTION
     * @param employeeId
     */
    function removeFunc(id){
        console.log('Inside adminController.js + remove()'); 
        console.log('id to be removed: ' + id);
        if(self.employee.id === id) {
        	//clean form if the user to be deleted is shown there.
            reset();
        }
        deleteEmployee(id);
    }
 
    
    /**
     * DELETE EMPLOYEE
     * @param employeeId
     * @return array of employees
     */
    function deleteEmployee(id){
    	console.log("Inside adminController.js + deleteEmployee()");
    	AdminService.deleteEmployee(id)
            .then(
            getAllEmployees,
            function(errResponse){
                console.error('Error while deleting Employee');
                console.log("Inside adminController.js + deleteEmployee() + function(errResponse)");
            }
        );
    }
    
 
    /**
     * RESET OR CLEAR THE FORM
     */
    function resetFunc(){
        console.log('Inside adminController.js + reset()');
        self.employee = {
	    		id:null, 
	    		firstname:'', 
	    		lastname:'', 
	    		email:'', 
	    		role:'', 
	    		birth:'', 
	    		gender:'', 
	    		shift:'', 
	    		active:'', 
	    		address:'', 
	    		username:'', 
	    		password:'',
	    		supervisor:''
			};
        $scope.myForm.$setPristine(); //reset Form
    }

    
}]);