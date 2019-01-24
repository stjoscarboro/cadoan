app.controller("MainCtrl", ($scope, $q, $window, $timeout, $interval, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = [];

        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];

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

        DataService.getSheetData('cadoan.schedules')
            .then(response => {
                let values = response.data.values,
                    pick = (obj, ...keys) => keys.reduce((o, k) => (o[k] = obj[k], o), {});

                if (values) {
                    for (let value of values) {
                        let date = Number.parseInt(value[0]),
                            liturgy = value[1],
                            songs = JSON.parse(value[2]);

                        //get liturgy
                        if(liturgy) {
                            let item = $scope.liturgies.find(i => { return i.id === liturgy; });
                            liturgy = item.name;
                        }

                        //populate songs
                        for (let song of songs) {
                            //find song
                            let item = ($scope.songs.find(i => { return i.id === song.id; }));
                            Object.assign(song, pick(item, 'title', 'category', 'author', 'audio', 'url', 'folder'));

                            //get singer
                            if(song.singer) {
                                let singer = $scope.singers.find(i => { return i.id === song.singer; });
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
            DataService.listLiturgies(),
            DataService.listSingers()
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
