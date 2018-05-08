var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, $http, $location) => {
	
	$scope.spreadsheetId = '18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk';
	$scope.sheetId = 'Sheet1';
	$scope.apiKey = 'AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8';
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.get();
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		let url = 'https://sheets.googleapis.com/v4/spreadsheets/' + $scope.spreadsheetId + '/values/A:F';
		
		$http.get(url, {params: { key: $scope.apiKey }})
			.then(response => {
				let values = response.data.values;
				values.splice(0, 1);
				
				$scope.schedules = [];
				for(let value of values) {
					$scope.schedules.push({
						date: value[0],
						first: { name: value[1], reading: value[2] },
						second: { name: value[3], reading: value[4] },
						offertory: { name: value[5] }
					});
				}
			});
	}
	
});
