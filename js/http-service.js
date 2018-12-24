app.factory('HttpService', function($http) {
	
	function HttpService(scope) {
		
		let docURL = 'https://docs.google.com/document/d/',
			openURL = 'https://drive.google.com/open?id='
			sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/',
			driveURL = 'https://www.googleapis.com/drive/v3/files',
			mailURL = 'https://content.googleapis.com/gmail/v1/users/me/messages/send',
			folderId = '1RhvrRHr4Rt7N7vd3PQ8slNF4Nijqfp_b', // "readings" folder
			gapiKey = Base64.decode('QUl6YVN5RFZLNXpQMFRuaFJhbTBCc3Z2YjU5UnZGWk1tUjNqR1c4');
		
		let sheets = {
				lector: {
					id: '1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM',
					range: 'A:D'
				},
				
				schedule: {
					id: '18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk',
					range: 'A:H'
				},
				
				thanhnhac_schedule: {
					id: '1wJc-PNIW73HSGuYus5JBZw9IMr1fZ3J74GXm-e5b-8A',
					range: 'A:B'
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
		 * getDriveURL
		 */
		this.getDriveURL = function() {
			return 'https://drive.google.com/drive/folders/' + folderId;
		}
		
		/**
		 * getDocURL
		 */
		this.getDocURL = function(docId) {
			return docURL + docId + '/preview';
		}
		
		this.getOpenURL = function(docId) {
			return openURL + docId;
		}
		
		/**
		 * getFolderData
		 */
		this.getFolderData = function(folderId) {
			let url = driveURL + '?q="' + folderId + '"+in+parents&orderBy=name&key=' + gapiKey;
			
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
			params.key = gapiKey;
			params.access_token = scope.accessToken;
			
			return params;
		}
		
	}
	
	return HttpService;
	
});