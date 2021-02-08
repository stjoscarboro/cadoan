app.factory('GoogleService', ['$http', 'DelayHttp', ($http, DelayHttp) => {

    let gapiKey = Base64.decode('QUl6YVN5Q1NobnFUbHBhLTg4ajhlSGtWaWJDTjVTT21WLWFTVHd3');

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
    service.getFile = (url, params) => {
        url = getURL(url);
        return DelayHttp({
            url: url,
            method: 'GET',
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
        return $http({
            url: url,
            method: 'GET',
            params: params
        });
    };

    /**
     * postData
     *
     * @param url
     * @param data
     * @param params
     *
     * @returns {*}
     */
    service.postData = (url, data, params) => {
        params = getParams(params);
        return $http({
            url: url,
            method: 'POST',
            data: data,
            params: params
        });
    };

    /**
     * postFormData
     *
     * @param url
     * @param data
     *
     * @returns {*}
     */
    service.postFormData = (url, data) => {
        return $http({
            url: url,
            method: 'POST',
            data: $.param(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    };

    /**
     * updateData
     *
     * @param url
     * @param data
     * @param params
     *
     * @returns {*}
     */
    service.updateData = (url, data, params) => {
        params = getParams(params);
        return $http({
            url: url,
            method: 'PATCH',
            data: data,
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
     *
     * @param params
     * @returns {*}
     */
    let getParams = (params) => {
        !params && (params = {});
        params.key = gapiKey;
        params.access_token = access_token;

        return params;
    };

    return service;

}]);
