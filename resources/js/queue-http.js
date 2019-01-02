app.factory('QueueHttp', function ($q, $http) {
    var queue = $q.when();

    return function queuedHttp(httpConf) {
        var f = function () {
            return $http(httpConf);
        };
        return queue = queue.then(f, f);
    };
});