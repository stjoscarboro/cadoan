var gapidiv = 'gapi-signin';

function onSuccess(info) {
	var scope = angular.element('#' + gapidiv).scope();
	scope && scope.signin(info);
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