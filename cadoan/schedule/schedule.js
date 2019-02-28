app.controller("ScheduleCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $document, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.schedule = {
            songs: []
        };

        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];
        $scope.songs = [];

        $scope.dateFormat = "DD, dd/mm/yy";
        $scope.week = 7 * 24 * 3600 * 1000;

        $document.ready(() => {
            if ($window.angular.element('.signin').length === 0) {
                $scope.loadData()
                    .then(() => {
                        $scope.get();
                        $scope.resizeFrame();
                    });
            }
        });
    };

    /**
     * signin
     */
    $scope.signin = function (profile, token) {
        $scope.profile = profile;
        $scope.accessToken = token;
        HttpService.setAccessToken(token);

        $scope.loadData()
            .then(() => {
                $scope.get();
                $scope.resizeFrame();
            });
    };

    /**
     * get
     */
    $scope.get = function () {
        $scope.schedules = [];

        DataService.loadSchedules($scope.liturgies, $scope.singers, $scope.songs)
            .then(schedules => {
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                for(let schedule of schedules) {
                    if (schedules.length <= 4 || ($scope.schedules.length < 4 && schedule.date >= today.getTime())) {
                        schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(schedule.date));
                        $scope.schedules.push(schedule);
                    }
                }
            });
    };

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer();

        Promise.all([
            FileService.listFolder('cadoan.sheets'),
            DataService.loadLiturgies(),
            DataService.loadSingers()
        ])
            .then((values) => {
                //populate songs
                for(let list of values[0]) {
                    Array.prototype.push.apply($scope.songs, list);
                }

                //populate liturgies
                $scope.liturgies = values[1];

                //populate singers
                $scope.singers = values[2];

                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * create
     */
    $scope.create = function () {
        let popup = $uibModal.open({
            scope: $scope,
            templateUrl: 'editor.html',
            backdrop: false,
            keyboard: false,
            controller: () => {
                $scope.submit = () => {
                    popup.close();
                };

                $scope.cancel = () => {
                    popup.close();
                };
            }
        });

        //init datepicker
        popup.opened.then(() => {
            $timeout(() => {
                //init datepicker
                let datepicker = $('#datepicker');

                datepicker.datepicker({
                    dateFormat: $scope.dateFormat,
                    onSelect: (text) => {
                        let date = $.datepicker.parseDate($scope.dateFormat, text);

                        //init datepicker with this date
                        $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, date);
                    }
                });
            }, 1000);
        });
    };

    /**
     * resize
     */
    $scope.resize = function (currentHeight) {
        let contentHeight = $(document).outerHeight();

        if (contentHeight !== currentHeight) {
            contentHeight += 20;
            parent.postMessage("resize::" + contentHeight, "*");
        }

        return contentHeight;
    };

    /**
     * resizeFrame
     */
    $scope.resizeFrame = function () {
        let promise, height = 0;

        //set resize interval
        promise = $interval(() => {
            height = $scope.resize(height);
        }, 1000);

        //cancel interval
        $scope.$on('$destroy', () => {
            $interval.cancel(promise);
        });
    };
});


app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',

        link: (scope, element) => {
            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                value ? element.removeClass('ng-hide') : element.addClass('ng-hide');
            });
        }
    };
}]);
