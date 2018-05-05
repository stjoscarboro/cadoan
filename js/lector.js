var app = angular.module("lectorApp", []);

app.controller("LectorCtrl", function($scope, $http, $location) {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.get();
	}
	
	/**
	 * get
	 */
	$scope.get = function() {
		$scope.clear();
		
		$http({
			method: 'GET',
			url: 'https://sheets.googleapis.com/v4/spreadsheets/10qkl0h2CmUnHLbd7-aToyJn9MEw_wa1MbsDAcEnrFtw/values/lectors?key=AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8'
		}).success(function(data) {
			$scope.lectors = data.values;
			console.log($scope.lectors);
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
	
//	/**
//	 * create
//	 */
//	$scope.create = function() {
//		
//		$scope.clear();
//		
//		//post
//		$http({
//			
//			method: 'POST',
//			url: 'pet',
//			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//			data: $.param($scope.pet)
//			
//		}).success(function(data) {
//			
//			//error
//			if (data.status == 'failure') {
//				$('.entry .error').text(data.message);
//				$('.entry .error').show();
//				return;
//			}
//			
//			//update
//			$scope.pets.push(data.value);
//			
//			//reset
//			$scope.pet.name = '';
//			$scope.pet.photo = '';
//			$scope.pet.status = $scope.statuses[0];
//			
//			//scroll
//			$('.rbody #rlast').get(0).scrollIntoView(false);
//			
//		});
//	}
//	
//	/**
//	 * delete
//	 */
//	$scope.delete = function(id) {
//		
//		$scope.clear();
//		
//		//delete
//		$http({
//			
//			method: 'DELETE',
//			url: 'pet/' + id
//			
//		}).success(function(data) {
//			
//			//error
//			if (data.status == 'failure') {
//				$('.rheader .rdelete img').attr('title', data.message);
//				$('.rheader .rdelete').show();
//				return;
//			}
//			
//			//update
//			$scope.pets = $.grep($scope.pets, function(e) { 
//				return e.id != id; 
//			});
//			
//		});
//	}
//	
//	/**
//	 * find
//	 */
//	$scope.find = function() {
//		
//		$scope.clear();
//		
//		//get
//		$http({
//			
//			method: 'GET',
//			url: 'pet/' + $scope.pet.id
//			
//		}).success(function(data) {
//			
//			//error
//			if (data.status == 'failure') {
//				$('.search .error').text(data.message);
//				$('.search .error').show();
//				return;
//			}
//			
//			//success
//			var row = $('.rbody #r' + $scope.pet.id);
//			row.addClass('rselect');
//			row.get(0).scrollIntoView();
//			
//		});
//	}
//	
//	/**
//	 * logout
//	 */
//	$scope.logout = function() {
//		
//		//post
//		$http({
//			
//			method: 'POST',
//			url: 'logout'
//			
//		}).success(function(data) {
//			
//			window.location = $location.path();
//			
//		});
//	}
//	
//	/**
//	 * refresh
//	 */
//	$scope.refresh = function() {
//		
//		window.location = $location.path();
//		
//	}
//	
//	/**
//	 * user
//	 */
//	$scope.user = function() {
//		
//		//get
//		$http({
//			
//			method: 'GET',
//			url: 'user'
//			
//		}).success(function(data) {
//			
//			$scope.user = data.value;
//			
//		});
//	}
	
});
