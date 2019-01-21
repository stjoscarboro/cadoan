app.controller("MainCtrl", ($scope, $q, $window, $timeout, $interval, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.schedule_db = 'cadoan_schedules';
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

        $scope.listSongs()
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

        $scope.httpService.getSheetData($scope.schedule_db)
            .then(response => {
                let values = response.data.values;

                if (values) {
                    for (let value of values) {
                        let date = Number.parseInt(value[0]),
                            liturgy = value[1],
                            songs = JSON.parse(value[2]);

                        for (let song of songs) {
                            song.url = $scope.httpService.getOpenURL(song.id);

                            $scope.listFolder(song.folder)
                                .then(list => {
                                    let title = song.name.replace(/(.*)(.pdf)$/, '$1');

                                    for (let item of list) {
                                        if (item.mimeType === 'audio/mp3' && item.name.indexOf(title) !== -1) {
                                            song.audio = $scope.httpService.getOpenURL(item.id);
                                        }
                                    }
                                });
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
     * listSongs
     */
    $scope.listSongs = function () {
        let deferred = $q.defer(),
            promises = [];

        $scope.httpService.getFolderData($scope.sheets_folder)
            .then(response => {
                let folders = response.data.files;

                if (folders) {
                    for (let folder of folders) {
                        promises.push($scope.listFolder(folder.id));
                    }
                }

                Promise.all(promises)
                    .then(() => {
                        deferred.resolve();
                    });
            });

        return deferred.promise;
    };

    /**
     * listFolder
     */
    $scope.listFolder = function (folder) {
        let songs = $scope.songs[folder],
            deferred = $q.defer();

        if (songs) {
            deferred.resolve(songs);
        } else {
            $scope.httpService.getFolderData(folder)
                .then(response => {
                    $scope.songs[folder] = response.data.files;
                    deferred.resolve($scope.songs[folder]);
                });
        }

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
