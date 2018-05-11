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
			email += '<p>Chúng tôi xin gởi quý phụ huynh <b>Bài Đọc ' + index + '</b> sẽ đọc vào ngày <b>' + schedule.date + '</b>. Mong quý phụ huynh giúp cháu chuẩn bị cho bài đọc này.</p>';
			email += '<p>Đại diện ban đọc thánh thư - Giáo Xứ Thánh Giuse</p>';
			email += '<p><a href="' + schedule[reading].reading + '">Bài Đọc ' + index + '</a></p>';
			
			return email;
		}
	
	}
	
	return EmailService;
	
});