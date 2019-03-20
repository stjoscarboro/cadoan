let gapidiv = 'gapi-signin',
    gapiids = ['c3Rqb3NjYXJib3JvQGdtYWlsLmNvbQ==', 'aW1hbmhkdW5ndHJhbkBnbWFpbC5jb20='];

let renderButton = () => {
    gapi.signin2.render(gapidiv, {
        'scope': 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.send',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
};

let onSuccess = (user) => {
    let profile = user.getBasicProfile(),
        response = user.getAuthResponse(true);

    if (profile && gapiids.includes(Base64.encode(profile.getEmail()))) {
        let scope = angular.element('#' + gapidiv).scope();
        scope && scope.signin(profile, response['access_token']);
    }
};

let onFailure = (error) => {
    console.log(error);
};
