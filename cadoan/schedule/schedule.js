app.controller("MainCtrl", ($scope, $q, $window, $timeout, $interval, HttpService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.schedules_db = 'cadoan_schedules';
        $scope.singers_db = 'cadoan_singers';
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = [];
        $scope.singers = [];
        $scope.schedules = [];

        $scope.dateFormat = "DD, dd/mm/yy";

        $scope.loadData()
            .then(() => {
                $scope.get();
            });

        //resize frame
        $scope.resizeFrame();
    };

    /**
     * get
     */
    $scope.get = function () {
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        $scope.schedules = [];

        HttpService.getSheetData($scope.schedules_db)
            .then(response => {
                let values = response.data.values,
                    pick = (obj, ...keys) => keys.reduce((o, k) => (o[k] = obj[k], o), {});

                if (values) {
                    for (let value of values) {
                        let date = Number.parseInt(value[0]),
                            liturgy = value[1],
                            songs = JSON.parse(value[2]);

                        for (let song of songs) {
                            //find song
                            let item = ($scope.songs.find(s => { return s.id === song.id; }));
                            Object.assign(song, pick(item, 'title', 'category', 'author', 'audio', 'url'));

                            //get singer
                            if(song.singer) {
                                let singer = $scope.singers.find(s => { return s.id === song.singer; });
                                song.singerId = singer.id;
                                song.singer = singer.name;
                            }
                        }

                        if (values.length <= 4 || ($scope.schedules.length < 4 && date >= today.getTime())) {
                            $scope.schedules.push({
                                date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
                                liturgy: liturgy,
                                songs: songs
                            });
                        }
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
            FileService.listSongs($scope.sheets_folder),
            $scope.listSingers()
        ])
            .then((values) => {
                let songs = values[0];
                for(let list of songs) {
                    Array.prototype.push.apply($scope.songs, list);
                }

                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * listSingers
     */
    $scope.listSingers = function () {
        let deferred = $q.defer();

        HttpService.getSheetData($scope.singers_db)
            .then(response => {
                let values = response.data.values;

                if (values) {
                    for (let value of values) {
                        $scope.singers.push({ id: value[0], name: value[1] });
                    }
                }

                deferred.resolve();
            });

        return deferred.promise;
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
