var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, HttpService) => {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.httpService = new HttpService($scope);
		$scope.dateFormat = "DD, dd MM, yy";
		
		$scope.get();
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		$scope.schedules = [];
		
		$scope.httpService.getSheetData('schedule')
			.then(response => {
				let values = response.data.values;

				if(values) {
					for(let value of values) {						
						let date = Number.parseInt(value[0]),
							now = new Date().getTime();
						
						if(date > now) {
							$scope.schedules.push({
								date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
								first: { name: value[1], reading: value[2] },
								second: { name: value[4], reading: value[5] },
								offertory: { name: value[7] }
							});
						}
					}
				}
			});
	}
	
});
