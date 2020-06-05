app.controller('EventController', ['$scope', '$routeParams', '$location', '$timeout', 'EventService', 'RootStorage',
	function($scope, $routeParams, $location, $timeout, EventService, RootStorage) {
	
    /* 1. DEFINE VARIABLES */
	var self = this;
    self.event = {};
   
    self.ces = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // self.event.ce = 0;
    self.types = [{"text": "SYMPOSIUM", "value": 0}, {"text": "SEMINAR", "value": 1}]; 
    // self.event.type = self.types[0];	// initialize 'ctrl.event.type'

    
    self.event_options = ["PENDING", "COMPLETED", "- - ALL - -"];
    self.selected_event = "PENDING";
    
    self.checkboxModel_events = {};		// checkboxModel is an object which can hold a value inside the {}, checkboxModel[] is an array that can hold
    								// any number of checkboxModel objects, and checkboxModel[0] is an array element which contains a checkboxModel object.  
    
    
    // if selectedEventId exists, then self.event === self.selectedEvent(event to be updated) 
    self.selectedEventId;
    self.selectedEvent;		// getEventById(self.selectedEvent)
	
    self.alertMsg = '';       // alert message when event is created, updated, deleted
 
    

    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
    
    function init() {
        /* UPDATED_EVENT must be declared after/below initializing select options self.event.ce = 1 and self.event.type=self.types[0] */
        /* orElse self.updatedEvent.ce will reset back to 1 again and self.event.type will reset to '' */

               
        /* url params */
        var paramEventId = parseInt($routeParams.eventId);
        if(paramEventId != 0) {
        	self.selectedEventId = paramEventId;
        	console.log("selectedEventId=" + self.selectedEventId);
        	getEventById(self.selectedEventId);
        }
    }
   
    

    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.submitFunc = submitFunc;
    self.searchFunc = searchFunc;
    self.removeFunc = removeFunc;
    self.resetFunc = resetFunc;
    self.selectEventFunc = selectEventFunc;	
    
    
    /* 4. DEFINE FUNCTIONS */
	/**
	 * confirm page change if the form is dirty 
	 */
    $scope.myForm = {};			// to get rid of TypeError: undefined $pristine
	$scope.$on('$locationChangeStart', function(event) {
		//if(!$scope.myForm.$pristine) {	-> AVOID: it will bring pop up box twice
		if($scope.myForm.$dirty) {
	        var answer = confirm("All unsaved data will be lost. Are you sure you want to leave this page?");
	        if (!answer) {
	            event.preventDefault();
	        }
		}
    });
	
	
    /**
     * SUBMIT FORM DATA
     * @param event
     */
    function submitFunc() {
    	// convert event.type from String ('text') to int ('value')
        self.event.type = self.event.type.value;
        if(self.selectedEventId != undefined) {
        	// update event
            updateEvent(self.event, self.event.eventId);
        }
        else {
        	// create new event
            createEvent(self.event);
            resetFunc();
        }
    }
    
	
    /**
     * SELECT EVENT BY EVENT ID
     * @param event_Id (URL param)
     * @return attendance.html
     */
    function selectEventFunc(eventId){
    	console.log("selected_eventId= " + eventId);
    	$location.path('/attendance').search({event_Id: String(eventId)});  	// specify filename inside .path() and pass parameter by inside .search()
    }
    
 
    
    
    /**
     * GET EVENT BY ID (To Update Event)
     * @param eventId
     * @return event
     */
    function getEventById(eventId){
    	EventService.getEventById(eventId)
        .then(
            function(response) {            // response.data = {event: {eventId: '', name: ''}, links: {}}
                self.selectedEvent = response.data.event;
                console.log('self.selectedEvent=' , self.selectedEvent);
                // convert self.selectedEvent to self.event
                self.event = self.selectedEvent; 
                // change event.type to self.types[]
                if(self.event.type === 'SYMPOSIUM') {
                	self.event.type = self.types[0];
                }
                else {
                	self.event.type = self.types[1];
                }
                self.event.startTimeStamp = new Date(self.event.startTimeStamp);
                self.event.endTimeStamp = new Date(self.event.endTimeStamp);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * CREATE EVENT
     * @
     * @return array of events
     */
    function createEvent(event){
        EventService.createEvent(event)
        .then(           
            function(response){
            	if(response.status == 201) {
            		self.alertMsg = 'Event created!';
            		$timeout(function() {
                		self.alertMsg = '';
                     }, 2000);
            	}
            	console.log('response=' + response);
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }

    
    /**
     * UPDATE EVENT
     * @
     * @return array of events
     */
    function updateEvent(event, id){
    	EventService.updateEvent(event, id)
        .then(
            function(response){
            	if(response.status == 200) {
            		self.alertMsg = 'Event updated!';
            		resetFunc();
            		$timeout(function() {
                		self.alertMsg = '';               		
                		$location.path('/events');
                     }, 2000);
            	}
            	console.log('response.data.event=', response.data.event);
            },
            function(errResponse){
            	console.log('errResponse=', errResponse);
            }
        );
    }

    
    /**
     * DELETE EVENT
     * @
     * @return array of events
     */
    function deleteEvent(id){
    	EventService.deleteEvent(id)
        .then(
            function(response){
            	if(response.status == 200) {
            		self.alertMsg = 'Event deleted!';
            		$timeout(function() {
                		self.alertMsg = '';
                		resetFunc();
                		$location.path('/events');
                     }, 2000);
            	}
            	console.log('response=' + response);
            },	
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
 
    
    /**
     * SEARCH EVENT
     * @
     */
    function searchFunc(){
        var id = document.getElementById('id').value;
        console.log('id to be searched:' + id);
        for(var i = 0; i < self.events.length; i++){
            if(self.events[i].event.id === parseInt(id)) {
                self.event = angular.copy(self.events[i].event);
                console.log(self.event);
                break;
            }
            // if no input, reset the Form
            if(id == "" || id == null) {
            	console.log("call reset() method");
            	reset();
                break;
            }
        }
    }
    
    
    /**
     * DELETE EVENT
     */
    function removeFunc(id){
        console.log('id to be removed: ' + id);
        if(self.event.id === id) {
        	//clean form if the user to be deleted is shown there.
            resetFunc();
        }
        deleteEvent(id);
    }
 
    
    /**
     * SELECT EVENT STATUS 
     * @param status [{pending, 0}, {completed, 1}]
     * @return list of events
     */
    function selectEventStatusFunc(){
        console.log(self.selected_event);
        
        switch(self.selected_event) {
	        case "PENDING": {
	        	getEventsByStatus(0);	// calling method of AttendanceController
	        	break;
	        }
			case "COMPLETED": {
				getEventsByStatus(1);
	        	break;
			}
			default: {
				getAllEvents();
	        	break;
			}
        }    
    }
    
    
    /**
     * RESET FORM
     */
    function resetFunc(){
        self.event = {};      
        $scope.myForm.$setPristine(); 		
        $scope.myForm.$setValidity();	// all 3 are required to reset the form
        $scope.myForm.$setUntouched();
    }
    
}]);