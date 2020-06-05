app.controller('EmployeesController', ['$scope', '$location', '$timeout', '$window', 'EmployeeService', 'EmployeesService', 'RootStorage', '$localStorage', 'LoginService', 'PaginationService',
	function($scope, $location, $timeout, $window, EmployeeService, EmployeesService, RootStorage, $localStorage, LoginService, PaginationService) {
	
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
    self.employees = [];
    self.updatedEmployeeList = [];                // used to update view instead of using self.employees
    self.medtechs_and_eventId = [];
    self.employees_per_supervisor = [];
      
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
	self.events_by_EmployeeId = [];
	self.events_by_EmployeeId_and_Year = [];	
      
   
    self.employeeTypes = ["MEDTECH", "SUPERVISOR", "ADMIN", "ACTIVE", "INACTIVE", "DAY SHIFT", "EVENING SHIFT", "NIGHT SHIFT", "- - ALL - -"];
    self.selectedEmployeeType = "- - ALL - -";
    
    
    self.options = ["- - ALL - -", "DAY SHIFT", "EVENING SHIFT", "NIGHT SHIFT"];
    self.selectedOption = "- - ALL - -";
    
    self.checkboxModel = {};		// checkboxModel is an object which can hold a value inside the {}, checkboxModel[] is an array that can hold any number of checkboxModel objects,
    								// and checkboxModel[0] is an array element which contains a checkboxModel object. It is used in checking if employee is present or absent in attendance
    
    self.selectedEmployeeId;
    self.selectedEmployee;
    
    self.selectedYear = 0;
    self.selectedEventId = 0;
    
    self.employees_per_page; 	//pagination
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
	
	self.alertMsg = '';       // alert message when event is created, updated, deleted
	
	self.column = "name";		// sorting - name can be employeeId, firstname, lastname etc.
	self.reverse = false;		// sorting (set true for desending order or false for ascending order)
	
	
    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
     
    function init() {
		/* check whether user is supervisor */
	    if(LoginService.getUser().roles.includes('ROLE_SUPERVISOR')) {
	    	self.supervisorId = LoginService.getUser().employeeId;
	    	listAllEmployeesBySupervisorId(); 	
	    }
	     
	    /* check whether user is admin */
	    if(LoginService.getUser().roles.includes('ROLE_ADMIN')) {
	    	getAllEmployees();			// call only if logged in user is admin because when supervisor is logged in it throws errorResponse due to priviledge.
	    }
	    	    
	    /* url params */
	    var urlParams = $location.search(); 
	    if(urlParams.selectedEmployeeId != undefined) {
	    	self.selectedEmployeeId = urlParams.selectedEmployeeId;
	    	getEmployeeById(self.selectedEmployeeId);
	    	console.error("selectedEmployeeId=" + self.selectedEmployeeId);
	    	RootStorage.setItem("selectedEmployeeId", self.selectedEmployeeId);		// add 'selectedEmployeeId' to RootFactory
	        console.error("EmployeeController: RootStorage.getItem('selectedEmployeeId')=" + RootStorage.getItem('selectedEmployeeId'));
	    }
	    if(urlParams.selectedYear != undefined) {
	    	self.selectedYear = urlParams.selectedYear;
	    	console.error("selectedYear=" + self.selectedYear);
	    	RootStorage.setItem("selectedYear", self.selectedYear);					// add 'selectedYear' to RootFactory
	        console.error("EmployeeController: RootStorage.getItem('selectedYear')=" + RootStorage.getItem('selectedYear'));
	    }
	    if(urlParams.event_Id != undefined) {
	    	self.selectedEventId = urlParams.event_Id;
	    	console.error("selectedEventId=" + self.selectedEventId);
	    }
	    	    
	    if(self.selectedEventId != 0) {
	        getAllMedtechsAndEventId();
	    }	
    }
    
    
    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    self.selectShiftFunc = selectShiftFunc;	// to choose option from dropdown menu
    self.attendanceFunc = attendanceFunc;	// to update employee to an event
    self.eventsPerYearByEmployeeFunc = eventsPerYearByEmployeeFunc; // to find events by employee id    
    self.listEmployeesBySupervisorFunc = listEmployeesBySupervisorFunc;
    self.employeesByTypeFunc = employeesByTypeFunc;
    self.editFunc = editFunc;		// employees.html
    self.getShiftFunc = getShiftFunc;
    self.changeStatusFunc = changeStatusFunc;
    self.convertStatusNameToBoolFunc = convertStatusNameToBoolFunc;
    self.sortColumn = sortColumn;
    self.sortClass = sortClass;
       

    /* 4. DEFINE FUNCTIONS */
    
    /**
     * EMPLOYEES LEFT JOIN EVENTS_EMPLOYEES
     * @param eventId
     * @return list of medtechs and eventId_fk column
     */
    function getAllMedtechsAndEventId(){
    	EmployeesService.getAllMedtechsAndEventId(self.selectedEventId)
            .then(
            function(response) {
                self.medtechs_and_eventId = response;
                console.log(self.medtechs_and_eventId);
                
                /* SELECT OR DE-SELECT CHECKBOX BASED ON EMPLOYEE ATTENDANCE IN DATABASE
                 * check if 'selectedEventId' is equal to 'eventId_FK' retrieved from the database 
                 * if equal, set checkbox[employeeId] = true therefore, checkbox is selected
                 * if not equal, set checkbox[employeeId] = false therefore, checkbox is de-selected
                 */
                var a = 1;
                for(a=0; a < self.medtechs_and_eventId.length; a++) {
                    if(self.medtechs_and_eventId[a].eventId == self.selectedEventId) {
                    	self.checkboxModel[self.medtechs_and_eventId[a].employeeId] = true;
                    }
                    else {
                    	self.checkboxModel[self.medtechs_and_eventId[a].employeeId] = false;
                    }
                }
                
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * GET EVENTS BY EMPLOYEEID AND YEAR
     * @param employeeId & year (both integers)
     * @return array of events 
     */
    function getEventsByEmployeeIdAndYear(selectedEmployeeId, selectedYear){
    	EmployeesService.getEventsByEmployeeId(selectedEmployeeId)
        .then(
	        function(response) {
	            self.events_by_EmployeeId = response;                
	            console.log(self.events_by_EmployeeId);
	            
	            /* 
                 * find year of 'startTimeStamp' of each event and add those events
                 * to self.events_by_EmployeeId_and_Year[] 
                 */          	         
	            var count = 0; var CEs=0; var num=0;
        		for(count; count < self.events_by_EmployeeId.length; count++) {  
        			var event_year = new Date(self.events_by_EmployeeId[count].event.startTimeStamp).getFullYear();
        			console.log("event_year["+count+"]=" + event_year);
                	if(event_year == selectedYear) {
                		console.log(event_year + "["+count+"]="+selectedYear);
                    	self.events_by_EmployeeId_and_Year.push(self.events_by_EmployeeId[count]);
                    	num+=1;
                    	CEs+=self.events_by_EmployeeId[count].event.ce;
                	}
            	}
        		self.totalEvents=num;
        		self.totalCEs=CEs;
        		
        		/* ZING CHART - DISPLAY NUMBER OF EVENTS FOR EACH MONTH FOR ANY GIVEN YEAR */
        		/* 
                 * find month of 'startTimeStamp' of each event in a given year and add the ce's of those events
                 * and store in self.months[11]. 
                 */                                  
                var month = 0;                
            	for(month; month < 12; month++) {          		
            		var count=0; var totalCE=0; var totalEvent=0;
            		for(count; count < self.events_by_EmployeeId_and_Year.length; count++) {  
            			var event_month = new Date(self.events_by_EmployeeId_and_Year[count].event.startTimeStamp).getMonth();
            		//	console.log("event_month["+count+"]=" + event_month);
	                	if(month == event_month) {
	                    	totalCE += self.events_by_EmployeeId_and_Year[count].event.ce;
	                    	totalEvent+=1;
	                	}
                	}         		
            		self.ZingEventCEs[month] = totalCE;
            		self.ZingEvents[month] = totalEvent;
                }

            	/* ZingChart Initialization */
                zingchart.render({
                    id: 'myChart',
                    height: "100%",
                    width: "100%",
                    data: {
            		        "type": "bar",
            		        "plot":{
            		            "aspect":"histogram"
            		        },
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
            		        	text: "Monthly CEs and Events for " + RootStorage.getItem('selectedLastname') + ", " + RootStorage.getItem('selectedFirstname')
            		        			// get 'selectedFirstname' and 'selectedLastname' from RootFactory
            		        },
            		        "scale-x":{
            		            "labels": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            		            "label": { "text": "Months in a Year"}
            		        },  
            		        "scale-y":{           		            
            		            "label": { "text": "Count in numbers"}
            		        },
            		        "series": [            		        	
            		        	{ 
            		        		values: self.ZingEvents, 
            		        		text: "Events"		// legend item name
            		        	},
            		        	{ 
            		        		values: self.ZingEventCEs, 
            		        		text: "CEs"			// legend item name
            		        	}
            		        ]
            	        }
                });
	        },
	        function(errResponse){
	        	console.log('errResponse=' + errResponse);
	        }
	    );
	}
    

    
    /**
     * GET ALL EMPLOYEES 
     * @param 
     * @return array of employees
     */
    function getAllEmployees(){
    	EmployeesService.getAllEmployees()
            .then(
            function(response) {
            	var response = response.data;               // response.data = [ {employee: {}, links: {}}, {employee: {}, links: {}}, {employee: {}, links: {}}... ]
            	response = response.map(x => x.employee);   // response = [ {id: '', firstname: '', lastname: ''...}, {}, {}... ]
                self.employees = response;
                self.updatedEmployeeList = response;
                console.log('self.employees=', self.employees);
                setPage(1);		// call pagination method to set 1st page
                
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    
    /**
     * GET EMPLOYEES BY SHIFT
     * @param shiftId
     * @return list of employees
     */
    function getEmployeesByShift(shiftId){
    	EmployeesService.getEmployeesByShift(shiftId)
            .then(
            function(response) {
                self.employees_and_eventId = response;
                console.log(self.employees_and_eventId);
                
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }

    
    /**
     * GET EMPLOYEE BY ID
     * @param employeeID
     * @return employee
     */
    function getEmployeeById(employeeId){
    	EmployeesService.getEmployeeById(employeeId)
            .then(
            function(response) {
                self.selectedEmployee = response;
                console.error(self.selectedEmployee);
                
                RootStorage.setItem("selectedFirstname", self.selectedEmployee.employee.firstname);		// add 'selectedFirstname' to RootStorage
                RootStorage.setItem("selectedLastname", self.selectedEmployee.employee.lastname);			// add 'selectedLastname' to RootStorage
                console.log("EmployeesController: RootStorage.getItem('selectedFirstname')=" + RootStorage.getItem('selectedFirstname'));
                console.log("EmployeesController: RootStorage.getItem('selectedLastname')=" + RootStorage.getItem('selectedLastname'));                              
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    

    /**
     * SELECT EMPLOYEES BY TYPE 
     * @param 'MEDTECH', 'ADMIN', 'SUPERVISOR', 'ACTIVE', 'INACTIVE'
     * @return list of employees
     */
    function employeesByTypeFunc(name){
    	console.log('name=', name);
    	if(name == "ACTIVE" || name == "INACTIVE") {
    		var list = self.employees;
            self.updatedEmployeeList  = list.filter(employee => employee.enabled == convertStatusNameToBoolFunc(name)); 
            console.log('self.updatedEmployeeList=', self.updatedEmployeeList);
            setPage(1);		// call pagination method to set 1st page
    	}
    	else if(name == "ADMIN" || name == "SUPERVISOR" || name == "MEDTECH") {
    		var list = self.employees;
            self.updatedEmployeeList  = list.filter(employee => employee.employee_type == name); 
            console.log('self.updatedEmployeeList=', self.updatedEmployeeList);
            setPage(1);		// call pagination method to set 1st page
    	}
    	else if(name == "DAY SHIFT" || name == "EVENING SHIFT" || name == "NIGHT SHIFT") {
    		var list = self.employees;
            self.updatedEmployeeList  = list.filter(employee => employee.shift == getShiftFunc(name)); 
            console.log('self.updatedEmployeeList=', self.updatedEmployeeList);
            setPage(1);		// call pagination method to set 1st page
    	}
    	else {		// name = "--ALL--"
    		getAllEmployees();
    	}
    	
    }
    
    
    
    /**
     * CONVERT NAME STATUS TO BOOLEAN
     * @param "ACTIVE", "INACTIVE"
     * @return true, false
     */
    function convertStatusNameToBoolFunc(name){
        switch(name) {
	        case "ACTIVE": {
	        	return true;
	        }	
			default: {        // case: "INACTIVE"
	        	return false;
			}
        }    
    }
    
    
    /**
     * GET SHIFT FROM SHIFT OPTIONS
     * @param "DAY SHIFT"
     * @return "DAY"
     */
    function getShiftFunc(name){
        switch(name) {
	        case "DAY SHIFT": {
	        	return "DAY";
	        }
	        case "EVENING SHIFT": {
	        	return "EVENING";
	        }	        
			default: {        // case: "NIGHT SHIFT"
	        	return "NIGHT";
			}
        }    
    }
    
    
    
    /**
     * SELECT EMPLOYEES BY SHIFT 
     * @param shift [{Day, 0}, {Evening, 1}, {Night, 2}]
     * @return list of employees
     */
    function selectShiftFunc(num){
        switch(num) {
	        case "DAY SHIFT": {
	        	getEmployeesByShift(0);
	        	break;
	        }
			case "EVENING SHIFT": {
				getEmployeesByShift(1);
	        	break;
			}
			case "NIGHT SHIFT": {
				getEmployeesByShift(2);
	        	break;
			}	
			default: {
	        	self.employees_and_eventId = self.employees;
	        	break;
			}
        }    
    }

    
    /**
     * SAVE EMPLOYEE ATTENDANCE TO THE EVENTS_EMPLOYEES TABLE
     * @param employeeId and eventId
     * @return updated data from EVENTS_EMPLOYEES table
     */
    function attendanceFunc(employeeId){
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
        	EmployeesService.addEventToEmployee(employeeId, self.selectedEventId)
            .then(
    	        function (response) {                
    	            console.log(response.data);
    	        },
    	        function(errResponse){
    	        	console.log('errResponse=' + errResponse);
    	        }
    	    );
        }
        else {
        	console.error("checkbox is de-selected");
        	EmployeesService.removeEventFromEmployee(employeeId, self.selectedEventId)
	        .then(
		        function (response) {                
		            console.log(response.data);
		        },        		
		        function(errResponse){
		        	console.log('errResponse=' + errResponse);
		        }
		    );
        }
    }
    
    /**
     * LIST EMPLOYEES BY SUPERVISOR ID
     * @param supervisorId
     * @return arrray of employees
     */
    function listAllEmployeesBySupervisorId(){
    	EmployeesService.listAllEmployeesBySupervisorId(self.supervisorId)
        .then(
            function(response) {
                var resp = response.data;
                resp = resp.map(x => x.employee);
                self.supervisor_employees = resp;
                console.log('self.supervisor_employees=', self.supervisor_employees);
                
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * GO TO '/events_by_employee' URL
     * @param employeeId
     * @return 
     */
    function eventsPerYearByEmployeeFunc(employeeId){
    	$location.path('/events_by_employee')									// specify URL name in path()
    			.search({selectedEmployeeId: String(employeeId)});  	   
    }
    

    /**
     * GO TO '/supervisorsMedtechs' URL
     * @param selectedSupervisorId
     * @return 
     */
    function listEmployeesBySupervisorFunc(selectedSupervisorId){
    	console.log("selectedSupervisorId=" + selectedSupervisorId);
    	$location.path('/supervisorsMedtechs').search({selectedSupervisorId: String(selectedSupervisorId)});  		// specify URL name in path()
   
    }   
    
 
    /**
     * GO TO '/registerMedtech' URL
     * @param employeeId
     * @return 
     */
    function editFunc(employeeId){
    	console.log("Edit: employeeId=" + employeeId);
    	$location.path('/registerEmployee/' + employeeId);  		// specify URL name in path()
   
    }   
    
    
    /**
     * CHANGE STATUS OF EMPLOYEE
     * @param employeeId
     * @return array of employee
     */
    function changeStatusFunc(employeeId){
    	console.log("Edit: employeeId=" + employeeId);
    	EmployeeService.changeEmployeeStatus(employeeId)
        .then(
            function(response) {
            	if(response.status == 400) {
        			self.alertMsg = response.data.message;
                	$timeout(function() {
                		self.alertMsg = '';
                     }, 2000);
            	}
            	else {
            		self.employees = response;
                    console.log(self.employees);
            		$window.location.reload();			// reload the page        
            	}
                     
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );  
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
		if(self.updatedEmployeeList.length > 0) {
			self.pager = PaginationService.getPager(self.updatedEmployeeList.length, pageNo);
			self.employees_per_page = self.updatedEmployeeList.slice(self.pager.startIndex, self.pager.endIndex + 1);
		} else {
			self.employees_per_page = "";
		}
		
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
	function sortClass(column) {			// column = event.eventId
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