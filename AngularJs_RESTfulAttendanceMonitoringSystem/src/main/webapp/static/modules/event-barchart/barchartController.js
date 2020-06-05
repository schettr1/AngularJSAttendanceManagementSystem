app.controller('BarchartController', ['$scope', '$location', 'BarchartService', 'PDFMakeService', 'EmployeeService', 'EmployeesService', 'RootStorage', 
	function($scope, $location, BarchartService, PDFMakeService, EmployeeService, EmployeesService, RootStorage) {
	
    /* 1. DEFINE VARIABLES */

	var self = this;     
    self.event = {};  
	self.events_per_year_by_employee = [];
      
    self.selectedEmployeeId = '';
    self.selectedEmployee = {};
    self.selectedYear = '';
	
    // list-events variables
	self.totalEvents = 0;
	self.totalCEs = 0;
	
	// barchart-data variables
	self.ZingEventCEs = [];
	self.ZingEvents = [];
	
    
    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
	init();
		
	function init() {
		/* url params - selectedEmployeeId & selectedYear */
	    var urlParams = $location.search(); 
	    if(urlParams.selectedEmployeeId != undefined) {
	    	self.selectedEmployeeId = urlParams.selectedEmployeeId;
	    	EmployeeService.getEmployeeById(self.selectedEmployeeId)		// to use employee first and last name in barchart
	        .then(
		        function(response) {
		            self.selectedEmployee = response.data.employee;
		            console.log('self.selectedEmployee=', self.selectedEmployee);	            
		        },
		        function(errResponse){
		        	console.log('errResponse=' + errResponse);
		        }
		    );
	    }
	    if(urlParams.selectedYear != undefined) {
	    	self.selectedYear = urlParams.selectedYear;
	    	console.log("selectedYear=" + self.selectedYear);
	    }
	    

	    if(self.selectedEmployeeId != undefined && self.selectedYear != undefined) {
	    	console.log("self.selectedYear=" + self.selectedYear + "& self.selectedEmployeeId=" + self.selectedEmployeeId);
	        /* CALL THIS METHOD WHEN BOTH selectedYear AND selectedEmployeeId EXIST OR ARE DEFINED, ELSE THESE METHODS WILL THROW ERROR */
	    	getEventsPerYearByEmployee();
	    }

	}
    
    
	/* 3. DECLARE FUNCTIONS FROM THE VIEWS */
	self.downloadFileFunc = downloadFileFunc;
	
	
    /* 4. DEFINE FUNCTIONS */	
    /**
     * FIND EVENTS PER YEAR BY EMPLOYEE
     * @param year(4 digits) & employeeId
     * @return array of events 
     */
    function getEventsPerYearByEmployee(){
    	BarchartService.listEventsPerYearByEmployee(self.selectedYear, self.selectedEmployeeId)
        .then(
	        function(response) {
	            var list = response.data;
	            list = list.map(x => x.event);
	            self.events_per_year_by_employee = list;
	            console.log('self.events_per_year_by_employee=', self.events_per_year_by_employee);
	            
	            /* 
                 * calculate total CEs per year for the employee
                 */          	         
	            var CEs=0; var count=0;
        		for(var num=0; num < self.events_per_year_by_employee.length; num++) {  
                    CEs += self.events_per_year_by_employee[num].ce;
                    count++;
            	}
        		self.totalEvents=count;
        		self.totalCEs=CEs;
        		
        		/* ZING CHART - DISPLAY NUMBER OF EVENTS FOR EACH MONTH FOR ANY GIVEN YEAR 
                 * find month of 'startTimeStamp' of each event in a given year and add the ce's of those events
                 * and store in self.months[11]. 
                 */                                  
                var month = 0;                
            	for(month; month < 12; month++) {          		
            		var totalCE=0; var totalEvent=0;
            		for(var num=0; num < self.events_per_year_by_employee.length; num++) {  
            			var event_month = new Date(self.events_per_year_by_employee[num].startTimeStamp).getMonth();
            			//console.error("event_month["+num+"]=" + event_month);
	                	if(event_month == month) {
	                    	totalCE += self.events_per_year_by_employee[num].ce;
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
            		            "y":"12%",		// height
            		        },
            		        "title": {
            		        	text: "Events and CEs by Month"
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
     * DOWNLOAD FILE FROM SERVER 
     */
    function downloadFileFunc() {
    	PDFMakeService.download(self.selectedEmployeeId, self.selectedYear, self.selectedEmployee, self.events_per_year_by_employee);    	
    }
    
}]);