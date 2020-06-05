app.factory('LoginService', ['$http', '$q', 'Idle', '$cookieStore', '$rootScope', 'Base64Service', '$localStorage', 
	function ($http, $q, Idle, $cookieStore, $rootScope, Base64Service, $localStorage) {
	
	var REST_SERVICE_URI = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem";

	var self = this;
	self.user = {
			employeeId: '',
            username: '',
            authdata: '',
            roles: []
    }; 
	
	var currentUser = {
			employeeId: '',
            username: '',
            authdata: '',
            permissions: []
    }; 
	
    var factory = {
    		authenticateUser: authenticateUser,
    		getUser: getUser,
    		setUser: setUser,
    		removeUser: removeUser,
    		checkPermissionForView: checkPermissionForView,
    		hasUserPermissionForView: hasUserPermissionForView,
    		hasUserPermission: hasUserPermission,
    		currentUser: currentUser,
    		isLoggedIn: isLoggedIn		
    };
    return factory;
    
    
    
    //*************************** AUTHENTICATE USER **********************************//   
    /**
     * verify user credentials
     * @param Base64Encode 'username' and 'password' in Authorization-Header
     * @return access_token, refresh_token, employeeId, roles[]
     */
    function authenticateUser(username, password) {
        var deferred = $q.defer();
        var authdata = Base64Service.encode(username + ':' + password);

        $http({
	        	method: 'post',  
	        	url: REST_SERVICE_URI+'/authorize', 
	        	headers: { 
	        		"Authorization": "Basic " + authdata 
	        	}
        })
        .then(
            function (response) {          
            	console.log('response=', response);
                deferred.resolve(response);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;		 	
    };
 
 
    
    //*************************** SET USER IN LOCAL STORAGE AND COOKIE STORE **********************************//
    /**
     * SET USER 
     */
    function setUser(logger_credentials) { 
    	self.user = { 
    			employeeId: logger_credentials.employeeId,
                access_token: logger_credentials.access_token,
                refresh_token: logger_credentials.refresh_token,
                roles: logger_credentials.roles
        }; 
    	console.log('self.user=', self.user);
    	localStorage.setItem('user', JSON.stringify(self.user));	// store String in localStorage (won't be deleted if page is refreshed)      
        //$cookieStore.put('user', JSON.parse(localStorage.getItem('user')));		// add object 'user' to $cookieStore
        console.warn('Idle.watch() has Started!');
		Idle.watch();				// modify idle time from '/logout/app.js'
		
    };
 
        
    //*************************** GET USER **********************************//
    /**
     * GET USER
     */
    function getUser() {
    	return JSON.parse(localStorage.getItem('user'));	// convert String to JSON object
    }
    
        
    //*************************** REMOVE USER **********************************//
    /**
     * REMOVE USER 
     */
    function removeUser() {
    	localStorage.removeItem('user');
    	$cookieStore.remove('user');		// remove 'user' object from $cookieStore
        
    	//************ IDLE UNWATCH ***********//
    	console.log('Idle.watch() has Stopped!');
		Idle.unwatch();		
    };

  

    /**
     * CHECKING WHETHER VIEW REQUIRES AUTHENTICATION
     */
    function checkPermissionForView(view) {
        if (!view.requiresAuthentication) {			// if requiresAuthentication is false or does not exist
            return true;
        }      
        return hasUserPermissionForView(view);		// if requiresAuthentication is true
    };
     
    
    /**
     * CHECK WHETHER USER HAS PERMISSIONS OR NOT
     */
    function hasUserPermissionForView(view){
        if(!isLoggedIn()){		// if no user is logged in
            return false;
        }        
        if(!view.permissions || !view.permissions.length){	// if view does not need permissions or if length of permissions[] is 0
            return true;
        }        
        return hasUserPermission(view.permissions);		// if user is logged in and view needs permissions
    };
          
    
    /**
     * CHECK WHETHER USER HAS PERMISSION TO ACCESS THE VIEW,
     * DISPLAY ONLY THOSE LINKS TO THE VIEWS THAT ARE ACCESSIBLE TO USER
     */
    function hasUserPermission(view_permissions){
        if(!isLoggedIn()){		// if no user is logged in
            return false;
        }
        var hasPermission = false;
        //console.error('view_permissions=' + view_permissions);
        //console.error('currentUser.roles=' + getUser().roles);	
        angular.forEach(view_permissions, 
        		function(view_permission, index) {
		            if (getUser().roles.indexOf(view_permission) >= 0) {        
		            	hasPermission = true;
		                return;
		            }                        
        });        
        return hasPermission;
    };
       
    
    /**
     * IS USER LOGGED IN
     */
    function isLoggedIn(){
        return JSON.parse(localStorage.getItem('user'));
    };
    
    
    
}]);