var app = angular.module("scheduleApp", []);

app.controller("ScheduleCtrl", ($scope, $http, $location) => {
	
	$scope.spreadsheetId = '18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk';
	$scope.sheetId = 'Sheet1';
	$scope.apiKey = 'AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8';
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.schedule = {}
	}
	
	$scope.signin = function(info) {
		if(info && info['Zi']) {
			$scope.apiToken = info['Zi'].access_token;
			$scope.get();
		}
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		let url = 'https://sheets.googleapis.com/v4/spreadsheets/' + $scope.spreadsheetId + '/values/A:F';
		
		$scope.clear();
		
		$http.get(url, {params: { key: $scope.apiKey, access_token: $scope.apiToken }})
			.then(response => {
				let values = response.data.values;
				values.splice(0, 1);
				
				$scope.schedules = [];
				for(let value of values) {
					$scope.schedules.push({
						date: value[0],
						first: { name: value[1], reading: value[2] },
						second: { name: value[3], reading: value[4] },
						offertory: value[5]
					});
				}
			});
	}
	
//	/**
//	 * create
//	 */
//	$scope.create = function() {
//		let row = $scope.lectors.length + 1,
//			range = 'A' + row + ':C' + row,
//			url = 'https://sheets.googleapis.com/v4/spreadsheets/' + $scope.spreadsheetId + '/values/A:C:append',
//			data = $scope.lector;
//		
//		let request = {
//			values: [
//				[data.name, data.email, data.phone]
//			]
//		};
//			
//		$scope.clear();
//		
//		//post
//		$http.post(url, request, {params: { key: $scope.apiKey, access_token: $scope.apiToken, valueInputOption: "USER_ENTERED" }})
//			.then(() => {
//				$scope.lectors.push(data);
//				$scope.lector = {};
//			});
//	}
	
//	/**
//	 * delete
//	 */
//	$scope.remove = function(id) {
//		
//		let url = 'https://sheets.googleapis.com/v4/spreadsheets/' + $scope.spreadsheetId + ':batchUpdate',
//			request = {
//				"requests": [{
//					"deleteDimension": {
//						"range": {
//							"sheetId": 0,
//							"dimension": "ROWS",
//							"startIndex": id + 1,
//							"endIndex": id + 2
//						}
//					}
//				}]
//			};
//				
//		$scope.clear();
//		
//		//delete
//		$http.post(url, request, {params: { key: $scope.apiKey, access_token: $scope.apiToken }})
//			.then(() => {
//				$scope.lectors.splice(id, 1);
//			});
//	}
	
	/**
	 * clear
	 */
	$scope.clear = function() {
		$('.error').hide();
		$('.rheader .rdelete').hide();
		$("[class*='rselect']").removeClass('rselect');
	}
	
});
