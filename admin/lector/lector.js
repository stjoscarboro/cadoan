var app = angular.module("lectorApp", []);

app.controller("LectorCtrl", ($scope, $http, $location) => {
	
	$scope.sheetUrl 		= 'https://sheets.googleapis.com/v4/spreadsheets/1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM';
	$scope.sheetRange 	= '/values/A:C';
	$scope.apiKey 		= 'AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8';
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.lector = {}
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(info) {
		if(info && info['Zi']) {
			$scope.accessToken = info['Zi'].access_token;
			$scope.get();
		}
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		let url = $scope.sheetUrl + $scope.sheetRange;
		
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
	 * create
	 */
	$scope.create = function() {
		let url = $scope.sheetUrl + $scope.sheetRange + ':append',
			payload = {
				values: [
					Object.values($scope.lector)
				]
			};
		
		$scope.clear();
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken, valueInputOption: "USER_ENTERED" }})
			.then(() => {
				$scope.lectors.push($scope.lector);
				$scope.lector = {};
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
				$scope.lectors.splice(id, 1);
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
