var app = angular.module('logout-module', [ 'ui.bootstrap', 'ngIdle' ]);


app.config(['IdleProvider', '$provide', function(IdleProvider, $provide) {
	
	// configure Idle settings
    IdleProvider.idle(360);
    IdleProvider.timeout(30);		// idle timeout in 10 seconds 
    
}]);


app.run(function($rootScope, Idle, $uibModal) {	   
    /**
	 * NOTE: Idle.watch() is placed in HomeController and not in app.run() because we do not want to start Idle.watch()  
	 * when user is in login page. Only when user is logged in and arrived at home page, we want to start Idle.watch()
	 */		
	
    $rootScope.$on('IdleStart', function() { 
    	/* Display idle-warning-modal here */ 
    	$rootScope.uibModalInstance_warning = $uibModal.open({
			templateUrl : './static/modules/logout/views/idle-warning-modal.html',
			controller : function($uibModalInstance, $scope, $location) {
				// define ok() function
				$scope.ok = function() {
					$uibModalInstance.close('Ok');
					$location.path('/login');		// redirect to login page
				};
				// define cancel() function
				$scope.cancel = function() {
					$uibModalInstance.dismiss('cancel');
				};
			}
		});
    });
    

    $rootScope.$on('IdleEnd', function() {
    	//console.log('User is Active again');
		//$rootScope.uibModalInstance_warning.close();
    }); 
    
    
    $rootScope.$on('IdleTimeout', function() { 
    	/* Display idle-timeout-modal here */
    	$rootScope.uibModalInstance_timeout = $uibModal.open({
			templateUrl : './static/modules/logout/views/idle-timeout-modal.html',
			controller : function($uibModalInstance, $scope, $location) {
				// define ok() function
				$scope.ok = function() {
					$uibModalInstance.close('Ok');
					window.location.reload(false);
					$location.path('/login');		
					$rootScope.uibModalInstance_warning.close();
				};
				// even if user does not press 'ok' button still perform these steps
				$location.path('/login');		
				$rootScope.uibModalInstance_warning.close();
			}
		});
    });    
});

