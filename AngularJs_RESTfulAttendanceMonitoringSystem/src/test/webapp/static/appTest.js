describe("App", function() {

	beforeEach(module('employees-module'));

	var $httpBackend, $controller;
	
	beforeEach(inject(function($injector) {
		$httpBackend = $injector.get('$httpBackend');
		$controller = $injector.get('$controller');
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("displays user information when controller loads", function() {
		var $scope = {};
		$httpBackend.expectGET('resource/').respond(200, {
			id : 4321,
			content : 'Hello Test'
		});
		var controller = $controller('home', {
			$scope : $scope
		});
		$httpBackend.flush();
		expect($scope.greeting.content).toEqual('Hello Test');
	});

})