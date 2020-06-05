/** insert dependencies in the square-brackets [] 
 * var app = angular.module('myApp', []);
 * ngRoute --> $routeProvider
 * ngCookies --> $cookieStore
 * zingchart-angularjs --> zingchart
 * ui.bootstrap --> $uibModal
 * ngIdle --> IdleProvider
 */ 

var app = angular.module('app-module', [  'register-event-module', 'events-module', 'register-employee-module', 'employees-module',
		'event-piechart-module', 'event-barchart-module',  'attendance-module', 'login-module', 'logout-module', 'email-module', 
			'home-module', 'reset-password-module', 'ngRoute', 'zingchart-angularjs', 'ui.bootstrap' ]);


/* configure interceptor using '$httpProvider' */
app.config(['$httpProvider', function($httpProvider) {
	
	$httpProvider
		.interceptors.push('HttpInterceptor');
}]);


/* configure routes using '$routeProvider' service from the 'ngRoute' module */
app.config(['$routeProvider', function($routeProvider) {

	$routeProvider	
		.when('/', {
			restrict : 'E',		// 'Element' directive
			templateUrl : './static/modules/login/views/login.html',
			controller : 'LoginController',
	        controllerAs: 'ctrl'
		})

		.when('/login', {
			restrict : 'E',		// 'Element' directive
			templateUrl : './static/modules/login/views/login.html',
			controller : 'LoginController',
	        controllerAs: 'ctrl'
		})
		
		.when('/reset_password_link', {
			restrict : 'E',		// 'Element' directive
			templateUrl : './static/modules/reset-password/views/reset-password-link.html',
			controller : 'ResetPasswordController',
	        controllerAs: 'ctrl'
		})
					
		.when('/loggeduser_change_password', {			 
			restrict : 'E',
			templateUrl : './static/modules/reset-password/views/logged-user-change-password-form.html',
			controller : 'ResetPasswordController',
	        controllerAs: 'ctrl'
		})
		
		.when('/change_password_form/:token', {			
			restrict : 'E',
			templateUrl : './static/modules/reset-password/views/change-password-form.html',
			controller : 'ResetPasswordController',
	        controllerAs: 'ctrl'
		})
		
		.when('/home', {
			restrict : 'E',
			templateUrl : './static/modules/home/views/home.html',
			controller : 'HomeController',
            controllerAs: 'ctrl',
			requiresAuthentication: true
		})
	
		.when('/registerEmployee/:employeeId', {      // any logged user can update user info; It must be placed before '/registerEmployee/0'
			restrict : 'E',
			templateUrl : './static/modules/register-employee/views/registerEmployee.html',
			controller : 'EmployeeController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true
		})
		
		.when('/registerEmployee/0', {        // only 'ROLE_ADMIN' can register new patient; order is important; more restrictive condition must be placed later
			restrict : 'E',
			templateUrl : './static/modules/register-employee/views/registerEmployee.html',
			controller : 'EmployeeController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN']
		})
		
		.when('/registerEvent/:eventId', {
			restrict : 'E',
			templateUrl : './static/modules/register-event/views/registerEvent.html',
			controller : 'EventController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN']
		})
	
		.when('/employees', {
			restrict : 'E',
			templateUrl : './static/modules/employees/views/employees.html',
			controller : 'EmployeesController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
		})
	
		.when('/events', {
			restrict : 'E',
			templateUrl : './static/modules/events/views/events.html',
			controller : 'EventsController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
		})
		
		// Attendance
		.when('/attendance_listEvents', {				
			restrict : 'E',
			templateUrl : './static/modules/attendance/views/attendance_listEvents.html',
			controller : 'AttendanceController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
		})	
		
		.when('/attendance/:eventId', {
			restrict : 'E',
			templateUrl : './static/modules/attendance/views/attendance.html',
			controller : 'AttendanceController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
		})

		.when('/email', {
			restrict : 'E',
			templateUrl : './static/modules/email/views/email.html',
			controller : 'EmailController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true
		})		
				
		.when('/employees_per_supervisor', {
			restrict : 'E',
			templateUrl : './static/modules/employees/views/employees_per_supervisor.html',
			controller : 'EmployeesController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
		})
		
		.when('/events_by_employee', {
			restrict : 'E',
			templateUrl : './static/modules/events/views/events_by_employee.html',
			controller : 'EventsController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_SUPERVISOR', 'ROLE_MEDTECH']
		})
	
		.when('/events_per_year_by_employee', {
			restrict : 'E',
			templateUrl : './static/modules/event-barchart/views/events_per_year_by_employee.html',
			controller : 'BarchartController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_SUPERVISOR', 'ROLE_MEDTECH']
		})
	
		.when('/barchart_events_by_month_per_year_for_employee', {
			restrict : 'E',
			templateUrl : './static/modules/event-barchart/views/barchart_events_by_month_per_year_for_employee.html',
			controller : 'BarchartController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_SUPERVISOR', 'ROLE_MEDTECH']
		})

		.when('/listYearsForEmployeesBarchartEventsComparision', {
			restrict : 'E',
			templateUrl : './static/modules/events/views/listYearsForEmployeesBarchartEventsComparision.html',
			controller : 'EventsController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_SUPERVISOR']
		})
		
		.when('/event_piechart', {
			restrict : 'E',
			templateUrl : './static/modules/event-piechart/views/event_piechart.html',
			controller : 'PiechartController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true,
	        permissions: ['ROLE_ADMIN', 'ROLE_SUPERVISOR']
		})
						
		.when('/logout', {
			restrict : 'E',
			templateUrl : './static/modules/logout/views/logout.html',
			controller : 'LogoutController',
            controllerAs: 'ctrl',
	        requiresAuthentication: true
		})
		
		.otherwise({
			redirectTo : '/'
		});
	
}]);



app.run(['$interval', '$rootScope', 'LoginService', function($interval, $rootScope, LoginService) {
	
	// do something when application is started
}]);