var app = angular.module("scheduleApp", []);

app.controller("ScheduleCtrl", ($scope, $rootScope, $http, $location) => {
	
	$scope.sheetUrl = 'https://sheets.googleapis.com/v4/spreadsheets/18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk';
	$scope.sheetRange = '/values/A:F';
	$scope.apiKey = 'AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8';
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.schedule = {};
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(info) {
		if(info && info['Zi']) {
			$scope.accessToken = info['Zi'].access_token;
			$scope.get();
			$scope.lectors();
		}
	}
	
	$scope.lectors = function() {
		let url = 'https://sheets.googleapis.com/v4/spreadsheets/1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM/values/A:C';
		
		$scope.clear();
		$scope.lectors = [];
		
		$http.get(url, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
			.then(response => {
				let values = response.data.values;
				values.splice(0, 1);
				
				for(let value of values) {
					$scope.lectors.push({
						name: value[0],
						email: value[1],
						phone: value[2]
					});
				}
			});
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		let url = $scope.sheetUrl + $scope.sheetRange;
		
		$scope.clear();
		$scope.schedules = [];
		
		$http.get(url, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
			.then(response => {
				let values = response.data.values;
				values.splice(0, 1);
				
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
	
	/**
	 * create
	 */
	$scope.create = function() {
		let url = $scope.sheetUrl + '/values/A:F:append',
			data = $scope.schedule,
			payload = {
				values: [
					[data.date, data.first.name, data.first.reading, data.second.name, data.second.reading, data.offertory.name]
				]
			};
		
		$scope.clear();
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken, valueInputOption: "USER_ENTERED" }})
			.then(() => {
				$scope.schedules.push($scope.schedule);
				$scope.schedule = {};
			});
	}
	
	/**
	 * delete
	 */
	$scope.remove = function(id) {
		let url = $scope.sheetUrl + ':batchUpdate',
			payload = {
				"requests": [{
					"deleteDimension": {
						"range": {
							"sheetId": 0,
							"dimension": "ROWS",
							"startIndex": id + 1,
							"endIndex": id + 2
						}
					}
				}]
			};
		
		$scope.clear();
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken }})
			.then(() => {
				$scope.schedules.splice(id, 1);
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
	
});
