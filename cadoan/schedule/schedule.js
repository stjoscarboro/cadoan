app.controller("MainCtrl", ($scope, $q, $window, $timeout, $interval, HttpService) => {

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

        $scope.httpService = new HttpService($scope);
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

        $scope.httpService.getSheetData($scope.schedules_db)
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
            $scope.listSongs(),
            $scope.listSingers()
        ])
            .then(() => {
                deferred.resolve();
            });

        return deferred.promise;
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
        let deferred = $q.defer();

        $scope.httpService.getFolderData(folder)
            .then(response => {
                if (response.data.files.length > 0) {
                    let files = response.data.files,
                        properties;

                    if (files && files.length > 0) {
                        files.forEach(song => {
                            if (song.mimeType === 'application/pdf') {
                                try {
                                    properties = JSON.parse(song.description);
                                } catch (e) {
                                    // No-Op
                                } finally {
                                    song = Object.assign(song, properties || {});
                                    song.title = song.title || song.name;
                                    properties = null;
                                }

                                let title = song.name.replace(/(.*)(.pdf)$/, '$1');
                                for (let file of files) {
                                    if (file.mimeType === 'audio/mp3' && file.name.indexOf(title) !== -1) {
                                        song.audio = $scope.httpService.getOpenURL(file.id);
                                    }
                                }

                                song.url = $scope.httpService.getOpenURL(song.id);
                                $scope.songs.push(song);
                            }
                        });
                    }
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

        $scope.httpService.getSheetData($scope.singers_db)
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
