var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, HttpService) => {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.httpService = new HttpService($scope);
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
