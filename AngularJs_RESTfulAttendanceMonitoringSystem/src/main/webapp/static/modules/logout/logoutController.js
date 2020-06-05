app.controller('LogoutController', [ '$scope', '$window', '$rootScope', '$uibModal', '$location', 
	function($scope, $window, $rootScope, $uibModal, $location) {

    /* 1. DEFINE VARIABLES */
	var self = this;
	
	
    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
	init();
	
	function init () {
		
	}
	
	
    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
	self.signOut = signOut;	
	
	

    /* 4. DEFINE FUNCTIONS */		
    /**
     * WHEN USER SIGN OUT
     */
	function signOut() {
		var signOutModel = $uibModal.open({
			templateUrl : './static/modules/logout/views/logout-modal.html',
			controller : function($uibModalInstance, $scope, $location) {
				$scope.ok = function() {
					$uibModalInstance.close('Yes');
					$window.location.href='/AngularJs_RESTfulAttendanceMonitoringSystem/#!/login';		// go to login page
					//$location.path('/login');		// it fails sometimes and the url-parameter from previous path is carried to next path as well.
					
				};
				$scope.cancel = function() {
					$uibModalInstance.close('No');
				};
			}
		});
	};
	
	

}]);