/**
 * custom filter is used to filter any request so we can process or manipulate the data 
 * We want to convert startTimeStamp and endTimeStamp to a proper date '2017-02-14 14:50'
 * Our browser is getting the date in form of '1556468100000'
 * In JS, if we use new Date(1556468100000), it will give us 
 * 'Thu Nov 02 2017 10:00:00 GMT-0400 (Eastern Daylight Time)'
 * In this filter, we will do the same thing.
 * 
 * If you define custom filter in filter folder,
 * remember to specify path of your custom filter like controllers and services in your index page or main page.
 * Or else it will give Error: Unknown Provider DataFilter in the console of your browser [Fn + F12 keys combination].
 * 
 */ 



app.filter('DateFilter', function() {
	/**
	 * converts UNIX timestamp (111844800000) to Date object 
	 * which is compatible to HTML form element type 'datetime-local'
	 */
	return function(timeStamp) {
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
});


app.filter('StatusFilter', function() {
	
	return function(enabled) {
		//console.log(enabled);
		if(enabled === 'PENDING') {
			console.log(true);
			return true;
		}
		else {
			console.log(false);
			return false;
		}
	}	
});


app.filter('BirthFilter', function() {
	
	return function(birth) {
		//console.log('birth=', birth);
		return String(birth).slice(0, 10);	// include 0 but not 10 position
	}
});