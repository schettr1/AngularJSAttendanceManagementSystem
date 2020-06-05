app.factory('HomeService', ['$http', '$q', function($http, $q){
 
	var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/employees";
    var AUTH_HEADER = 'Bearer ' + JSON.parse(localStorage.getItem('user')).access_token;
    
    var factory = {

    };
    return factory;
    

 
 
}]);