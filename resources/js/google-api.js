let gapidiv = 'gapi-signin',
    gapiids = ['c3Rqb3NjYXJib3JvQGdtYWlsLmNvbQ==', 'aW1hbmhkdW5ndHJhbkBnbWFpbC5jb20='];

function onAdminSuccess(user) {
    let profile = user.getBasicProfile(),
        response = user.getAuthResponse(true);

    if (profile && gapiids.includes(Base64.encode(profile.getEmail()))) {
        let scope = angular.element('#' + gapidiv).scope();
        scope && scope.signin(profile, response['access_token']);
    }
}

function onMemberSuccess(user) {
    let profile = user.getBasicProfile(),
        response = user.getAuthResponse(true);

    if (profile) {
        let scope = angular.element('#' + gapidiv).scope();
        scope && scope.signin(profile, response['access_token']);
    }
}

function onFailure(error) {
    console.log(error);
}

function renderAdminButton() {
    gapi.signin2.render(gapidiv, {
        'scope': 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.send',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onAdminSuccess,
        'onfailure': onFailure
    });
}

function renderMemberButton() {
    gapi.signin2.render(gapidiv, {
        // 'scope': 'https://www.googleapis.com/auth/spreadsheets',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onMemberSuccess,
        'onfailure': onFailure
    });
}