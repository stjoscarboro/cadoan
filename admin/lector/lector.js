var app = angular.module("lectorApp", []);

app.controller("LectorCtrl", ($scope, $http) => {
	
	$scope.sheetURL 		= 'https://sheets.googleapis.com/v4/spreadsheets/1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM';
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
	$scope.signin = function(token) {
		$scope.accessToken = token;
		$scope.get();
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		let url = $scope.sheetURL + $scope.sheetRange;
		
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
	 * create
	 */
	$scope.create = function() {
		let url = $scope.sheetURL + $scope.sheetRange + ':append',
			payload = {
				values: [
					Object.values($scope.lector)
				]
			};
		
		$http.post(url, payload, {params: { key: $scope.apiKey, access_token: $scope.accessToken, valueInputOption: "USER_ENTERED" }})
			.then(() => {
				$scope.clear();
				$scope.sort();
				$scope.lector = {};
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
				$scope.sort();
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
	
});
