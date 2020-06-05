var app = angular.module('attendance-module', []);

app.filter('statusFilter', function(){
	
	// return true if event status is 1 or completed
	// and return false if event status is 0 or pending
	return function(status) {
		if(status === 'PENDING')
			return 'REGISTER';
		else 
			return 'UPDATE';
	}
});