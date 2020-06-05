app.factory('PDFMakeService', function () {

    var factory = {
    		download: download
    };
    return factory;	
    
        
    //************************ DEFINE FACTORY METHODS *****************************//
    
    function download(employeeId, year, employee, _events) {
    	
    	var events = _events.map(event => {
    		var obj = event;
    		obj.startTimeStamp = formatEventTime(obj.startTimeStamp);
    		obj.endTimeStamp = formatEventTime(obj.endTimeStamp);
    		return obj;
    	})
    	   	
    	
    	var tbody = [];
    	
    	// define headers if you don't want to use default headers 'columns'
		var headers = ['ID', 'Name', 'CE Credits', 'Type', 'Speaker', 'Location', 'Duration', 'StartTime', 'EndTime'];
	    var tRow = [];
	    for(var i=0; i<9; i++) {
		    var obj = {};
	    	obj.text = headers[i];
	    	obj.bold = true; 
	    	obj.fontSize = 10; 
	    	obj.color = 'gray';
	    	tRow.push(obj);
	    }
	    tbody.push(tRow);
	    
	    for(var i=0; i<events.length; i++) {
		    var tRow = [];
		    tRow.push(events[i].eventId);
		    tRow.push(events[i].name);
		    tRow.push(events[i].ce);
		    tRow.push(events[i].event_type);
		    tRow.push(events[i].speaker);
		    tRow.push(events[i].location);
		    tRow.push(events[i].duration);
		    tRow.push(events[i].startTimeStamp);
		    tRow.push(events[i].endTimeStamp);
		    tbody.push(tRow);
	    }    
	    console.log('tbody=', tbody);
	    
    	
    	var now = new Date().getTime();  // to milliseconds or timestamp
    	now = formatDate(now);
    	
    	
    	// 1. create PDF file using data
		var docDefinition = {				
    		header: [
    			// place name and employeeId in content to align it with table
    		],
	    		
			content: [  				
				{
		    		columns: [
		    	        {
		    	          // auto-sized columns have their widths based on their content
		    	          //width: 'auto',
		    	          text: 'Name: ' + employee.firstname + ' ' + employee.lastname,
		    	          alignment: 'left', 
		    	          fontSize: 10
		    	        },
		    	        {
		    	          // star-sized columns fill the remaining space
		    	          // if there's more than one star-column, available width is divided equally
		    	          //width: '*',
		    	          text: 'FY' + year,
		    	          alignment: 'right', 
		    	          fontSize: 10
		    	        }
		    	    ],
		    	},
		    	{ text: 'Employee ID: ' + employeeId, fontSize: 10, bold: false, margin: [0, 0, 0, 10] },   	// margin: [left, top, right, bottom]
				{
					style: 'tableExample',
					table: {
						headerRows: 1,
						body : tbody		// var tbody = [];
					},
					layout: 'lightHorizontalLines'     // specifying this layout will automatically put styling to your table
				},
				{ text: 'Number of Events: ' + events.length, fontSize: 10, bold: false, margin: [0, 20, 0, 0] },
				{ text: 'Total CEs: ' + totalCEsFunc(), fontSize: 10, bold: false, margin: [0, 0, 0, 0] },			
			],
			
			footer: {
		        columns: [
		          { text: 'Date printed on: ' + now, alignment: 'center', bold: false, fontSize: 10 }
		        ]
		    },
		      
			styles: {
				header: {
					fontSize: 2,
					bold: true,
					margin: [0, 0, 0, 0]
				},
				subheader: {
					fontSize: 2,
					bold: true,
					margin: [0, 10, 0, 0]
				},
				tableExample: {                // style for tableExample
					fontSize: 9,
					margin: [0, 0, 0, 0]
				},
				tableOpacityExample: {
					margin: [0, 5, 0, 15],
					fillColor: 'blue',
					fillOpacity: 0.3
				},
				tableHeader: {
					bold: true,
					fontSize: 10,
					color: 'gray'
				}
			},
			defaultStyle: {
				// alignment: 'justify'
			}
		};
    	
		
    	// 2. Download PDF file to your device
    	var date = new Date();  
    	date = date.getTime();
        //pdfMake.createPdf(docDefinition).download('PDF'+date+'.pdf');
        
        
        // 3. Open PDF file
        pdfMake.createPdf(docDefinition).open();            // to open pdf in new window  
        
        
        /**
         * convert timestamp(milliseconds) to EventStartTime and EventEndTime
         */
    	function formatEventTime(timeStamp) {
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
    	 * format timestamp(milliseconds) to String format to print at the bottom of the page
    	 */
    	function formatDate(timeStamp) {
			var date = new Date(timeStamp);
			var year = date.getFullYear();
			var month = 1 + date.getMonth();	// January = 0 and December = 11
			month = ('0' + month).slice(-2);	// single digit month such as 2 becomes two digit 02
			var day = date.getDate();
			day = ('0' + day).slice(-2);		// single digit day such as 2 becomes two digit 02
			var hours = date.getHours();
			var mins = date.getMinutes();
			mins = ('0' + mins).slice(-2);		// single digit mins such as 2 becomes two digit 02
			var sec = date.getSeconds();
			sec = ('0' + sec).slice(-2);		// single digit sec such as 2 becomes two digit 02
			return month + '/' + day + '/' +  year + ' ' +  hours + ':' +  mins + ':' + sec;
    	}
    	
    	
    	/**
         * Total CE calculation
         */
        function totalCEsFunc() {
        	var total = 0;
        	for(var i=0; i<_events.length; i++) {
        		total = total + _events[i].ce;
        	}
        	return total;
        }
        
        
    };
});


