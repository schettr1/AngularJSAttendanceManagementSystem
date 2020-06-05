/**
 * inject dependencies inside square-bracket [] 
 * '$scope' object helps to bind data between controller and view 
 * while injecting dependency always use the name of controller or service instead of their filenames 
 *
 */ 

app.controller('LoginController', ['$scope', '$rootScope', '$location', 'LoginService', '$interval', '$timeout', 'jwtService', '$uibModal', '$localStorage',
						function($scope, $rootScope, $location, LoginService, $interval, $timeout, jwtService, $uibModal, $localStorage) {
	
    /* 1. DEFINE VARIABLES */
	var self = this;
	self.logger_credentials = {
			access_token: '',
			refresh_token: '',
			employeeId: '',
			roles: []
	};
    self.confirmationDialogConfig = {};
    self.authenticateUser = authenticateUser;	// function defined in the view
    self.flag_failedLogin = false;
    
    self.isRefreshTokenExpired = false;         // Display session expiration message when refresh_token expires
    self.sessionExpiredMsg = '';				
    
    

    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();		
       
    function init() {
    	// remove any user from rootStorage
        LoginService.removeUser();	
        
        // check whether refresh_token/session has expired
        self.isRefreshTokenExpired = localStorage.getItem('isRefreshTokenExpired');
        if(self.isRefreshTokenExpired) {
        	self.isRefreshTokenExpired = true;
        	self.sessionExpiredMsg = 'Your session has expired! Please login again.';
        	$timeout(function() {
        		self.sessionExpiredMsg = '';
        		self.isRefreshTokenExpired = false;
        		localStorage.removeItem('isRefreshTokenExpired');
             }, 2000);
        }  
        
    }


    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.authenticateUser = authenticateUser;
    
    

    /* 4. DEFINE FUNCTIONS */
    /**
     * VERIFY USER CREDENTIALS
     */
    function authenticateUser() {
    	self.dataLoading = true;
        LoginService.authenticateUser(self.username, self.password)
        .then(
            function(response) {           	
            	if(response.status == 401) {
                    self.flag_failedLogin = true;
                	self.dataLoading = false;
                }  
            	else {
            		self.logger_credentials = response.data;
                	console.log('self.logger_credentials=', self.logger_credentials);
	                LoginService.setUser(self.logger_credentials);
	            	//$rootScope.interval = $interval(checkTokenExpiration, 60 * 1000);		// call function 'checkTokenExpiration' every 60 seconds
	                $location.path('/home');  
            	}
            },
            function(errResponse){
            	self.dataLoading = false;
            	console.log('errResponse=' + errResponse);                        
            }
        );
    }
	
    
	
	/**
	 * CHECK ACCESS_TOKEN AND REFRESH_TOKEN EXPIRATION
	 * @call every 10 sec using $interval 
	 */
	function checkTokenExpiration() {  		
		var currentDate = new Date();
				
        // check refresh token expiry
        if(JSON.parse(localStorage.getItem('user')) != null) {	
        	var refresh_token = JSON.parse(localStorage.getItem('user')).refresh_token;
			var refresh_token_expiration = jwtService.getTokenExpirationDate(refresh_token);
			var isRefreshTokenExpired = jwtService.isTokenExpired(refresh_token);
			console.log('refresh_token_expiration=', refresh_token_expiration);
			console.error('Is refresh_token expired?', isRefreshTokenExpired); 
			var diff_refresh_token = moment(refresh_token_expiration).diff(moment(currentDate));
			console.log('diff_refresh_token=', diff_refresh_token);
			if(diff_refresh_token < 10000) {
				console.error("Refresh_token expiring in less than 10 sec.");
				whenExpiredRefreshToken();
				stopTimedInterval();
			}
		}				
    }
	
	
	
	/**
	 * STOP $INTERVAL SERVICE
	 */
    function stopTimedInterval() {
        $interval.cancel($rootScope.interval);
    };
    
    
    
    /**
     * DISPLAY MESSAGE WHEN REFRESH_TOKEN IS EXPIRED
     */
    function whenExpiredRefreshToken() {
		var expiredTokenModel = $uibModal.open({
			templateUrl : './static/modules/logout/views/token-expiration-modal.html',
			controller : function($uibModalInstance, $scope, $location) {		
				$scope.ok = function() {
					$uibModalInstance.close('Yes');
					$window.location.href='/AngularJs_RESTfulAttendanceMonitoringSystem/#!/login';		// go to login page
				};
				// wait 10 seconds to call sessionExpiredFunc
				$rootScope.interval = $interval(sessionExpiredFunc, 1*1000);		// call function 'checkTokenExpiration' every 1 min				
			}
		});
    }
    
    
    
    /**
     * SESSION EXPIRED
     */
    function sessionExpiredFunc() {
    	stopTimedInterval();
    	$location.path('/login');
    	LoginService.removeUser();
    }
    
    
}]);