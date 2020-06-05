/**
 * inject dependencies inside square-bracket [] and pass objects inside the function()
 * '$http' object is needed to make call to the REST service
 * '$q' is called Promise object. It is used to handle asynchronous call to REST api.
 * Once you call defer() method, it will promise us resolve() or reject() 
 * If we handle asynchronous calls using jQuery plugin, it wouldn't be so much fun!
 *
 * In AngularJS, Services can be created using .factory() method or .service() method
 * 
 */ 

app.factory('RootStorage', function(){
	
	/**
	 * DEFINE VARIABLES
	 */
	var map = {};		// USED - attendance of employees, items are stored as {key, value} pair	
	var currentUser = {		// NOT USED - $localStorage is used instead because RootStorage data will be lost when page is refreshed
            username: '',
            authdata: '',
            roles: []
    }; 	
	var error = {};		// NOT USED - error while creating medtech with existing ID
	
	
	/**
	 * DEFINE FACTORY SERVICE
	 */
	var factory = {
		setItem: setItem,
		getItem: getItem,
		setUser: setUser,
		getUser: getUser,
		removeUser: removeUser,
		setError: setError,
		getError: getError
	};	
	return factory;
    
	
	/**
	 * DEFINE FUNCTIONS
	 */
	// Adding selectedEmployeeId as key, value pair
	function setItem(key, value) {
		map[key] = value;
	}
	
	// Get selectedEmployeeId using key
	function getItem(key) {
		if(map[key] != undefined)
			return map[key];
	}
	
	// set CurrentUser
	function setUser(username, authdata, roles) {
		currentUser.username = username;
		currentUser.authdata = authdata;
		currentUser.roles = roles;
	}
	
	// get CurrentUser
	function getUser() {
		return currentUser;
	}
	
	// remove CurrentUser
	function removeUser() {
		currentUser = {};
	}
	
	// get CurrentUser
	function getError() {
		return error;
	}
	
	// remove CurrentUser
	function setError(myError) {
		error = myError;
	}	
});