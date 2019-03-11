app.factory('HttpService', ['$http', 'QueueHttp', ($http, QueueHttp) => {

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
    service.getFile = (url, params) => {
        url = getURL(url);
        return QueueHttp({
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
     */
    let getParams = (params) => {
        !params && (params = {});
        params.key = gapiKey;
        params.access_token = access_token;

        return params;
    };

    return service;

}]);

app.factory('QueueHttp', ($q, $http) => {
    let promise = $q.when();

    return (conf) => {
        let queue = () => {
            return $http(conf);
        };

        return promise = promise.then(queue, queue);
    };
});
