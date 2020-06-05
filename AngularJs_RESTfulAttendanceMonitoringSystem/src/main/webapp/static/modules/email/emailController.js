app.controller('EmailController', ['$scope', '$location', 'EmailService', '$timeout', 
				function($scope, $location, EmailService, $timeout) {
    
	/* 1. DEFINE VARIABLES */
	var self = this;
	self.jsonData = {
			from: 'suchettri1@gmail.com',
			to: '',
			subject: '',
			text: ''
	}

	self._files = [];
	self.alertMsg = '';     // used to alert user if email is sent successfully
	
	
    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
     
    function init() {
		// listen for the file selected event which is raised from directive 
	    $scope.$on('seletedFile', function(event, args) {
	        $scope.$apply(function() {  
	            //add file to the $scope.files
	            self.files.push(args.file); 
	            console.error('No. of file(s) attached=', self.files.length);
	        });  
	    }); 
	 	    
	    // call this method when page is loaded
	    findAllEmails();
    }
    
    
    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.sendEmailFunc = sendEmailFunc;
    self.resetFunc = resetFunc;
    self.resetForm = resetForm;
    self.autoCompleteFunc = autoCompleteFunc;
    self.fillTextboxFunc = fillTextboxFunc;
    

    /* 4. DEFINE FUNCTIONS */
    
    // These directives are located in "email/app.js"
    // app.directive('parseFile', ['$parse', function($parse) {}
    // app.directive('validateFile', function($parse) {}
    
    /**
     * SEND EMAIL FUNCTION
     */
    function sendEmailFunc(files) { 
    	var _files = files ? files : [];
    	EmailService.sendEmail(self.jsonData, _files)
            .then(
            function(response) {
            	if(response.status === 200) {
            		self.resetForm(); 
                	self.alertMsg = 'Message sent!';
                	// $timeout function will be executed after 3 sec.
                	$timeout(function() {
                		self.alertMsg = '';
                     }, 2000);
            	}
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );     
    }
    
    
    /**
     * RESET FUNC
     */
    function resetFunc() {
    	resetForm();
    }
    
    
    /**
     * RESET THE FORM
     */
    function resetForm() {
    	self.jsonData = {
    			from: 'suchettri1@gmail.com',
    			to: '',
    			subject: '',
    			text: ''
    	};    	
    	angular.element("input[type='file']").val(null);	// clear selected files from input type 'file'
    	self._files = [];
    }
    
    
    /**
     * FIND ALL EMAILS 
     */
    function findAllEmails() {
    	EmailService.findAllEmails()
        .then(
	        function(response) {
	        	self.emails = response.data;         	
	        },
	        function(errResponse){
	        	console.log('errResponse=' + errResponse);
	        }
	    );
    }
    
    
    
    /**
     * AUTO COMPLETE FUNCTION 
     */
    function autoCompleteFunc(searchText) {
    	//console.log('searchText=', searchText);
    	var list = [];
    	list = self.emails.filter(item => 
            item.toLowerCase().includes(searchText));
		//console.log('list=', list);
		self.updatedEmailList = list;
    }
    
    
    /**
     * FILL TEXT-BOX WITH SELECTED ITEM FROM THE LIST
     */
    function fillTextboxFunc(text){
    	self.jsonData.to = text;
    	self.updatedEmailList = null;
	}
    
}]);   