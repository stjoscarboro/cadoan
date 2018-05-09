var app = angular.module("scheduleApp", []);

app.controller("ScheduleCtrl", ($scope, $http, FileService) => {
	
	$scope.docURL = 'https://docs.google.com/document/d/';
	$scope.sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk';
	$scope.sheetRange = '/values/A:F';
	$scope.apiKey = 'AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8';
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.schedule = {};
		$scope.readings = {};
		
		$scope.fileService = new FileService($scope);
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(token) {
		$scope.accessToken = token;
		
		$scope.get();
		$scope.lectors();
		$scope.fileService.listYears();
	}
	
	/**
	 * lectors
	 */
	$scope.lectors = function() {
		let url = 'https://sheets.googleapis.com/v4/spreadsheets/1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM/values/A:C';
		
		$scope.lectors = [];
		
		$http.get(url, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
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
		let url = $scope.sheetURL + $scope.sheetRange;
		
		$scope.schedules = [];
		
		$http.get(url, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
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
		let url = $scope.sheetURL + $scope.sheetRange + ':append',
			data = $scope.schedule,
			date = $.datepicker.parseDate("DD, dd MM, yy",  data.date),
			payload = {
				values: [
					[date.getTime(), data.first.name, $scope.docURL + data.first.reading, data.second.name, $scope.docURL + data.second.reading, data.offertory.name]
				]
			};
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken, valueInputOption: "USER_ENTERED" }})
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
		let url = $scope.sheetURL + ':batchUpdate',
			payload = {
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
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
			.then(() => {
				$scope.schedules.splice(id, 1);
			});
	}

	/**
	 * sort
	 */
	$scope.sort = function() {
		let url = $scope.sheetURL + ':batchUpdate',
			payload = {
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
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
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
	 * selectYear
	 */
	$scope.selectYear = function() {
		let years = $scope.years,
			selected = $scope.schedule.year;
		
		$scope.readings = {};
		for(let [index, year] of years.entries()) {
			if(year.name === selected) {
				$scope.fileService.listReadings(year);
			}
		}
	}
	
});
