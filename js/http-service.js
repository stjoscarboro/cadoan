app.factory('HttpService', function($http) {
	
	function HttpService(scope) {
		
		let docURL = 'https://docs.google.com/document/d/',
			sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/',
			driveURL = 'https://www.googleapis.com/drive/v3/files',
			mailURL = 'https://content.googleapis.com/gmail/v1/users/me/messages/send',
			folderId = '139ho75h2sTOC4EuwXU_AHJP_vnhh7Pwl', // "readings" folder
			apiKey = 'AIzaSyDVK5zP0TnhRam0Bsvvb59RvFZMmR3jGW8';
		
		let sheets = {
				lector: {
					id: '1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM',
					range: 'A:D'
				},
				
				schedule: {
					id: '18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk',
					range: 'A:H'
				}
			};
		
		/**
		 * getSheetData
		 */
		this.getSheetData = function(sheetId, params) {
			let sheet = sheets[sheetId],
				url = sheetURL + sheet.id + '/values/' + sheet.range;
			
			params = getParams(params);
			return $http.get(url, {params: params});
		}
		
		/**
		 * appendSheetData
		 */
		this.appendSheetData = function(sheetId, payload, params) {
			let sheet = sheets[sheetId],
				url = sheetURL + sheet.id + '/values/' + sheet.range + ':append';
		
			params = getParams(params);
			return $http.post(url, payload, {params: params});
		}
		
		/**
		 * updateSheetData
		 */
		this.updateSheetData = function(sheetId, payload, params) {
			let sheet = sheets[sheetId],
				url = sheetURL + sheet.id + ':batchUpdate';
		
			params = getParams(params);
			return $http.post(url, payload, {params: params});
		}		
		
		/**
		 * getDocURL
		 */
		this.getDocURL = function(docId) {
			return docURL + docId;
		}
		
		/**
		 * getFolderData
		 */
		this.getFolderData = function(folderId) {
			let url = driveURL + '?q="' + folderId + '"+in+parents&orderBy=name&key=' + apiKey;
			
			return $http.get(url);
		}
		
		/**
		 * getYearData
		 */
		this.getYearData = function() {
			return this.getFolderData(folderId);
		}
		
		/**
		 * sendEmail
		 */
		this.sendEmail = function(to, from, subject, message) {
			let url = mailURL;
			
			let email = '';
			email += 'To: ' + to + '\r\n';
			email += 'From: ' + from + '\r\n';
			email += 'Subject: ' + subject + '\r\n';
			email += 'Content-Type: text/html; charset=UTF-8' + '\r\n';
			email += 'Content-Transfer-Encoding: 8bit' + '\r\n';
			email += 'MIME-Version: 1.0' + '\r\n';
			email += '\r\n';
			email += message;
			
			let body = {
					raw: Base64.encode(email).replace(/\//g,'_').replace(/\+/g,'-')
				}
			
			return $http.post(url, body, {params: {access_token: scope.accessToken}, headers: { 'Content-Type': 'application/json' }});
		}
		
		/**
		 * getParams
		 */
		getParams = function(params) {
			!params && (params = {});
			params.key = apiKey;
			params.access_token = scope.accessToken;
			
			return params;
		}
		
	}
	
	return HttpService;
	
});