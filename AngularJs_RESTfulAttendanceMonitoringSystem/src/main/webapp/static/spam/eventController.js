/**
 * inject dependencies inside square-bracket [] 
 * '$scope' object helps to bind data between controller and view 
 * while injecting dependency always use the name of controller or service instead of their filenames 
 *
 */ 

app.controller('EventController', ['$scope', '$location', 'EventsService', 'RootStorage', 'PaginationService',
	function($scope, $location, EventsService, RootStorage, PaginationService) {
	
	console.log("Inside eventController++.js");
    
	/* DEFINE VARIABLES */
	var self = this;
    self.event = {
		    		eventId: null, 
		    		name: '', 
		    		ce: '', 
		    		type: '', 
		    		status: '', 		
		    		speaker: '', 
		    		location: '', 
		    		startTimeStamp: '', 
		    		endTimeStamp: '', 
		    		duration: ''
    			};
    /* Initialize Register Form Select Option for registering new Event */
    self.ces = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//    self.event.ce = 0;
    self.types = [{"text": "SYMPOSIUM", "value": 0}, {"text": "SEMINAR", "value": 1}]; 
//    self.event.type = self.types[0];	// initialize 'ctrl.event.type'
//    self.event.startTimeStamp = new Date();
//    self.event.startTimeStamp = new Date();
    
    self.event_options = ["Pending", "Completed", "- - All - -"];
    self.selected_event = "Pending";
    self.checkboxModel_events = {};		// checkboxModel is an object which can hold a value inside the {}, checkboxModel[] is an array that can hold
    								// any number of checkboxModel objects, and checkboxModel[0] is an array element which contains a checkboxModel object.  
    
    self.events = [];
    self.pending_events = [];
    self.events_by_MedtechId = [];
    self.smallestYear = 0;
    self.largestYear = 0;
    self.years = [];
    self.selectedEmployeeId;
    self.pieChartGenderDATA = [];
    self.pieChartShiftDATA = [];    
    
    self.setPage = setPage;		// pagination
	self.pager = {			// pagination		
			totalItems: '',
			currentPageNo: '',
			pageSize: '',
			totalPages: 1,	
			startPage: '',
			endPage: '',
			startIndex: '',
			endIndex: '',
			pages: ''
	};
   	
	self.column = "name";	// column to sort
	self.reverse = false;		// sort ordering (Ascending or Descending). Set true for desending
	
	
    /* UPDATED_EVENT must be declared after/below initializing select options self.event.ce = 1 and self.event.type=self.types[0] */
    /* orElse self.updatedEvent.ce will reset back to 1 again and self.event.type will reset to '' */
    if(RootStorage.getItem('self.event') != undefined) {
    	self.event = RootFactory.getItem('self.event');
    	console.error("self.event.ce=" + self.event.ce);
    	if (self.event.type === "SYMPOSIUM") {
    		self.event.type = self.types[0];
    	}
    	else {
    		self.event.type = self.types[1];
    	}
    }
    
    /* URL PARAMETERS */
    var urlParam = $location.search(); 
    if(urlParam.selectedEmployeeId != undefined) {
    	self.selectedEmployeeId = urlParam.selectedEmployeeId;
    	console.log("selectedEmployeeId=" + self.selectedEmployeeId);
    }
    if(urlParam.selectedEventId != undefined) {
    	self.selectedEventId = urlParam.selectedEventId;
    	console.error("selectedEventId=" + self.selectedEventId);
    	getGenderPercentByEventId(self.selectedEventId);
    	getShiftPercentByEventId(self.selectedEventId);
    }
    
    
    /* LIST FUNCTIONS DEFINED IN THE VIEW */
    self.submitFunc = submitFunc;
    self.searchFunc = searchFunc;
    self.editFunc = editFunc;
    self.removeFunc = removeFunc;
    self.resetFunc = resetFunc;
    self.selectEventFunc = selectEventFunc;	
    self.calcShiftPerEventFunc = calcShiftPerEventFunc;
    self.sortColumn = sortColumn;
    self.sortClass = sortClass;

	
    /* INITIALIZE */
    getAllEvents();  
    
    
	// called on header click
	function sortColumn(column) {
		console.error('column=' + column);
		self.column = column;
		if (self.reverse) {
			self.reverse = false;
			self.reverseclass = 'arrow-up';
		} else {
			self.reverse = true;
			self.reverseclass = 'arrow-down';
		}
	};

	// remove and change class
	function sortClass(column) {
		if (self.column == column) {
			if (self.reverse) {
				return 'arrow-down';
			} else {
				return 'arrow-up';
			}
		} else {
			return '';
		}
	}
	
	// pagination
	function setPage(pageNo) {
		if (pageNo < 1 || pageNo > self.pager.totalPages) {
			console.error('pageNo < 1 || pageNo > self.pager.totalPages');
			return null;
		}
		self.pager = PaginationService.getPager(self.events.length, pageNo);
		self.events_per_page = self.events.slice(self.pager.startIndex, self.pager.endIndex + 1);
	}
	
	
    /**
     * GET ALL EVENTS
     * @return array of events 
     */
    function getAllEvents(){
    	console.log("Inside eventController.js + fetchAllEvents()");
        EventsService.getAllEvents()
        .then(
            function(response) {
            	console.log("Inside eventController.js + fetchAllEvents() +  function(response)");
                self.events = response;
                console.log(self.events);
                setPage(1);			// initialize pagination
                
                // find smallest and largest year from the event 
                console.log("events.length=" + self.events.length);
                var i;
                self.smallestYear = new Date(self.events[0].event.startTimeStamp).getFullYear();
                self.largestYear = new Date(self.events[0].event.startTimeStamp).getFullYear();
            	for(i=1; i<self.events.length; i++) {
            		if(self.smallestYear > new Date(self.events[i].event.startTimeStamp).getFullYear()) {
            			self.smallestYear = new Date(self.events[i].event.startTimeStamp).getFullYear();
            		}
            		if(self.largestYear < new Date(self.events[i].event.startTimeStamp).getFullYear()) {
            			self.largestYear = new Date(self.events[i].event.startTimeStamp).getFullYear();
            		}
            		var date = new Date(self.events[i].event.startTimeStamp);
            	}
                console.error("smallestYear=" + self.smallestYear);
                console.error("largestYear=" + self.largestYear);
                
                var a=0;
                for(i = self.smallestYear; i <= self.largestYear; i++) {               	
                	self.years[a] = self.smallestYear++;
                	a++;
                }
            },
            function(errResponse){
                console.error('Error while fetching Events');
                console.log("Inside eventController.js + fetchAllEvents() + function(errResponse)");
            }
        );
    }
    

    
    /**
     * GET EVENTS BY STATUS
     * @param int status (0 and 1 only)
     * @return array of events
     */
    function getEventsByStatus(statusCode){
    	console.log("Inside eventController.js + getEventsByStatus()");
        EventService.getEventsByStatus(statusCode)
            .then(
            function(response) {
            	console.log("Inside eventController.js + getEventsByStatus() +  function(response)");
                self.pending_events = response;
                console.log(self.pending_events);
                
            },
            function(errResponse){
                console.error('Error while fetching Events');
                console.log("Inside eventController.js + getEventsByStatus() + function(errResponse)");
            }
        );
    }

    
    /**
     * GET GENDER PERCENT BY EVENT ID
     * @param event Id
     * @return array containing 'gender' and 'percent' 
     */
    function getGenderPercentByEventId(eventId){
    	console.log("Inside eventController.js + getGenderPercentByEventId()");
        EventService.getGenderPercentByEventId(eventId)
            .then(
            function(response) {
            	console.log("Inside eventController.js + getGenderPercentByEventId() +  function(response)");
                self.pieChartGenderDATA = response;
                console.error(self.pieChartGenderDATA);

        		var ValueTextArray = [
					        			{
						        			"values": [0],
						        			"text": 'Male'		// legend position 1 is 'male'
						        		},
						        		{
						        			"values": [0],
						        			"text": 'Female'	// legend position 2 is 'female'
						        		},
						        		{
						        			"values": [0],
						        			"text": 'Other'		// legend position 3 is 'other'
						        		}

						        	];


        		// change values of 'ValueTextArray' based on gender of 'pieChartDATA'
                var a=0;
                for(a; a < self.pieChartGenderDATA.length; a++) {
                	if(self.pieChartGenderDATA[a].gender == 1) {
                		console.error("Male");
                		ValueTextArray[0].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].gender == 2) {
                		console.error("Female");
                		ValueTextArray[1].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].gender == 0) {
                		console.error("Other");
                		ValueTextArray[2].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                }
                
                
                /* Zing Pie Chart Configuration */
                zingchart.render({
                    id: 'pieChartByGender',
                    height: "100%",
                    width: "100%",
                    data: {
            		        "type": "pie",
            		        "plotarea":{
            		            "margin-bottom":"10%",
            		            "margin-right":"25%"	// leave space on right side of the chart for legend
            		          },
            		        "legend":{
            		        	"background-color":"#D3D3D3",
            		            "border-width":1,
            		            "border-color":"black",
            		            "border-radius":"3px",
            		            "padding":"10%",
            		            "layout":"5x1", // row x column
            		            "x":"80%",		// width
            		            "y":"18%",		// height
            		        },
            		        "title": {
            		        	text: "Distribution by Gender"      												// get 'selectedFirstname' and 'selectedLastname' from RootFactory
            		        },
            		        "series": ValueTextArray
            	        }
                });
                
                
            },
            function(errResponse){
                console.error('Error while fetching Gender Percent by event Id');
                console.log("Inside eventController.js + getGenderPercentByEventId() + function(errResponse)");
            }
        );
    }
    
    
    /**
     * GET SHIFT PERCENT BY EVENT ID
     * @param event Id
     * @return array containing 'shift' and 'percent' 
     */
    function getShiftPercentByEventId(eventId){
    	console.log("Inside eventController.js + getShiftPercentByEventId()");
        EventService.getShiftPercentByEventId(eventId)
            .then(
            function(response) {
            	console.log("Inside eventController.js + getShiftPercentByEventId() +  function(response)");
            	self.pieChartGenderDATA = response;
                console.error(self.pieChartGenderDATA);
                
        		var ValueTextArray = [
					        			{
						        			"values": [0],
						        			"text": 'Day'		// legend position 1 is 'day'
						        		},
						        		{
						        			"values": [0],
						        			"text": 'Evening'	// legend position 2 is 'evening'
						        		},
						        		{
						        			"values": [0],
						        			"text": 'Night'		// legend position 3 is 'night'
						        		}
						        	];


        		// change values of 'ValueTextArray' based on gender of 'pieChartDATA'
                var a=0;
                for(a; a < self.pieChartGenderDATA.length; a++) {
                	if(self.pieChartGenderDATA[a].shift == 0) {
                		console.error("Day");
                		ValueTextArray[0].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].shift == 1) {
                		console.error("Evening");
                		ValueTextArray[1].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].shift == 2) {
                		console.error("Night");
                		ValueTextArray[2].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                }
                
                
                /* Zing Pie Chart Configuration */
                zingchart.render({
                    id: 'pieChartByShift',
                    height: "100%",
                    width: "100%",
                    data: {
            		        "type": "pie",
            		        "plotarea":{
            		            "margin-bottom":"10%",
            		            "margin-right":"25%"	// leave space on right side of the chart for legend
            		          },
            		        "legend":{
            		        	"background-color":"#D3D3D3",
            		            "border-width":1,
            		            "border-color":"black",
            		            "border-radius":"3px",
            		            "padding":"10%",
            		            "layout":"5x1", // row x column
            		            "x":"80%",		// width
            		            "y":"18%",		// height
            		        },
            		        "title": {
            		        	text: "Distribution by Shift"        												// get 'selectedFirstname' and 'selectedLastname' from RootFactory
            		        },
            		        "series": ValueTextArray
            	        }
                });
                
            },
            function(errResponse){
                console.error('Error while fetching Shift Percent by event Id');
                console.log("Inside eventController.js + getShiftPercentByEventId() + function(errResponse)");
            }
        );
    }
    
    
    /**
     * SELECT EVENT BY EVENT ID
     * @param event_Id (URL param)
     * @return attendance.html
     */
    function selectEventFunc(eventId){
    	console.log("Inside eventController.js + attendanceFunc()");
    	console.log("selected_eventId= " + eventId);
    	$location.path('/attendance').search({event_Id: String(eventId)});  	// specify filename inside .path() and pass parameter by inside .search()
    }
    
    
    /**
     * CREATE EVENT
     * @
     * @return array of events
     */
    function createEvent(event){
    	console.log("Inside eventController.js + createEvent()");
        EventService.createEvent(event)
            .then(
            getAllEvents,
            function(errResponse){
                console.error('Error while creating Event');
                console.log("Inside eventController.js + createEvent() + function(errResponse)");
            }
        );
    }

    
    /**
     * UPDATE EVENT
     * @
     * @return array of events
     */
    function updateEvent(event, id){
    	console.log("Inside eventController.js + updateEvent()");
    	EventService.updateEvent(event, id)
            .then(
            getAllEvents,
            function(errResponse){
                console.error('Error while updating Event');
                console.log("Inside eventController.js + updateEvent() + function(errResponse)");
            }
        );
    }

    
    /**
     * DELETE EVENT
     * @
     * @return array of events
     */
    function deleteEvent(id){
    	console.log("Inside eventController.js + deleteEvent()");
    	EventService.deleteEvent(id)
            .then(
            getAllEvents,
            function(errResponse){
                console.error('Error while deleting Event');
                console.log("Inside eventController.js + deleteEvent() + function(errResponse)");
            }
        );
    }

    
    /**
     * SUBMIT EVENT
     * @
     * @
     */
    function submitFunc() {
    	console.log("Inside eventController.js + submit()"); 
        self.event.type = self.event.type.value;
        self.event.status = 0;
        console.log('Save New Event: after converting type={} to type=int', self.event);
        createEvent(self.event);
        resetFunc();
    }

    
    /**
     * EDIT EVENT
     * @
     * @
     */
    function editFunc(eventId){
        console.log("Inside eventController.js + edit()");
        console.log('eventId to be edited:' + eventId);
        for(var i = 0; i < self.events.length; i++){
            if(self.events[i].event.id === eventId) {               
                self.event = self.events[i].event;
                console.error("self.event=" + JSON.stringify(self.event)); 
                /* convert UNIX timestamp (1539378000000) to Date(Thu Jun 27 2019 12:59:00 GMT-0400 (Eastern Daylight Time)) */
                /* HTML form element type is 'datetime-local' */
                var startDate = new Date(self.event.startTimeStamp);
                self.event.startTimeStamp = startDate;
                console.log(startDate);
                var endDate = new Date(self.event.endTimeStamp);
                self.event.endTimeStamp = endDate; 
                /* set type and ce for self.event */
                
                RootStorage.setItem("self.event", self.event);		// add 'self.event' to RootFactory
                $location.path('/registerEvent'); 
                break;
            }
        }
        
    }
 
    
    /**
     * SEARCH EVENT
     * @
     */
    function searchFunc(){
        console.log("Inside eventController.js + search()");
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
    
    function removeFunc(id){
        console.log('Inside eventController.js + remove()'); 
        console.log('id to be removed: ' + id);
        if(self.event.id === id) {
        	//clean form if the user to be deleted is shown there.
            resetFunc();
        }
        deleteEvent(id);
    }
 
    
    function resetFunc(){
        console.log('Inside eventController.js + reset()');
        self.event = {
        		id: null, 
	    		name: '', 
	    		ce: '', 
	    		type: '', 
	    		status: '', 		
	    		speaker: '', 
	    		location: '', 
	    		startTimeStamp: '', 
	    		endTimeStamp: '', 
	    		duration: ''
			};
        self.myForm.$setPristine(); 	 // reset Form
    }
 


    function calcShiftPerEventFunc(selectedEventId){
        console.log('Inside eventController.js + calcShiftPerEventFunc()');
        console.log("selectedEventId = " + selectedEventId);
    	$location.path('/event_piechart')
    			.search({selectedEventId: String(selectedEventId)});  	// specify filename inside .path() and pass parameter by inside .search()
   
    }
    
    
    /**
     * SELECT EVENT STATUS 
     * @param status [{pending, 0}, {completed, 1}]
     * @return list of events
     */
    function selectEventStatusFunc(){
        console.log('Inside eventController.js + selectEventStatusFunc()');
        console.log(self.selected_event);
        
        switch(self.selected_event) {
	        case "Pending": {
	        	getEventsByStatus(0);	// calling method of AttendanceController
	        	break;
	        }
			case "Completed": {
				getEventsByStatus(1);
	        	break;
			}
			default: {
				getAllEvents();
	        	break;
			}
        }    
    }
}]);