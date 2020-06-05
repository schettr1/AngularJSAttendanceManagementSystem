app.controller('PiechartController', ['$scope', '$location', 'PiechartService', 'EventService', 'EventsService',
		function($scope, $location, PiechartService, EventService, EventsService) {
	
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
    self.pieChartGenderDATA = [];
    self.pieChartShiftDATA = []; 
    self.male = '';
    self.female = '';
    self.other = '';
    self.day = '';
    self.evening = '';
    self.night = '';
	

    /* 2. CALL THIS METHOD WHEN PAGE IS LOADED */
    init();
    
    function init() {
    	// param variables
    	var urlParam = $location.search(); 
        if(urlParam.selectedEventId != undefined) {
        	self.selectedEventId = urlParam.selectedEventId;
        	console.error("selectedEventId=" + self.selectedEventId);
        	getGenderPercentByEventId(self.selectedEventId);
        	getShiftPercentByEventId(self.selectedEventId);
        	getEventById(self.selectedEventId);
        }	
    }
    

    

    /* 3. DECLARE FUNCTIONS FROM THE VIEWS */
    
    
    

    /* 4. DEFINE FUNCTIONS */
    /**
     * FIND EVENT BY ID
     * @param event Id
     * @return event
     */
    function getEventById(eventId){
        EventService.getEventById(eventId)
        .then(
            function(response) {        // response.data = {event: {}, links: {}}
                self.event = response.data.event;
                console.log('self.event=', self.event);
            },
			function(errResponse){
            	console.log('errResponse=' + errResponse);
			}
        );
    }
    
    
    /**
     * GET GENDER PERCENT BY EVENT ID
     * @param event Id
     * @return array containing 'gender' and 'percent' 
     */
    function getGenderPercentByEventId(eventId){
        PiechartService.getGenderPercentByEventId(eventId)
            .then(
            function(response) {
                self.pieChartGenderDATA = response.data;
                console.error('self.pieChartGenderDATA=', self.pieChartGenderDATA);
                if(self.pieChartGenderDATA.filter(x => x.gender == 1).length > 0) {
                	self.male = self.pieChartGenderDATA.filter(x => x.gender == 1)[0].count;
                } else {
                	self.male = 0;
                }  
                console.log('male=', self.male);
                if(self.pieChartGenderDATA.filter(x => x.gender == 2).length > 0) {
                	self.female = self.pieChartGenderDATA.filter(x => x.gender == 2)[0].count;
                } else {
                	self.female = 0;
                }  
                console.log('female=', self.female);
                if(self.pieChartGenderDATA.filter(x => x.gender == 0).length > 0) {
                	self.other = self.pieChartGenderDATA.filter(x => x.gender == 0)[0].count;
                } else {
                	self.other = 0;
                }                
                console.log('other=', self.other);
                
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
                	if(self.pieChartGenderDATA[a].gender == 1) {		// 1 means MALE
                		ValueTextArray[0].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].gender == 2) {        // 2 means FEMALE
                		ValueTextArray[1].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].gender == 0) {        // 0 means OTHER
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
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
    
    /**
     * GET SHIFT PERCENT BY EVENT ID
     * @param event Id
     * @return array containing 'shift' and 'percent' 
     */
    function getShiftPercentByEventId(eventId){
    	PiechartService.getShiftPercentByEventId(eventId)
            .then(
            function(response) {
            	self.pieChartGenderDATA = response.data;
                console.error('self.pieChartGenderDATA=', self.pieChartGenderDATA);
                if(self.pieChartGenderDATA.filter(x => x.shift == 0).length > 0) {
                	self.day = self.pieChartGenderDATA.filter(x => x.shift == 0)[0].count;
                } else {
                	self.day = 0;
                }  
                console.log('day=', self.day);
                if(self.pieChartGenderDATA.filter(x => x.shift == 1).length > 0) {
                	self.evening = self.pieChartGenderDATA.filter(x => x.shift == 1)[0].count;
                } else {
                	self.evening = 0;
                }  
                console.log('evening=', self.evening);
                if(self.pieChartGenderDATA.filter(x => x.shift == 2).length > 0) {
                	self.night = self.pieChartGenderDATA.filter(x => x.shift == 2)[0].count;
                } else {
                	self.night = 0;
                }                
                console.log('night=', self.night);
                
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
                	if(self.pieChartGenderDATA[a].shift == 0) {      // 0 means DAY
                		ValueTextArray[0].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].shift == 1) {      // 1 means EVENING
                		ValueTextArray[1].values[0] = self.pieChartGenderDATA[a].percent;
                	}
                	if(self.pieChartGenderDATA[a].shift == 2) {       // 2 means NIGHT
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
            		        	text: "Distribution by Shift"        		   // get 'selectedFirstname' and 'selectedLastname' from RootFactory
            		        },
            		        "series": ValueTextArray
            	        }
                });                
            },
            function(errResponse){
            	console.log('errResponse=' + errResponse);
            }
        );
    }
    
	
}]);