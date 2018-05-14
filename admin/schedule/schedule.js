var app = angular.module("scheduleApp", []);

app.controller("ScheduleCtrl", ($scope, HttpService, EmailService) => {
	
	/**
	 * init
	 */
	$scope.init = function() {
		$scope.schedule = {};
		$scope.readings = {};
		
		$scope.httpService = new HttpService($scope);
		$scope.emailService = new EmailService($scope);
		$scope.dateFormat = "DD, dd/mm/yy";
		$scope.week = 7 * 24 * 3600 * 1000;
	}
	
	/**
	 * signin
	 */
	$scope.signin = function(profile, token) {
		$scope.profile = profile;
		$scope.accessToken = token;
		
		$scope.get();
		$scope.lectors();
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
							gender: value[1],
							email: value[2],
							phone: value[3]
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
				let values = response.data.values,
					lastDate = Date.now();
				
				if(values) {
					for(let value of values) {
						let date = Number.parseInt(value[0]);
						
						$scope.schedules.push({
							rawdate: date,
							date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
							first: { name: value[1], reading: value[2], mailsent: value[3] },
							second: { name: value[4], reading: value[5], mailsent: value[6] },
							offertory: { name: value[7] }
						});
						
						lastDate = date;
					}
				}
				
				//init datepicker
				let datepicker = $('#datepicker');
				datepicker.datepicker({
					dateFormat: $scope.dateFormat,
					onSelect: (text) => {
						let date = $.datepicker.parseDate($scope.dateFormat, text);
						
						//init datepicker with this date
						$scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, date);
						$scope.schedule.rawdate = date.getTime();
						
						//select the year based on date selection and populate readings
						$scope.schedule.year = date.getFullYear().toString();
						$scope.selectYear();
					}
				});
				
				//init datepicker to a week from last date
				$scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(lastDate + $scope.week));
				$scope.schedule.rawdate = lastDate + $scope.week;
				
				//select the year based on date selection and populate readings
				$scope.schedule.year = (new Date(lastDate)).getFullYear().toString();
				$scope.listYears();
			});
	}
	
	/**
	 * create
	 */
	$scope.create = function() {
		let data = $scope.schedule,
			date = $.datepicker.parseDate($scope.dateFormat,  data.date),
			payload = {
				values: [
					[
						date.getTime(),
						data.first.name,
						$scope.httpService.getDocURL(data.first.reading),
						0,
						data.second.name,
						$scope.httpService.getDocURL(data.second.reading),
						0,
						data.offertory.name
					]
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
				$scope.sort();
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
		if(!$scope.years) {
			$scope.httpService.getYearData()
			.then(response => {
				$scope.years = response.data.files;
				$scope.selectYear();
			});
		} else {
			$scope.selectYear();
		}
	}
	
	/**
	 * listReadings
	 */
	$scope.listReadings = function(year) {
		let schedule = $scope.schedule,
			scheduledate = $.datepicker.formatDate('yy-mm-dd', new Date(schedule.rawdate));
		
		$scope.httpService.getFolderData(year.id)
			.then(response => {
				let folders = response.data.files;
				
				if(folders) {
					for(let [index, folder] of folders.entries()) {
						$scope.httpService.getFolderData(folder.id)
							.then(response => {
								$scope.readings[index] = response.data.files;
								
								//select matched reading
								for(let reading of $scope.readings[index]) {
									if(reading.name.startsWith(scheduledate)) {
										if(index === 0) {
											!schedule.first && (schedule.first = {});
											$scope.schedule.first.reading = reading.id;
										}
										
										if(index === 1) {
											!schedule.second && (schedule.second = {});
											$scope.schedule.second.reading = reading.id;
										}
									}
								}
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
	
	/**
	 * sendEmail
	 */
	$scope.sendEmail = function(sidx, lidx) {
		let schedule = $scope.schedules[sidx],
			name = lidx === 1 ? schedule.first.name : lidx === 2 ? schedule.second.name : null,
			mailsent = lidx === 1 ? schedule.first.mailsent : lidx === 2 ? schedule.second.mailsent : -1,
			lector = $scope.lectors.find(item => { return item.name === name; }),
			receiver = lector.email,
			sender = '=?utf-8?B?' + Base64.encode($scope.profile['ofa']) + '?=' + ' <' + $scope.profile['U3'] + '>',
			subject = '=?utf-8?B?' + Base64.encode('Bài Đọc ' + lidx + ' - ' + schedule.date) + '?=',
			message = $scope.emailService.getEmail(lector, schedule, lidx),
			link = $('#rmail-' + sidx + '-' + lidx);

		$scope.httpService.sendEmail(receiver, sender, subject, message)
			.then(response => {
				let rowidx = sidx,
					colidx = lidx === 1 ? 3 : lidx === 2 ? 6 : -1;
				
				let payload = {
						"requests": [{
							"updateCells": {
								"range": {
									"sheetId": 0,
									"startRowIndex": rowidx,
									"endRowIndex": rowidx + 1,
									"startColumnIndex": colidx,
									"endColumnIndex": colidx + 1
								},
								"rows": [{
									"values": [
										{
											"userEnteredValue": {
												"numberValue": Number.parseInt(mailsent) + 1
											}
										}
									]
								}],
								"fields": "*"
							}
						}]
					};
				
				$scope.httpService.updateSheetData('schedule', payload)
					.then((response) => {
						link.addClass('disabled');
					});
			});
		
		return false;
	    
	}	
	
	/**
	 * disableEmail
	 */
	$scope.disableEmail = function() {
		let now = Date.now(),
			sendmail1 = 8 * $scope.week,
			sendmail2 = 2 * $scope.week;
		
		if($scope.schedules) {
			for(let [index, schedule] of $scope.schedules.entries()) {
				let scheduledate = Number.parseInt(schedule.rawdate),
					nextmaildate = scheduledate - now,
					mailsent1 = Number.parseInt(schedule.first.mailsent),
					mailsent2 = Number.parseInt(schedule.second.mailsent),
					maillink1 = $('#rmail-' + index + '-1'),
					maillink2 = $('#rmail-' + index + '-2');
				
				if((nextmaildate < sendmail1 && mailsent1 === 0) || (nextmaildate < sendmail2 && mailsent1 === 1)) {
					maillink1.removeClass('disabled');
				}
				
				if((nextmaildate < sendmail1 && mailsent2 === 0) || (nextmaildate < sendmail2 && mailsent2 === 1)) {
					maillink2.removeClass('disabled');
				}
			}
		}
	}
});
