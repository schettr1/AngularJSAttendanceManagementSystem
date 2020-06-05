/**
 * This is alternate service to PDFMakeService.js
 * It performs the same task as that of PDFMakeService but the
 * code has been written slightly different.
 * @auth Surya Chettri
 */

app.factory('DownloadService', function () {

    var factory = {
    		download: download
    };
    return factory;	
    
        
    //************************ DEFINE FACTORY METHODS *****************************//
    
    function download(employeeId, year, employee, _events) {
    	
    	// modify event date
    	var events = _events.map(event => {
    		var obj = event;
    		obj.startTimeStamp = formatDate(obj.startTimeStamp);
    		obj.endTimeStamp = formatDate(obj.endTimeStamp);
    		return obj;
    	})   	    	
    	
    	var now = new Date();
    	now = now.getMonth() + '/' + now.getDay() + '/' + now.getFullYear() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    	
    	
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
		    	{ text: 'Employee ID: ' + employeeId, fontSize: 10, bold: false, margin: [0, 0, 0, 10] },   // margin: [left, top, right, bottom]
		        
				// call table function - array[] contains parameter of events
				table(events, ['eventId', 'name', 'ce', 'event_type', 'speaker', 'location', 'duration', 'startTimeStamp', 'endTimeStamp']),
				
				{ text: 'Number of Events: ' + events.length, fontSize: 10, bold: false, margin: [0, 20, 0, 0]  },
				{ text: 'Total CEs: ' + totalCEsFunc(), fontSize: 10, bold: false, margin: [0, 0, 0, 0] }
		    ],
		    
		    footer: {
		        columns: [
		          { text: 'Date printed on: ' + now, alignment: 'center', bold: false, fontSize: 10 }
		        ]
		      },
		}

    	   	
    	function table(data, columns) {
		    return {
		    	fontSize: 9, margin: [0, 0, 0, 0],		// tableExample
		        table: {
		            headerRows: 1,
		            body: buildTableBody(data, columns)
		        },
		        layout: 'lightHorizontalLines'         // table border styling
		    };
		}
    	
    	
    	// Table Body contains Header and Content
    	function buildTableBody(data, columns) {					// data = events && columns = ['eventId', 'name', ....]
    		console.log('columns[1]=', columns[1]);
    		
    		// define headers if you don't want to use default headers 'columns'
    		var headers = ['ID', 'Name', 'CE Credits', 'Type', 'Speaker', 'Location', 'Duration', 'StartTime', 'EndTime'];
    		
    		var body = [];	
		    var thead = [];
		    for(var i=0; i<columns.length; i++) {
			    var td = {};		// if you define td{} object before the for..loop, it will push only the last td{} object to the thead[] array. 
		    	td.text = headers[i];
		    	td.bold = true; 
		    	td.fontSize = 10; 
		    	td.color = 'gray';
		    	thead.push(td);
		    }
		    console.log('thead=', thead);
		    body.push(thead);
		    
		    data.forEach(function(row) {
		        var dataRow = [];		
		        columns.forEach(function(column) {
		            dataRow.push(row[column].toString());
		        })		
		        body.push(dataRow);
		    });		
		    return body;
		}
		

    	
    	var date = new Date();
    	date = date.getMonth() + '/' + date.getDay() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    	
		
		
    	// 2. Download PDF file to your device
    	var date = new Date();  
    	date = date.getTime();
        //pdfMake.createPdf(docDefinition).download('PDF'+date+'.pdf');
        
        
        // 3. Open PDF file
        pdfMake.createPdf(docDefinition).open();            // to open pdf in new window  
        
        
        
        /**
         * Formate Date  
         */
        function formatDate(timeStamp) {
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
