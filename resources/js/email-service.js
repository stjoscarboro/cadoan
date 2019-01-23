app.factory('EmailService', function() {
	
	function EmailService(scope) {
		
		this.getEmail = function(lector, schedule, index) {
			switch(lector.gender) {
				case 'Male':
					return getMaleEmail(lector, schedule, index);
					
				case 'Female':
					return getFemaleEmail(lector, schedule, index);
				
				case 'Child':
					return getChildEmail(lector, schedule, index);
			}
		}
		
		/**
		 * getMaleEmail
		 */
		getMaleEmail = function(lector, schedule, index) {
			let email = '',
				reading = index === 1 ? 'first' : 'second';
			
			email += '<p>Chào anh ' + lector.name + '</p>';
			email += '<p>Chúng tôi xin gởi anh <b>Bài Đọc ' + index + '</b> sẽ đọc vào ngày <b>' + schedule.date + '</b>.</p>';
			email += '<p>Đại diện ban đọc thánh thư - Giáo Xứ Thánh Giuse</p>';
			email += '<p><a href="' + schedule[reading].reading + '">Bài Đọc ' + index + '</a></p>';
			
			return email;
		}
		
		/**
		 * getFemaleEmail
		 */
		getFemaleEmail = function(lector, schedule, index) {
			let email = '',
				reading = index === 1 ? 'first' : 'second';
			
			email += '<p>Chào chị ' + lector.name + '</p>';
			email += '<p>Chúng tôi xin gởi chị <b>Bài Đọc ' + index + '</b> sẽ đọc vào ngày <b>' + schedule.date + '</b>.</p>';
			email += '<p>Đại diện ban đọc thánh thư - Giáo Xứ Thánh Giuse</p>';
			email += '<p><a href="' + schedule[reading].reading + '">Bài Đọc ' + index + '</a></p>';
			
			return email;
		}
		
		/**
		 * getChildEmail
		 */
		getChildEmail = function(lector, schedule, index) {
			let email = '',
				reading = index === 1 ? 'first' : 'second';
			
			email += '<p>Chào quý phụ huynh của em ' + lector.name + '</p>';
			email += '<p>Chúng tôi xin gởi quý phụ huynh <b>Bài Đọc ' + index + '</b> mà em sẽ đọc vào ngày <b>' + schedule.date + '</b>. Mong quý phụ huynh giúp em chuẩn bị cho bài đọc này.</p>';
			email += '<p>Đại diện ban đọc thánh thư - Giáo Xứ Thánh Giuse</p>';
			email += '<p><a href="' + schedule[reading].reading + '">Bài Đọc ' + index + '</a></p>';
			
			return email;
		}
	
	}
	
	return EmailService;
	
});



// /**
//  * getYearData
//  */
// service.getYearData = function () {
//     return this.getFolderData(folderId);
// };
//
// /**
//  * sendEmail
//  */
// service.sendEmail = function (to, from, subject, message) {
//     let url = mailURL;
//
//     let email = '';
//     email += 'To: ' + to + '\r\n';
//     email += 'From: ' + from + '\r\n';
//     email += 'Subject: ' + subject + '\r\n';
//     email += 'Content-Type: text/html; charset=UTF-8' + '\r\n';
//     email += 'Content-Transfer-Encoding: 8bit' + '\r\n';
//     email += 'MIME-Version: 1.0' + '\r\n';
//     email += '\r\n';
//     email += message;
//
//     let body = {
//         raw: Base64.encode(email).replace(/\//g, '_').replace(/\+/g, '-')
//     };
//
//     return $http.post(url, body, {
//         params: {
//             access_token: this.access_token
//         },
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     });
// };
