var app = angular.module("newslistApp", []);

app.controller("NewslistCtrl", ($scope, $q, $window, $timeout, $sce, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.notices_db = 'cadoan_notices';

        $scope.notices = [];
        $scope.notice = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

        $scope.loadData()
            .then(() => {
                $scope.get();
            });
    };

    /**
     * get
     */
    $scope.get = function () {
        $scope.notices = [];

        $scope.httpService.getSheetData($scope.notices_db)
            .then(response => {
                let values = response.data.values;

                if (values) {
                    values.sort((a, b) => (a[0] > b[0]) ? -1 : ((b[0] > a[0]) ? 1 : 0));

                    for (let value of values) {
                        let date = new Date(Number.parseInt(value[0])),
                            text = value[1];

                        $scope.notices.push({
                            date: $scope.getDateTime(date),
                            text: $sce.trustAsHtml(text)
                        });
                    }
                }
            });
    };

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer(),
            promises = [];

        Promise.all(promises)
            .then(() => {
                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * getDateTime
     */
    $scope.getDateTime = function (date) {
        let today = new Date(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            ampm = 'AM', time = '';

        if (today.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)) {
            time += 'Hôm nay';
        } else if (today.setHours(0, 0, 0, 0) === date.setHours(24, 0, 0, 0)) {
            time += 'Hôm qua'
        } else {
            time += $.datepicker.formatDate($scope.dateFormat, date);
        }

        if (hours > 12) {
            hours = hours - 12;
            ampm = 'PM';
        }

        return time + ' lúc ' + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + seconds + ' ' + ampm;
    };
});