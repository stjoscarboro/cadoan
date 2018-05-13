let gapidiv = 'gapi-signin',
	gapiid = 'c3Rqb3NjYXJib3JvQGdtYWlsLmNvbQ==';

function onSuccess(info) {
	let profile = info['w3'],
		response = info['Zi'];
	
	if(profile && Base64.encode(profile['U3']) === gapiid) {
		let scope = angular.element('#' + gapidiv).scope();
		scope && scope.signin(profile, response['access_token']);
	}
}

function onFailure(error) {
	console.log(error);
}

function renderButton() {
	gapi.signin2.render(gapidiv, {
		'scope': 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.send',
		'width': 240,
		'height': 50,
		'longtitle': true,
		'theme': 'dark',
		'onsuccess': onSuccess,
		'onfailure': onFailure
	});
}