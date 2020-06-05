app.controller('ResetPasswordController', ['$scope', '$timeout', 'ResetPasswordService', '$routeParams', '$location', '$uibModal', 'EmployeeService',
					function($scope, $timeout, ResetPasswordService, $routeParams, $location, $uibModal, EmployeeService) {
	
    /* 1. DEFINE VARIABLES */
	var self = this;
    self.email = '';
    self.employee = {};
    self.password = '';
    self.confirm_password = '';
    self.password_pattern = /^[a-zA-Z]\w{3,14}$/ ;
    self.alertMsg = '';       						// alert message when token is expired
    self.isTokenExpiredForPasswordReset = false; 

    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
    
    function init() {        
        /* get token from URL inside app.js */
        if($routeParams.token) {
    	    self.myToken = $routeParams.token;
    	    console.error('self.myToken=', self.myToken);
    	    // verify whether token is expired
    	    verifyPasswordResetToken(self.myToken);
        }
        
        /* get selectedEmployeeId from HomeController + changePasswordFunc() */
        var urlParams = $location.search(); 
        if(urlParams.selectedEmployeeId != undefined) {
        	self.selectedEmployeeId = urlParams.selectedEmployeeId;
        	getEmployeeById();
        }
    }
    
    
    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.sendPasswordResetLinkFunc = sendPasswordResetLinkFunc;
    self.tokenBasedNewPasswordSubmitFunc = tokenBasedNewPasswordSubmitFunc;			// token based password reset
    self.submitLoggedInUserRequestedPasswordChangeFunc = submitLoggedInUserRequestedPasswordChangeFunc;		// logged in user requested password reset
    self.comparePassword = comparePassword;
       
   

    /* 4. DEFINE FUNCTIONS */
    /**
     * SEND PASSWORD RESET LINK TO AN EMAIL
     */
    function sendPasswordResetLinkFunc() {
    	console.error('email=', self.email);
    	ResetPasswordService.sendPasswordResetLink(self.email)
		.then(
			function(response) {
            	if(response.status === 200) {
            		self.alertMsg = 'Password reset link has been sent to the provided email';                	
            		self.email = '';
                	$scope.resetPasswordLinkForm.$setPristine(); 		
                    $scope.resetPasswordLinkForm.$setValidity();	// all 3 are required to reset the form
                    $scope.resetPasswordLinkForm.$setUntouched();
            		$timeout(function() {
                		self.alertMsg = '';
                     }, 2000);
            	}
			},
			function(errResponse) {
				console.log('errResponse=' + errResponse);
			}    			
    	);
    }
    
    
    
    /**
     * VERIFY PASSWORD RESET TOKEN
     * only after password reset token is verified,
     * client displays 'change-password-form' page where
     * user can update the password
     */
    function verifyPasswordResetToken(token) {
    	ResetPasswordService.verifyPasswordResetToken(token)
        .then(
            function(response) {  
            	if(response.status == 200) {
            		self.employee = response.data;
                	console.log('self.employee=', self.employee);
            	}
            	else if (response.status == 401) {
            		console.log('response=', response.data.message);
            		self.isTokenExpiredForPasswordReset = true;
            		self.alertMsg = response.data.message;
            	}
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * COMPARE PASSWORD
     */
    function comparePassword() {   
        self.isMatch = self.password == self.confirm_password ? true : false;   
    }   
    
    
    /**
     * SUBMIT NEW PASSWORD
     */
    function tokenBasedNewPasswordSubmitFunc() {  	
    	self.employee.password = self.password;  
    	console.error('self.employee=', self.employee);
    	ResetPasswordService.tokenBasedNewPasswordSubmitFunc(self.employee)
        .then(
            function(response) {          	
            	console.error(response);
            	var updatedPasswordModel = $uibModal.open({
        			templateUrl : './static/modules/reset-password/views/updated-password-modal.html',
        			controller : function($uibModalInstance, $scope, $location) {		
        				$scope.ok = function() {
        					$uibModalInstance.close('Yes');
        					$location.path('/login');		// redirect to login page
        				};
        			}
        		}); 
				$location.path('/login');		// redirect to login page even if user does not click on okay
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * SUBMIT NEW PASSWORD BY LOGGED USER
     */
    function submitLoggedInUserRequestedPasswordChangeFunc() {
    	self.employee.password = self.password;   	
    	ResetPasswordService.updateLoggedInUserPasswordFunc(self.employee)
        .then(
            function(response) {          	
            	console.log(response);
            	var updatedPasswordModel = $uibModal.open({
        			templateUrl : './static/modules/reset-password/views/updated-password-modal.html',
        			controller : function($uibModalInstance, $scope, $location) {		
        				$scope.ok = function() {
        					$uibModalInstance.close('Yes');
        					$location.path('/login');		// redirect to login page
        				};
        			}
        		}); 
				$location.path('/login');		// redirect to login page even if user does not click on okay
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * GET EMPLOYEE BY ID (used for changing password by logged user only)
     * @param employeeID
     * @return employee
     */
    function getEmployeeById(){
    	EmployeeService.getEmployeeById(self.selectedEmployeeId)
        .then(
            function(response) {
            	self.foundEmployee = response.data.employee;           	
            	console.error('self.foundEmployee=', self.foundEmployee); 
            	// use employee instead of foundEmployee to send JSON object while updating password 
            	self.employee.address = self.foundEmployee.address;
            	self.employee.birth = 243489600000;
            	self.employee.email = self.foundEmployee.email;
            	self.employee.employeeId = self.foundEmployee.employeeId;
            	self.employee.enabled = self.foundEmployee.enabled;
            	self.employee.gender = self.foundEmployee.gender;
            	self.employee.firstname = self.foundEmployee.firstname;
            	self.employee.lastname = self.foundEmployee.lastname;
            	self.employee.password = null;
            	self.employee.shift = self.foundEmployee.shift;
            	self.employee.supervisor = null;
            	self.employee.username = self.foundEmployee.username;           	
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
}]);