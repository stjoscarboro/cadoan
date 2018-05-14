var app = angular.module("lectorApp", []);

app.controller("LectorCtrl", ($scope, HttpService) => {
	
	$scope.genders = [ "Male", "Female", "Child" ];
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.lector = {};
		
		$scope.httpService = new HttpService($scope);
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(profile, token) {
		$scope.profile = profile;
		$scope.accessToken = token;
		
		$scope.get();
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		let url = $scope.sheetURL + $scope.sheetRange;
		
		$scope.lectors = [];
		
		
		$scope.httpService.getSheetData('lector')
			.then(response => {
				let values = response.data.values;
				
				if(values) {
					for(let value of values) {
						$scope.lectors.push({
							name: value[0],
							gender: value[1],
							email: value[2],
							phone: value[3]
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
		
		$scope.httpService.appendSheetData('lector', payload, {valueInputOption: "USER_ENTERED"})
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
		
		$scope.httpService.updateSheetData('lector', payload)
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
		
		$scope.httpService.updateSheetData('lector', payload)
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
