app.factory('HttpService', ['$http', function ($http) {

    let gapiKey = Base64.decode('QUl6YVN5RFZLNXpQMFRuaFJhbTBCc3Z2YjU5UnZGWk1tUjNqR1c4');

    let service = {},
        access_token;

    /**
     * setAccessToken
     *
     * @param token
     */
    service.setAccessToken = (token) => {
        access_token = token;
    };

    /**
     * getFile
     *
     * @param url
     * @param params
     * @returns {*}
     */
    service.getFile = function (url, params) {
        url = getURL(url);
        return $http.get(url, {
            params: params
        });
    };

    /**
     * getData
     *
     * @param url
     * @param params
     *
     * @returns {*}
     */
    service.getData = (url, params) => {
        params = getParams(params);
        return $http.get(url, {
            params: params
        });
    };

    /**
     * postData
     *
     * @param url
     * @param payload
     * @param params
     *
     * @returns {*}
     */
    service.postData = (url, payload, params) => {
        params = getParams(params);
        return $http.post(url, payload, {
            params: params
        });
    };

    /**
     * updateData
     *
     * @param url
     * @param payload
     * @param params
     *
     * @returns {*}
     */
    service.updateData = (url, payload, params) => {
        params = getParams(params);
        return $http.patch(url, payload, {
            params: params
        });
    };

    /**
     * getURL
     *
     * @param url
     * @returns {*}
     */
    let getURL = (url) => {
        url += (url.indexOf('?') === -1 ? '?' : '&') + 'key=' + gapiKey;
        return url;
    };

    /**
     * getParams
     */
    let getParams = (params) => {
        !params && (params = {});
        params.key = gapiKey;
        params.access_token = access_token;

        return params;
    };

    return service;

}]);