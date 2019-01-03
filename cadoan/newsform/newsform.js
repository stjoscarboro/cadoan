var app = angular.module("newsformApp", []);

app.controller("NewsformCtrl", ($scope, $q, $window, $timeout, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.notices_db = 'cadoan_notices';

        $scope.notices = [];
        $scope.notice = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";
        // $scope.dateFormat = "medium";
    }

    /**
     * signin
     */
    $scope.signin = function (profile, token) {
        $scope.profile = profile;
        $scope.accessToken = token;

        $scope.loadData()
            .then(() => {
                $scope.get();
            });
    }

    /**
     * get
     */
    $scope.get = function () {
        $scope.notices = [];

        $scope.httpService.getSheetData($scope.notices_db)
            .then(response => {
                let values = response.data.values;

                if(values) {
                    values.sort((a,b) => (a[0] > b[0]) ? -1 : ((b[0] > a[0]) ? 1 : 0)); 

                    for(let value of values) {
                        let date = new Date(Number.parseInt(value[0])),
                            text = value[1];

                        $scope.notices.push({
                            date: $.datepicker.formatDate($scope.dateFormat, date) + ' ' + $scope.getTimeString(date),
                            text: text
                        });
                    }
                }
            });
    }

    /**
     * create
     */
    $scope.create = function () {
        let date = new Date(),
            payload;

        payload = {
            values: [
                [
                    date.getTime(),
                    $scope.notice.text
                ]
            ]
        };

        //add new notice
        $scope.httpService.appendSheetData($scope.notices_db, payload, {
                valueInputOption: "USER_ENTERED"
            })
            .then(() => {
                $scope.notice = {};
            });
    }

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
    }

    $scope.getTimeString = function(date) {
        let hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            ampm = 'AM';

        if(hours > 12) {
            hours = hours - 12;
            ampm = 'PM';
        }

        return hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }
});