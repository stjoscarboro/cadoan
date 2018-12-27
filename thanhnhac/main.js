var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, HttpService) => {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.schedule_db = 'thanhnhac_schedule';
		$scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';
		
		$scope.httpService = new HttpService($scope);
		$scope.dateFormat = "DD, dd/mm/yy";
		
		$scope.get();
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		$scope.schedules = [];
		
		$scope.httpService.getSheetData($scope.schedule_db)
			.then(response => {
				let values = response.data.values;
				
				if(values) {
					for(let value of values) {
						let date = Number.parseInt(value[0]),
							liturgy = value[1],
							songs = JSON.parse(value[2]);
						
						$scope.schedules.push({
							rawdate: date,
							date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
							liturgy: liturgy,
							songs: songs
						});
					}
				}
			});
	}
	
	/**
	 * print
	 */
	$scope.print = function() {
		$('.pbody').printThis({
			base: window.location.href
		});
	}
	
});
