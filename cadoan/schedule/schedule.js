var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, $q, $window, $timeout, HttpService) => {

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
    };

    /**
     * get
     */
    $scope.get = function () {
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

                        if(date >= (new Date).getTime()) {
                            $scope.schedules.push({
                                date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
                                liturgy: liturgy,
                                songs: songs
                            });
                        }

                        //resize frame
                        $scope.resizeFrame();
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
     * resizeFrame
     */
    $scope.resizeFrame = function () {
        let currentHeight = 0;

        let resize = () => {
            let contentHeight = $(document).outerHeight();

            if(contentHeight !== currentHeight) {
                contentHeight += 20;
                currentHeight = contentHeight;
                parent.postMessage("resize::" + contentHeight, "*");
            }
        };

        if($scope.resizeInterval) {
            clearInterval($scope.resizeInterval);
        }

        $(document).ready(() => {
            resize();
            $scope.resizeInterval = setInterval(resize, 1000);
        });
    };

    /**
     * print
     */
    $scope.print = function () {
        $('.pbody').printThis({
            base: window.location.href
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
