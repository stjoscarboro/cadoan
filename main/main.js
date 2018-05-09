var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, $http, $location) => {
	
	$scope.sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk';
	$scope.sheetRange = '/values/A:F';
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
		let url = $scope.sheetURL + $scope.sheetRange;
		
		$scope.schedules = [];
		
		$http.get(url, {params: { key: $scope.apiKey }})
			.then(response => {
				let values = response.data.values;

				if(values) {
					for(let value of values) {						
						let date = Number.parseInt(value[0]),
							now = new Date().getTime();
						
						if(date > now) {
							$scope.schedules.push({
								date: $.datepicker.formatDate("DD, dd MM, yy", new Date(date)),
								first: { name: value[1], reading: value[2] },
								second: { name: value[3], reading: value[4] },
								offertory: { name: value[5] }
							});
						}
					}
				}
			});
	}
	
});
