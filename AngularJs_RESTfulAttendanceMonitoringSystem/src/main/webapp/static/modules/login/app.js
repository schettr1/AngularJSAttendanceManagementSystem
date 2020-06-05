var app = angular.module('login-module', [ 'ngCookies', 'ngStorage']);

app.directive('permission', ['LoginService', function(LoginService) {
   return {
       restrict: 'A',			// 'Attribute' directive
       scope: {permission: '='},	 
       link: function (scope, elem, attrs) {
            scope.$watch(LoginService.isLoggedIn(), function() {
                if (LoginService.hasUserPermission(scope.permission)) {
                    elem.show();
                } else {
                    elem.hide();
                }
            });                
       }
   }
}]);


app.run(function($rootScope, $location, Idle, $uibModal, LoginService) {	
    $rootScope.location = $location;	// use 'location' object to hide menu when displaying login page      
    /**
     * CHECKING VIEW PERMISSIONS
     */
    $rootScope.$on('$routeChangeStart', function (event, next) {
    	//var date = new Date();
    	//console.error('Next Route selected @ ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
        if (!LoginService.checkPermissionForView(next)){
        	console.error('checkPermissionForView === false');
            event.preventDefault();
            $location.path("/login");
        }
    });
 
});

