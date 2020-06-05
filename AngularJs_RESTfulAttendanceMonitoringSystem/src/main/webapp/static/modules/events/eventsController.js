app.controller('EventsController', ['$scope', '$location', '$timeout', 'EventService', 'EventsService', 'LoginService', 'PiechartService', 
	'RootStorage', 'PaginationService', function($scope, $location, $timeout, EventService, EventsService, LoginService,
			PiechartService, RootStorage, PaginationService) {
	
	/* 1. DEFINE VARIABLES */
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

    self.events = [];
    self.updatedEventList = [];
    
    self.pending_events = [];
    self.events_by_MedtechId = [];
    self.smallestYear = 0;
    self.largestYear = 0;
    self.years = [];
    self.selectedEmployeeId;
    
	self.column = "name";		// sorting - name can be eventId, name, ce etc.
	self.reverse = false;		// sorting (set true for desending order or false for ascending order)
	
    self.setPage = setPage;		// pagination
	self.pager = {				// pagination		
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
		
    self.eventsStatus = ["PENDING", "COMPLETED", "- - ALL - -"];
    self.selectedEventStatus = "- - ALL - -";
    self.alertMsg = '';       // alert message when event is created, updated, deleted
	
    
    
    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
     
    function init() {
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
        
        /* url params */
        var urlParam = $location.search();
        /* if logger is a Supervisor, find employeeId from URL param */
        if(urlParam.selectedEmployeeId != undefined) {
        	self.selectedEmployeeId = urlParam.selectedEmployeeId;
        	console.log("selectedEmployeeId=" + self.selectedEmployeeId);
        } 
        else {
    	    /* if logger is a Medtech, find employee Id from LoginService */
    	    self.selectedEmployeeId = LoginService.getUser().employeeId;
    	    console.log("LoginService.getUser() -> selectedEmployeeId=" + self.selectedEmployeeId);
        }
        
        /* call method when page is loaded */
        getAllEvents();                
    }

    
    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.selectEventFunc = selectEventFunc;	
    self.calcShiftPerEventFunc = calcShiftPerEventFunc;
    self.compare_barchartevents_by_year_ofSupervisor_employeesFunc = compare_barchartevents_by_year_ofSupervisor_employeesFunc;
    self.selectEventStatusFunc = selectEventStatusFunc;
    self.editFunc = editFunc;					
    self.removeFunc = removeFunc;
    self.sortColumn = sortColumn;
    self.sortClass = sortClass;

    	  		
	/* 4. DEFINE FUNCTIONS */
    
    /**
     * GET ALL EVENTS
     * @return array of events 
     */
    function getAllEvents(){
        EventsService.getAllEvents()
        .then(
            function(response) {
                var events = response.data.map(x => x.event);
                self.events = events;
                self.updatedEventList = events;
                console.log('self.events=', events);
                setPage(1);			// initialize pagination
                
                
                /* FIND SMALLEST AND LARGEST YEAR FROM LIST OF EVENTS TO DETERMINE 'EVENTS_PER_YEAR_BY_EMPLOYEE' */
                console.log("events.length=" + self.events.length);
                var i;
                self.smallestYear = new Date(self.events[0].startTimeStamp).getFullYear();
                self.largestYear = new Date(self.events[0].startTimeStamp).getFullYear();
            	for(i=1; i<self.events.length; i++) {
            		if(self.smallestYear > new Date(self.events[i].startTimeStamp).getFullYear()) {
            			self.smallestYear = new Date(self.events[i].startTimeStamp).getFullYear();
            		}
            		self.largestYear = new Date().getFullYear();   // largest year equals current year
            		var date = new Date(self.events[i].startTimeStamp);
            	}
                console.log("smallestYear=" + self.smallestYear);
                console.log("largestYear=" + self.largestYear);
                
                var a=0;
                for(i = self.largestYear; i >= self.smallestYear; i--) {               	
                	self.years[a] = i;
                	a++;
                }
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    

   
    /**
     * GO TO '/attendance' url
     * @url_param event_Id 
     * @return attendance.html
     */
    function selectEventFunc(eventId){
    	console.log("selected_eventId= " + eventId);
    	$location.path('/attendance').search({event_Id: String(eventId)});  	// specify URL name inside .path() and parameter inside .search()
    }


    /**
     * GO TO '/event_piechart' url
     * @url_param selectedEventId 
     * @return event_piechart.html
     */
    function calcShiftPerEventFunc(selectedEventId){
        console.log("selectedEventId = " + selectedEventId);
    	$location.path('/event_piechart')
    			.search({selectedEventId: String(selectedEventId)});  	// specify URL name inside .path() and parameter inside .search()
   
    }
    
    
    /**
     * GO TO '/compareBarchartEventsByYearOfSupervisorEmployees' url
     * @url_param selectedEventId 
     * @return compareBarchartEventsByYearOfSupervisorEmployees.html
     */
    function compare_barchartevents_by_year_ofSupervisor_employeesFunc(year){
        console.log("selectedYear = " + year);
    	$location.path('/compareBarchartEventsByYearOfSupervisorEmployees')
    			.search({selectedYear: String(year)});  	// specify URL name inside .path() and parameter inside .search()
   
    }
    
    
    /**
     * SELECT EVENT STATUS 
     * @param status [{pending, 0}, {completed, 1}]
     * @return list of events
     */
    function selectEventStatusFunc(status){
    	console.error('status=', status);
    	if(status == "PENDING" || status == 'COMPLETED') {
    		var list = self.events;
            self.updatedEventList  = list.filter(x=> x.status == status); 
            console.log('self.updatedEventList=', self.updatedEventList);
            setPage(1);		// call pagination method to set 1st page
    	}
    	else {		// status = "--ALL--"
    		getAllEvents();
    	}
    }
    
 
    /**
     * GO TO '/registerEvent' URL
     * @param eventId
     * @return 
     */
    function editFunc(eventId){
    	console.log("Edit: eventId=" + eventId);
    	$location.path('/registerEvent/'+eventId);  		
   
    }   
    
    
    /**
     * @param eventId
     * @return 
     */
    function removeFunc(eventId){
    	console.log("Remove: eventId=" + eventId);
    	EventService.deleteEvent(eventId)
        .then(
            function(response) {
            	if(response.status == 200) {
            		window.location.reload(false);
            		self.alertMsg = 'Event deleted!';
            		$timeout(function() {
                		self.alertMsg = '';                   	
                     }, 2000);
            	}
            	console.log('response=', response);
            },
            function(errResponse){
            	console.log('errResponse=', errResponse);
            }
        );  		
   
    } 
    
    
	/**
	 * PAGINATION 
	 * @param pageNo
	 * @return events_per_page
	 */
	function setPage(pageNo) {
		if (pageNo < 1 || pageNo > self.pager.totalPages) {
			return null;
		}
		// initialize pager object
		if(self.updatedEventList.length > 0) {
			self.pager = PaginationService.getPager(self.updatedEventList.length, pageNo);
			self.events_per_page = self.updatedEventList.slice(self.pager.startIndex, self.pager.endIndex + 1);
		} else {
			self.events_per_page = "";
		}
		console.log('self.events_per_page=', self.events_per_page);
	}
	
	
	
	/**
	 * SORTING TABLE COLUMN DATA
	 */
	function sortColumn(column) {			// column = event.eventId
		column = column.split('.').pop();	// column = eventId
		console.log('column=' + column);
		self.column = column;
		if (self.reverse) {
			self.reverse = false;
			self.reverseclass = 'arrow-up';
		} else {
			self.reverse = true;
			self.reverseclass = 'arrow-down';
		}
	};

	
	/**
	 * CHANGE SORTING ARROW POSTION UP/DOWN
	 */
	function sortClass(column) {            // column = event.eventId
		column = column.split('.').pop();	// column = eventId
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
	
	
	
}]);