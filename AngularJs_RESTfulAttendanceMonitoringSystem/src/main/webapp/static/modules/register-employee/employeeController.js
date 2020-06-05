app.controller('EmployeeController', ['$scope', '$routeParams', '$location', '$window', '$rootScope', '$timeout', 'EmployeeService', 'RootStorage', 
	function($scope, $routeParams, $location, $window, $rootScope, $timeout, EmployeeService, RootStorage) {
	
    /* 1. DEFINE VARIABLES */
	var self = this;
	self.employee = {};		
    self.employees = [];

    self.roles = ["MEDTECH", "SUPERVISOR", "ADMIN"];
    //self.medtech.role = "Medtech";
    self.genders = ["MALE", "FEMALE", "OTHER"];
    //self.medtech.gender = "Male";
    self.shifts = ["DAY", "EVENING", "NIGHT"];
    //self.medtech.shift = "Day";
    
    self.options = ["- - ALL - -", "DAY SHIFT", "EVENING SHIFT", "NIGHT SHIFT"];
    self.selectedOption = "- - ALL - -";
    self.checkboxModel = {};		// checkboxModel is an object which can hold a value inside the {}, checkboxModel[] is an array that can hold
    								// any number of checkboxModel objects, and checkboxModel[0] is an array element which contains a checkboxModel object.  
    
    self.selectedEmployeeId;        // get selectedEmployeeId from URL param
    self.selectedEmployee;			

    self.loggedUser = JSON.parse(localStorage.getItem('user'));		// if ctrl.loggedUser.employeeId != ctrl.selectedEmployeeId, hide 'change password?' button
    
    /* FORM VALIDATION */
    self.email_pattern = /^[A-Za-z0-9._%+-]+@gmail.com$/ ;		// domain specific email
    self.password_pattern = /^[a-zA-Z]\w{3,14}$/ ;
    self.form_data = {};		// to store form data in case flag/error occurs and we need to re-store those data in the form
    initializeFlags();			// call method 
    
    self.alertMsg = '';       // alert message when event is created, updated, deleted
    

    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
    
    function init() {
        /* url params */
        var paramEmployeeId = parseInt($routeParams.employeeId);
        if(paramEmployeeId != 0) {
        	self.selectedEmployeeId = paramEmployeeId;
        	console.log("selectedEmployeeId=" + self.selectedEmployeeId);  	
        	getEmployeeById(self.selectedEmployeeId);	// calling method
        	self.isUserAdmin = JSON.parse(localStorage.getItem('user')).roles.includes('ROLE_ADMIN');			// isUserAdmin can only update employee info
        	console.log("isUserAdmin=" + self.isUserAdmin); 
        }      
        
        self.loggedUserId = parseInt(JSON.parse(localStorage.getItem('user')).employeeId);
        self.loggedUserRoles = JSON.parse(localStorage.getItem('user')).roles;
    }



    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.submitFunc = submitFunc;		// to submit form
    self.removeFunc = removeFunc;		// to remove an employee by id
    self.resetFunc = resetFunc;			// to reset or clear the form fields
    
    

    /* 4. DEFINE FUNCTIONS */
	/**
	 * confirm page change if the form is dirty 
	 */
    $scope.myForm = {};											// to get rid of TypeError: undefined $pristine
	$scope.$on('$locationChangeStart', function(event) {
		//if(!$scope.myForm.$pristine) {						-> AVOID: this line of code brings pop up box twice
		if($scope.myForm.$dirty) {
	        var answer = confirm("All unsaved data will be lost. Are you sure you want to leave this page?");
	        if (!answer) {
	            event.preventDefault();
	        }
		}
    });
	
	
    /**
     * GET EMPLOYEE BY ID (while updating the Employee)
     * @param employeeID
     * @return employee
     */
    function getEmployeeById(employeeId){
    	EmployeeService.getEmployeeById(employeeId)
        .then(
            function(response) {
                var employee = response.data.employee;
                employee.birth = new Date(employee.birth);                  	// change String birth to Date format             
                employee.employee_type = employee.employee_type.toUpperCase();   // change employee_type from "Admin" to "ADMIN"               
                employee.gender = employee.gender.toUpperCase();              // change gender from "Male" to "MALE"               
                employee.shift = employee.shift.toUpperCase();            // change shift from "Day" to "DAY"                
                employee.password = "dummy";                             // set dummy password to display in the form; it will not be updated 
                self.employee = employee;
            },
            function(errResponse){
                console.log('errResponse=' + errResponse);
            }
        );
    }
    
	
    /**
     * 1. SUBMIT FORM DATA 
     * @param Employee
     */
    function submitFunc(e) {
    	e.preventDefault();    // to prevent refresh page after form is submitted by default
    	
    	// remove old flags when form is re-submitted
    	initializeFlags(); 
        
    	// store form data in 'self.form_data' in case flag/error occurs and we need to re-store those data in the form
    	self.form_data = angular.copy(self.employee);
    	
    	// UPDATE EMPLOYEE
    	if(self.selectedEmployeeId != undefined) {  		
    		console.log('Update Employee=', self.employee);
    		console.log('Update employee_type=', self.employee.employee_type);
    		updateEmployee(self.employee, self.employee.employee_type);
    	}    	
    	else {   // CREATE NEW EMPLOYEE      	
            self.employee.employeeId = parseInt(self.employee.employeeId);
            console.log('New Employee=', self.employee);
            createEmployee();						// call method 
    	}   	   	    	        
    }
	
	    
    /**
     * 2. CREATE NEW EMPLOYEE
     * @param employee
     * @return 
     */
    function createEmployee(){
        if (self.employee.employee_type == 'ADMIN') {
        	createAdmin();										// call method
        }
        else if (self.employee.employee_type == 'SUPERVISOR') {
        	createSupervisor();									// call method
        }
        else if (self.employee.employee_type == 'MEDTECH') {
        	createMedtech();									// call method
        }
    }    
    
    
    /**
     * 3. CREATE ADMIN
     * @param employee
     * @return 
     */
    function createAdmin(){
    	EmployeeService.createAdmin(self.employee)
        .then(
    		function(response) {
    			if(response.status == 201) {
    				console.log('new admin=', response);
        			resetFunc();
        			self.alertMsg = 'Employee successfully created.';
                	$timeout(function() {
                		self.alertMsg = '';
                		//$window.location.reload(false);			// reload the page             		
                		//$location.path('/registerMedtech');  THIS ALSO REFRESH THE PAGE BUT FORM EXIHIBIT WEIRD BEHAVIOR
                     }, 2000);
    			}
    			if(response.status == 400) {
        			self.error_existsUsername = response.data.message;
        			self.flag_existsUsername = true;
        			console.error('self.form_data=', self.form_data);
        			//self.employee = self.form_data;
    			}
    			
    		},
            function(errResponse){
    			console.log('errResponse=' + errResponse);
                
                // restore the saved form data 
                self.employee = angular.copy(self.form_data);
            	
            	// CATCH EXCEPTION AND ALERT IN THE VIEW
            	if(errResponse.data.message == 'employeeId already exist') {                   
                    self.flag_existsEmployeeId = true;
                    self.error_existsEmployeeId = errResponse.data.message;  
            	}
            	else if(errResponse.data.message == 'username already exist') {
                    self.flag_existsUsername = true;
                    self.error_existsUsername = errResponse.data.message; 
            	}
            	else if(errResponse.data.message == 'supervisor cannot be active') {
                    self.flag_activeSupervisor = true;
                    self.error_activeSupervisor = errResponse.data.message; 
            	}  
            }
        );
    }
    
    
    /**
     * 3. CREATE SUPERVISOR
     * @param employee
     * @return 
     */
    function createSupervisor(){
    	EmployeeService.createSupervisor(self.employee)
        .then(
    		function(response) {
    			if(response.status == 201) {
    				console.log('new supervisor=', response);
        			resetFunc();
        			self.alertMsg = 'Employee successfully created.';
                	$timeout(function() {
                		self.alertMsg = '';
                		//$window.location.reload(false);			// reload the page             		
                		//$location.path('/registerMedtech');  THIS ALSO REFRESH THE PAGE BUT FORM EXIHIBIT WEIRD BEHAVIOR
                     }, 2000);
    			}
    			if(response.status == 400) {
        			self.error_existsUsername = response.data.message;
        			self.flag_existsUsername = true;
        			console.error('self.form_data=', self.form_data);
        			//self.employee = self.form_data;
    			}
    		},
            function(errResponse){
    			console.log('errResponse=' + errResponse);
                
                // restore the saved form data 
                self.employee = angular.copy(self.form_data);
            	
            	// CATCH EXCEPTION AND ALERT IN THE VIEW
            	if(errResponse.data.message == 'employeeId already exist') {                   
                    self.flag_existsEmployeeId = true;
                    self.error_existsEmployeeId = errResponse.data.message;  
            	}
            	else if(errResponse.data.message == 'username already exist') {
                    self.flag_existsUsername = true;
                    self.error_existsUsername = errResponse.data.message; 
            	}
            	else if(errResponse.data.message == 'supervisor cannot be active') {
                    self.flag_activeSupervisor = true;
                    self.error_activeSupervisor = errResponse.data.message; 
            	}   
            }
        );
    }
    
    
    /**
     * 3. CREATE MEDTECH
     * @param employee
     * @return 
     */
    function createMedtech(){
    	EmployeeService.createMedtech(self.employee)
        .then(
    		function(response) {
    			if(response.status == 201) {
    				console.log('new medtech=', response);
        			resetFunc();
        			self.alertMsg = 'Employee successfully created.';
                	$timeout(function() {
                		self.alertMsg = '';
                		//$window.location.reload(false);			// reload the page             		
                		//$location.path('/registerMedtech');  THIS ALSO REFRESH THE PAGE BUT FORM EXIHIBIT WEIRD BEHAVIOR
                     }, 2000);
    			}
    			if(response.status == 400) {
        			self.error_existsUsername = response.data.message;
        			self.flag_existsUsername = true;
        			console.error('self.form_data=', self.form_data);
        			//self.employee = self.form_data;
    			}
    		},
            function(errResponse){
    			console.log('errResponse=', errResponse);
            	
                // restore the saved form data 
                self.employee = angular.copy(self.form_data);
            	
            	// CATCH EXCEPTION AND ALERT IN THE VIEW
            	if(errResponse.data.message == 'employeeId already exist') {                   
                    self.flag_existsEmployeeId = true;
                    self.error_existsEmployeeId = errResponse.data.message;  
            	}
            	else if(errResponse.data.message == 'username already exist') {
                    self.flag_existsUsername = true;
                    self.error_existsUsername = errResponse.data.message; 
            	}
            	else if(errResponse.data.message == 'supervisor cannot be active') {
                    self.flag_activeSupervisor = true;
                    self.error_activeSupervisor = errResponse.data.message; 
            	}        
            }
        );
    }
    
    
    /**
     * 2. UPDATE EMPLOYEE
     * @param firstname, lastname, role, shift, address, birth, gender, etc
     * @return list of employees
     */
    function updateEmployee(employee, employee_type){ 
    	EmployeeService.updateEmployee(employee, employee_type)
        .then(
    		function(response) {
    			if(response.status == 200) { 
                	self.alertMsg = 'Updated successfully!';
    				// if admin updates his info, go to '/home' 
                    if(JSON.parse(localStorage.getItem('user')).employeeId === parseInt(self.selectedEmployeeId)) {    
                		$timeout(function() {
                    		self.alertMsg = '';
                    		resetFunc();
                    		$location.path('/home');	// home page url
                         }, 2000);                  	
                	} 
                    // if admin updates other employee info, then go to '/employees' 
                    else { 
                		$timeout(function() {
                    		self.alertMsg = '';
                    		resetFunc();
                    		$location.path('/employees');	// home page url
                         }, 2000);                   			
                    }                  		
            	}
    			if(response.status == 400) {
        			self.alertMsg = response.data.message;
                	$timeout(function() {
                		self.alertMsg = '';
                     }, 2000);
    			}
                console.log('response=', response);                       
    		},
            function(errResponse){  
                console.log('errResponse=' + errResponse);
                
                // load 'form_data' values back in the form
                self.employee.employeeId = self.form_data.employeeId;
            	self.employee.firstname = self.form_data.firstname;
            	self.employee.lastname = self.form_data.lastname;
            	self.employee.email = self.form_data.email;
            	self.employee.birth = self.form_data.birth;
            	self.employee.gender = self.form_data.gender;
            	self.employee.employee_type = self.form_data.employee_type;
            	self.employee.shift = self.form_data.shift;
            	self.employee.enabled = null;
            	self.employee.address = self.form_data.address;
            	self.employee.username = self.form_data.username;
            	self.employee.password = self.form_data.password;
            	self.employee.supervisor = null;
            	
            	// CATCH EXCEPTION AND ALERT IN THE VIEW
            	if(errResponse.data.message == 'Active Supervisor not allowed to change shift') { 
                    self.flag_activeSupervisorShiftChange = true;
                    self.error_activeSupervisorShiftChange = errResponse.data.message;  
                }
            }
        );
    }


    
    /**
     * CALLING DELETE EMPLOYEE FUNCTION
     * @param medtechId
     */
    function removeFunc(id){
        console.log('id to be removed=' + id);
        if(self.employee.id === id) {
        	//clear form if the user to be deleted is shown there.
            resetFunc();
        }
        deleteEmployee(id);
    }
 
    
    /**
     * DELETE EMPLOYEE
     * @param employeeId
     * @return list of employees
     */
    function deleteEmployee(id){
    	EmployeeService.deleteEmployee(id)
        .then(
    		function(response) {
    			$location.path('/employees');	// go to '/employees' URL
    		},
            function(errResponse){
    			console.log('errResponse=' + errResponse);
            }
        );
    }
    
 
    /**
     * initialize myForm flags
     */
    function initializeFlags() {
        self.flag_existsEmployeeId = false;
        self.error_existsEmployeeId = '';
        self.flag_existsUsername = false;
        self.error_existsUsername = '';
        self.flag_activeSupervisor = false;
        self.error_activeSupervisor = ''; 
        self.flag_activeSupervisorShiftChange = false;
        self.error_activeSupervisorShiftChange = '';  
    	self.flag_employeeCreation = false;
    	self.success_employeeCreation = '';
    }
    
    
    /**
     * RESET OR CLEAR THE FORM
     */
    function resetFunc(){
        // clear form data  Using self.employee={} will not clear the data
    	self.employee = {
	    		employeeId: null, 
	    		firstname: '', 
	    		lastname: '', 
	    		email: '',
	    		birth: '', 
	    		gender: '',
	    		employee_type: '',
	    		shift: '', 
	    		enabled: null, 
	    		address: '', 
	    		username: '',
	    		password: '',
	    		supervisor: null
			};
    	
        self.form_data = {};
        $scope.myForm.$setPristine(); 		
        $scope.myForm.$setValidity();	// all 3 are required to reset the form
        $scope.myForm.$setUntouched();
        
    }

    

}]);










