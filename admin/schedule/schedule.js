var app = angular.module("scheduleApp", []);

app.controller("ScheduleCtrl", ($scope, HttpService) => {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.schedule = {};
		$scope.readings = {};
		
		$scope.httpService = new HttpService($scope);
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(token) {
		$scope.accessToken = token;
		
		$scope.get();
		$scope.lectors();
		$scope.listYears();
	}
	
	/**
	 * lectors
	 */
	$scope.lectors = function() {
		$scope.lectors = [];
		
		$scope.httpService.getSheetData('lector')
			.then(response => {
				let values = response.data.values;
		
				if(values) {
					for(let value of values) {
						$scope.lectors.push({
							name: value[0],
							email: value[1],
							phone: value[2]
						});
					}
				}
			});
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
						let date = Number.parseInt(value[0]);

						$scope.schedules.push({
							date: $.datepicker.formatDate("DD, dd MM, yy", new Date(date)),
							first: { name: value[1], reading: value[2] },
							second: { name: value[3], reading: value[4] },
							offertory: { name: value[5] }
						});
					}
				}
			});
	}
	
	/**
	 * create
	 */
	$scope.create = function() {
		let data = $scope.schedule,
			date = $.datepicker.parseDate("DD, dd MM, yy",  data.date),
			payload = {
				values: [
					[date.getTime(), data.first.name, $scope.httpService.getDocURL(data.first.reading), data.second.name, $scope.httpService.getDocURL(data.second.reading), data.offertory.name]
				]
			};
		
		$scope.httpService.appendSheetData('schedule', payload, {valueInputOption: "USER_ENTERED"})
			.then(() => {
				$scope.clear();
				$scope.sort();
				
				$scope.schedule = {};
				$scope.readings = {};
			});
	}
	
	/**
	 * delete
	 */
	$scope.remove = function(id) {
		let payload = {
				"requests": [{
					"deleteDimension": {
						"range": {
							"sheetId": 0,
							"dimension": "ROWS",
							"startIndex": id,
							"endIndex": id + 1
						}
					}
				}]
			};
		
		$scope.httpService.updateSheetData('schedule', payload)
			.then(() => {
				$scope.schedules.splice(id, 1);
			});
	}

	/**
	 * sort
	 */
	$scope.sort = function() {
		let payload = {
				"requests": [{
					"sortRange": {
						"range": {
							sheetId: 0
						},
						"sortSpecs": [{
							"dimensionIndex": 0,
							"sortOrder": "ASCENDING"
						}]
					}
				}]
			};
		
		$scope.httpService.updateSheetData('schedule', payload)
			.then((response) => {
				$scope.get();
			});
	}
	
	/**
	 * clear
	 */
	$scope.clear = function() {
		$('.error').hide();
		$('.rheader .rdelete').hide();
		$("[class*='rselect']").removeClass('rselect');
	}
	
	/**
	 * listYears
	 */
	$scope.listYears = function() {
		$scope.httpService.getYearData()
			.then(response => {
				$scope.years = response.data.files;
			});
	}
	
	/**
	 * listReadings
	 */
	$scope.listReadings = function(year) {
		$scope.httpService.getFolderData(year.id)
			.then(response => {
				let folders = response.data.files;
				
				if(folders) {
					for(let [index, folder] of folders.entries()) {
						$scope.httpService.getFolderData(folder.id)
							.then(response => {
								$scope.readings[index] = response.data.files;
							});
					}
				}
			});
	}
	
	/**
	 * selectYear
	 */
	$scope.selectYear = function() {
		let years = $scope.years,
			selected = $scope.schedule.year;
		
		$scope.readings = {};
		
		for(let [index, year] of years.entries()) {
			if(year.name === selected) {
				$scope.listReadings(year);
			}
		}
	}
	
});
