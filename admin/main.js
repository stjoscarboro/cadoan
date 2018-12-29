var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, $window, $timeout, HttpService) => {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.httpService = new HttpService($scope);
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(profile, token) {
		$scope.profile = profile;
		$scope.accessToken = token;
	}
});
