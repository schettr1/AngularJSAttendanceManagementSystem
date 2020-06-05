app.factory('PaginationService', function(){
		
	var factory = {
			getPager: getPager
	};
	return factory;


	function getPager(totalItems, currentPageNo, pageSize) {
		currentPageNo = currentPageNo || 1;	// if pageNo is not selected default currentPageNo to 1
		pageSize = pageSize || 10;			// default page size is 10
		var totalPages = Math.ceil(totalItems / pageSize);	// calculate total pages
		
		var startPage, endPage;
		
		// less than 10 total pages so show all
		if (totalPages <= 10) {
			startPage = 1;
			endPage = totalPages;
		} 
		// more than 10 total pages so calculate start and end pages
		else {			
			if (currentPageNo <= 6) {
				startPage = 1;
				endPage = 10;
			} else if (currentPageNo + 4 >= totalPages) {
				startPage = totalPages - 9;
				endPage = totalPages;
			} else {
				startPage = currentPageNo - 5;
				endPage = currentPageNo + 4;
			}
		}

		// calculate start and end item indexes
		var startIndex = (currentPageNo - 1) * pageSize;
		console.error('startIndex=' + startIndex);
		var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
		// create an array of pages to ng-repeat in the pager control
		var pages = _.range(startPage, endPage + 1);
		console.error("pages=" + pages);
		
		// return pager object
		return {
			totalItems: totalItems,
			currentPageNo: currentPageNo,
			pageSize: pageSize,
			totalPages: totalPages,
			startPage: startPage,
			endPage: endPage,
			startIndex: startIndex,
			endIndex: endIndex,
			pages: pages
		};
	}
});