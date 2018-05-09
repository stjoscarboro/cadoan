var gapidiv = 'gapi-signin';

function onSuccess(info) {
	let profile = info['w3'],
		response = info['Zi'];
	
	if(profile && profile['U3'] === 'stjoscarboro@gmail.com') {
		let scope = angular.element('#' + gapidiv).scope();
		scope && scope.signin(response['access_token']);
	}
}

function onFailure(error) {
	console.log(error);
}

function renderButton() {
	gapi.signin2.render(gapidiv, {
		'scope': 'https://www.googleapis.com/auth/spreadsheets',
		'width': 240,
		'height': 50,
		'longtitle': true,
		'theme': 'dark',
		'onsuccess': onSuccess,
		'onfailure': onFailure
	});
}