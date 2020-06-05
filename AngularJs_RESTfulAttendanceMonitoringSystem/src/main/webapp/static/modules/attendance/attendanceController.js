app.controller('AttendanceController', ['$scope', '$routeParams', '$location', 'AttendanceService', 'EventService', 'EventsService', 'EmployeesService', 
	'LoginService', 'PaginationService', '$location', '$uibModal', function($scope, $routeParams, $location, AttendanceService, EventService, EventsService, 
			EmployeesService, LoginService,	PaginationService, $location, $uibModal) {
    
    /* 1. DEFINE VARIABLES */
	var self = this;
    self.employee = {
		    		employeeId: null, 
		    		firstname: '', 
		    		lastname: '', 
		    		email: '',
		    		birth: '', 
		    		gender: '', 
		    		shift: '', 
		    		enabled: '', 
		    		address: '', 
		    		username: '',
		    		password: '',
		    		supervisor: ''
    			};
    
    self.event = {
    		eventId: '', 
    		name: '', 
    		ce: '', 
    		type: '', 
    		speaker: '', 
    		location: '', 
    		startTimeStamp: '', 
    		endTimeStamp: '', 
    		duration: ''
		}; 
	self.events = [];
	self.updatedEventList = [];
	
    self.employees_by_eventId = [];
                
    self.event_options = ["PENDING", "COMPLETED", "- - ALL - -"];
    self.selected_event = "- - ALL - -";
    self.checkboxModel_events = {};		// checkboxModel is an object which can hold a value inside the {}, checkboxModel[] is an array that can hold any number of checkboxModel objects, and checkboxModel[0] is an array element which contains a checkboxModel object.     
    								
    self.options = ["DAY SHIFT", "EVENING SHIFT", "NIGHT SHIFT", "- - ALL - -"];
    self.selectedOption = "- - ALL - -";
    self.checkboxModel = {};		
    								
    self.selectedEmployeeId;
    self.selectedEmployee;

    self.selectedEventId = 0;    
    
    self.searchText = '';      // search text in table data
    
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
	   
	self.column = "name";		// sorting - name can be eventId, name, ce etc.
	self.reverse = false;		// sorting (set true for desending order or false for ascending order)
	
	
	/* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
	init();
	
	
	function init() {
		/* url params */
	    var paramEventId = $routeParams.eventId;
	    if(paramEventId != undefined) {
	    	self.selectedEventId = paramEventId;
	    	console.log("selectedEventId=" + self.selectedEventId);
	    }
	    
	    /* show list of all events when page is loaded */
	    getAllEvents();
	    
	    /* while taking attendance show list of active employees only */
	    if(self.selectedEventId != 0) {
	    	getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId(self.selectedEventId);
	    }	
	    
    	/* 
    	 * save selectedEventstatus in localStorage instead of controller variable because when $location.path('/attendance/'+eventId)
    	 * is called inside selectEventForAttendanceFunc(), AttendanceController reloads again and the controller variable 
    	 * will no longer hold its value.
    	 */ 
	    if(localStorage.getItem('attendanceEventStatus')) {
	    	self.attendanceEventStatus = localStorage.getItem('attendanceEventStatus');      // to display 'Finish!' in attendance.html
	    	localStorage.removeItem('attendanceEventStatus');               // remove item 
	    };      
	    
	}
	
    

    /* 3. DECLARE FUNCTIONS FROM THE VIEW */
    self.selectShiftFunc = selectShiftFunc;	// to choose option from dropdown menu
    self.selectEventStatusFunc = selectEventStatusFunc;	// to choose option from dropdown menu
    self.selectEventForAttendanceFunc = selectEventForAttendanceFunc;
    self.updateAttendanceFunc = updateAttendanceFunc;	// to update employee to an event
    self.confirmEventCompletion = confirmEventCompletion;	// display confirmation modal
    self.updateEventStatusFunc = updateEventStatusFunc;		// update event status to COMPLETED
    self.onSearchTextFunc = onSearchTextFunc;
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
                self.events = response.data;              
                self.events = self.events.map(item => {
                	var obj = item.event;
                	obj.startTimeStamp = convertTimeStampToString(obj.startTimeStamp);
                	obj.endTimeStamp = convertTimeStampToString(obj.endTimeStamp);              
                	return obj;
                });
                console.log('self.events=', self.events);
                self.updatedEventList = self.events;
                setPage(1);		// initialize pagination
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
   /**
     * GET ALL ACTIVE MEDTECHS (PRESENT+ABSENT) IN THE EVENT USING EVENT ID 
     * Medtechs could be those who attended the event and those who did not attend the event.
     * Those medtechs who attended the event will have {employeeId: 2001, eventId = 5001, ...}
     * Those medtechs who did not attend the event will have {employeeId: 2002, eventId = 0, ...}
     * @param eventId
     * @return array of medtechs
     */
    function getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId(eventId){
    	AttendanceService.getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId(eventId)
            .then(
            function(response) {
                self.employees_by_eventId = response.data;
                self.updatedEmployeeList = self.employees_by_eventId;
                console.log('self.updatedEmployeeList=', self.updatedEmployeeList);
                
                /* SELECT OR DE-SELECT CHECKBOX BASED ON EMPLOYEE ATTENDANCE IN DATABASE
                 * check if 'selectedEventId' is equal to 'eventId_FK' retrieved from the database 
                 * if equal, set checkbox[employeeId] = true therefore, checkbox is selected
                 * if not equal, set checkbox[employeeId] = false therefore, checkbox is de-selected
                 */
                var a = 1;
                for(a=0; a < self.updatedEmployeeList.length; a++) {
                    if(self.updatedEmployeeList[a].eventId == self.selectedEventId) {
                    	self.checkboxModel[self.updatedEmployeeList[a].employeeId] = true;
                    }
                    else {
                    	self.checkboxModel[self.updatedEmployeeList[a].employeeId] = false;
                    }
                }
                
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }

    
    /**
     * GET ALL ACTIVE MEDTECHS (PRESENT+ABSENT) IN THE EVENT USING SHIFT 
     * @param shift 
     * @return array of medtechs
     */
    function getAllActiveMedtechsPresentAndAbsentInAnEventUsingShift(shift){
        var updatedList = self.employees_by_eventId;
        updatedList = updatedList.filter(emp => emp.shift == shift);        	
        self.updatedEmployeeList = updatedList;
        console.log("self.updatedEmployeeList=", self.updatedEmployeeList);
        
        /* SELECT OR DE-SELECT CHECKBOX BASED ON EMPLOYEE ATTENDANCE IN DATABASE
         * check if 'selectedEventId' is equal to 'eventId_FK' retrieved from the database 
         * if equal, set checkbox[employeeId] = true therefore, checkbox is selected
         * if not equal, set checkbox[employeeId] = false therefore, checkbox is de-selected
         */
        var a = 1;
        for(a=0; a < self.updatedEmployeeList.length; a++) {
            if(self.updatedEmployeeList[a].eventId == self.selectedEventId) {
            	self.checkboxModel[self.updatedEmployeeList[a].employeeId] = true;
            }
            else {
            	self.checkboxModel[self.updatedEmployeeList[a].employeeId] = false;
            }
        }

    }
    
    
    /**
     * UPDATE EMPLOYEE TO EVENTS_EMPLOYEES TABLE
     * @param employeeId and eventId
     * @return updated data from EVENTS_EMPLOYEES table
     */
    function updateAttendanceFunc(employeeId){
        console.log("employeeId= " + employeeId);
        console.log("selectedEventId= " + self.selectedEventId);
        // convert checkbox model data to String
        var stringCheckboxModel = JSON.stringify(self.checkboxModel[employeeId]);
        console.log("string checkboxModel= " + stringCheckboxModel.toString());
        // convert String data to JSON
        var JSONCheckboxModel = JSON.parse(stringCheckboxModel);
        // get the parameter value of JSON 
        console.error("JSONCheckboxModel["+employeeId+"]=" + JSONCheckboxModel);
        
        if(JSONCheckboxModel) {
        	console.error("checkbox is selected");
        	AttendanceService.addEmployeeToEvent(employeeId, self.selectedEventId)
            .then(
    	        function (response) {                
    	            console.log(response);
    	        },
    	        function(errResponse){
    	            console.log("errResponse=" + errResponse);
    	        }
    	    );
        }
        else {      
        	console.error("checkbox is de-selected");
        	AttendanceService.removeEmployeeFromEvent(employeeId, self.selectedEventId)
	        .then(
		        function (response) {                
		            console.log(response.data);
		        },        		
		        function(errResponse){
		        	console.error('errResponse=' + errResponse);
		        }
		    );
        }
    }
    

    /**
     * CONFIRM EVENT COMPLETION 
     */
    function confirmEventCompletion() {
    	var uibModalInstance_eventCompletion = $uibModal.open({
			templateUrl : './static/modules/attendance/views/confirmation-modal.html',
			controller : function($uibModalInstance, $scope, $location) {
				$scope.ok = function() {
					$uibModalInstance.close('Ok');
					updateEventStatusFunc();	// calling method
				};
				$scope.cancel = function() {
					$uibModalInstance.close('Cancel');
				};
			}
		});
    }
    
    
    /**
     * UPDATE EVENT STATUS TO COMPLETE
     * @param selectedEventId
     * @return 
     */
    function updateEventStatusFunc(){
        console.log("selectedEventId= " + self.selectedEventId);            
        AttendanceService.updateEventStatus(self.selectedEventId)
        	.then(
                function(response) {
                	console.log(response);
                	$location.path('/attendance_listEvents');	// go to this URL
                },
                function(errResponse){
                	console.error('errResponse=' + errResponse);
                }
            );   
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
     * SELECT EMPLOYEES BY SHIFT 
     * @param shift [{Day, 0}, {Evening, 1}, {Night, 2}]
     * @return list of employees
     */
    function selectShiftFunc(shift){
        console.log('shift=', shift);
        
        switch(shift) {
	        case "DAY SHIFT": {
	        	getAllActiveMedtechsPresentAndAbsentInAnEventUsingShift('DAY');	// calling method of AttendanceController
	        	break;
	        }
			case "EVENING SHIFT": {
				getAllActiveMedtechsPresentAndAbsentInAnEventUsingShift('EVENING');
	        	break;
			}
			case "NIGHT SHIFT": {
				getAllActiveMedtechsPresentAndAbsentInAnEventUsingShift('NIGHT');
	        	break;
			}	
			default: {
				getAllActiveMedtechsPresentAndAbsentInAnEventUsingEventId(self.selectedEventId);
	        	break;
			}
        }    
    }
    
    
    /**
     * SELECT EVENT AND GO TO '/attendance' URL
     * @param event_Id (URL param)
     * @return attendance.html
     */
    function selectEventForAttendanceFunc(eventId, event_status){
    	localStorage.setItem('attendanceEventStatus', event_status); 
		/* allow only ADMIN to take attendance if event_status is PENDING */
    	if(LoginService.getUser().roles.includes('ROLE_ADMIN') || event_status === 'PENDING') {
    		$location.path('/attendance/'+eventId);  	
    	}
    	else {
    		/* Other employees are not allowed to take attendance */
			var uibModalInstance_NoPermission = $uibModal.open({
				templateUrl : './static/modules/attendance/views/no-permission-modal.html',
				controller : function($uibModalInstance, $scope, $location) {
					$scope.cancel = function() {
						$uibModalInstance.close('cancel');
					};
				}
			});
    	}
    }
    
    
    /**
     * SEARCH TEXT IN THE TABLE 
     */
    function onSearchTextFunc(text) {
    	console.log('text=', text);
    	var searchText = text.toLowerCase();
        var list = self.events;
    	console.log('list=', list);
    	list = list.filter(function(event) {
    	    return (          // For {eventId: 5001, name: 'Malaria'}, Object.keys=['eventId', 'name',....] IF key='eventId' THEN event[key]=5001
    	        Object.keys(event).some(key =>
    	        	event[key].toString().toLowerCase().includes(searchText))
    	      );
    	});
    	self.updatedEventList = list;
    	console.log('self.updatedEventList=', self.updatedEventList);
        self.selected_event = '- - ALL - -';        // reset the options to '--ALL--'
        setPage(1);       // call Pagination method
    }
    
    
    /**
     * CONVERT TIMESTAMP TO STRING DATE
     * @param - 1556468100000
     * @return - '2020-03-21 15:00'
     */
    function convertTimeStampToString(timeStamp) {
		var date = new Date(timeStamp);
		var year = date.getFullYear();
		var month = 1 + date.getMonth();	// January = 0 and December = 11
		month = ('0' + month).slice(-2);	// single digit month such as 2 becomes two digit month 02
		var day = date.getDate();
		day = ('0' + day).slice(-2);		// single digit day such as 2 becomes two digit day 02
		var hours = date.getHours();
		var mins = date.getMinutes();
		mins = ('0' + mins).slice(-2);		// single digit mins such as 2 becomes two digit mins 02
		return year + '-' + month + '-' +  day + ' ' +  hours + ':' +  mins;
	}
    
    /**
     * PAGINATION - PaginationService acts as a constructor that initializes variables of pager object. 
     * @param pageNo
     * @return pager object from PaginationService
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