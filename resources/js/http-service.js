app.factory('HttpService', ($http, DelayHttp) => {

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

});

app.factory('QueueHttp', ($q, $http) => {
    let promise = $q.resolve();

    return (conf) => {
        let next = () => {
            return $http(conf);
        };

        return promise = promise.then(next);
    };
});

app.factory('DelayHttp', ($q, $http, $timeout, DelayQueue) => {
    return (conf) => {
        DelayQueue.push(conf);

        return $timeout(() => {
            DelayQueue.shift();
            return $http(conf);
        }, DelayQueue.length * 100);
    };
});

app.factory('DelayQueue', () => {
    return [];
});
