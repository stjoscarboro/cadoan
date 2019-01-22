app.controller("SchedulerCtrl", ($scope, $q, $window, $timeout, $interval, $anchorScroll, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.schedules_db = 'cadoan_schedules';
        $scope.singers_db = 'cadoan_singers';
        $scope.ligurty_db = 'liturgies';
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.schedule = {
            songs: []
        };

        $scope.categories = {};
        $scope.folders = {};
        $scope.songs = [];
        $scope.lists = {};

        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];

        $scope.rows = [0, 1, 2, 3, 4];

        $scope.httpService = new HttpService($scope);

        $scope.driveURL = $scope.httpService.getDriveURL($scope.sheets_folder);
        $scope.dateFormat = "DD, dd/mm/yy";
        $scope.week = 7 * 24 * 3600 * 1000;

        //resize frame
        $scope.resizeFrame();
    };

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
    };

    /**
     * get
     */
    $scope.get = function () {
        $scope.schedules = [];

        //load existing schedules
        $scope.httpService.getSheetData($scope.schedules_db)
            .then(response => {
                let values = response.data.values,
                    pick = (obj, ...keys) => keys.reduce((o, k) => (o[k] = obj[k], o), {}),
                    lastDate = Date.now();

                if (values) {
                    for (let value of values) {
                        let date = Number.parseInt(value[0]),
                            liturgy = value[1],
                            songs = JSON.parse(value[2]);

                        for (let song of songs) {
                            let item = ($scope.songs.find(item => {
                                return item.id === song.id;
                            }));

                            Object.assign(song, pick(item, 'title', 'category', 'author', 'audio', 'url', 'folder'));
                        }

                        $scope.schedules.push({
                            date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
                            liturgy: liturgy,
                            songs: songs
                        });

                        lastDate = date;
                    }
                }

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

                //init datepicker to a week from last date
                $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(lastDate + $scope.week));
            }, error => {
                $scope.error();
            });
    };

    /**
     * create
     */
    $scope.create = function () {
        let date = $.datepicker.parseDate($scope.dateFormat, $scope.schedule.date),
            liturgy = $scope.schedule.liturgy,
            songs = [], payload, removed = [];

        for (let song of $scope.schedule.songs) {
            songs.push({
                id: song.songId,
                singer: song.singer
            });
        }

        payload = {
            values: [
                [
                    date.getTime(),
                    liturgy,
                    JSON.stringify(songs)
                ]
            ]
        };

        //remove existing schedule
        $scope.schedules.find((schedule, index) => {
            let sdate = $.datepicker.parseDate($scope.dateFormat, schedule.date);

            if (sdate.getTime() === date.getTime()) {
                removed.push($scope.remove(index));
            }
        });

        Promise.all(removed)
            .then(() => {
                //add new schedule
                $scope.httpService.appendSheetData($scope.schedules_db, payload, {
                    valueInputOption: "USER_ENTERED"
                })
                    .then(response => {
                        $scope.sort();
                    }, error => {
                        $scope.error();
                    });
            });
    };

    /**
     * edit
     */
    $scope.edit = function (id) {
        $scope.schedule = angular.copy($scope.schedules[id]);

        $scope.schedule.songs.forEach((song, index) => {
            $scope.schedule.songs[index].categoryId = song.folder;
            $scope.schedule.songs[index].folderId = song.folder;
            $scope.schedule.songs[index].songId = song.id;
            $scope.selectFolder(index);
        });

        $anchorScroll();
    };

    /**
     * delete
     */
    $scope.remove = function (id) {
        let deferred = $q.defer();

        let payload = {
            "requests": [{
                "deleteDimension": {
                    "range": {
                        "sheetId": 0,
                        "dimension": "ROWS",
                        "startIndex": id,
                        "endIndex": id + 1
                    }
                }
            }]
        };

        $scope.httpService.updateSheetData($scope.schedules_db, payload)
            .then(() => {
                $scope.schedules.splice(id, 1);
                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * sort
     */
    $scope.sort = function () {
        let payload = {
            "requests": [{
                "sortRange": {
                    "range": {
                        sheetId: 0
                    },
                    "sortSpecs": [{
                        "dimensionIndex": 0,
                        "sortOrder": "ASCENDING"
                    }]
                }
            }]
        };

        $scope.httpService.updateSheetData($scope.schedules_db, payload)
            .then(response => {
                $scope.refresh();
            }, error => {
                $scope.error();
            });
    };

    /**
     * refresh
     */
    $scope.refresh = function () {
        $scope.schedules = [];
        $scope.lists = {};
        $scope.schedule = {
            songs: []
        };
        $scope.get();
    };

    /**
     * clear
     */
    $scope.clear = function () {
        $('.error').hide();
    };

    /**
     * error
     */
    $scope.error = function () {
        $('#error').removeClass('hidden');

        $timeout(() => {
            $window.location.reload();
        }, 5000);
    };

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer();

        Promise.all([
            $scope.listSongs(),
            $scope.listLiturgies(),
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
                    for (let [index, folder] of folders.entries()) {
                        //set categories
                        if ($scope.rows.indexOf(index) !== -1) {
                            $scope.categories[index] = {
                                id: folder.id,
                                name: folder.name.replace(/\d+[.][ ]+(.*)/, '$1')
                            }
                        }

                        //set folders
                        $scope.folders[index] = {
                            id: folder.id,
                            name: folder.name
                        }
                    }

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

                                song.folder = folder;
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
     * listLiturgies
     */
    $scope.listLiturgies = function () {
        let deferred = $q.defer();

        $scope.httpService.getSheetData($scope.ligurty_db)
            .then(response => {
                let values = response.data.values;

                if (values) {
                    for (let value of values) {
                        $scope.liturgies.push(value[0]);
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
                        $scope.singers.push(value[0]);
                    }
                }

                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * selectFolder
     */
    $scope.selectFolder = function (index) {
        let categoryId = $scope.schedule.songs[index].categoryId;

        for (let category of Object.values($scope.categories)) {
            if (category.id === categoryId) {
                $scope.schedule.songs[index].category = category.name;
                $scope.schedule.songs[index].folderId = categoryId;
                $scope.selectSongs(index);
            }
        }
    };

    /**
     * selectSongs
     */
    $scope.selectSongs = function (index) {
        let songs = $scope.schedule.songs[index];

        if (songs && songs.folderId) {
            $scope.lists[index] = {songs: []};

            for (let song of $scope.songs) {
                if (song.folder === songs.folderId) {
                    $scope.lists[index].songs.push(song);
                }
            }
        }
    };

    /**
     * previewSong
     */
    $scope.previewSong = function (index) {
        let songs = $scope.schedule.songs[index];

        if (songs) {
            $window.open($scope.httpService.getOpenURL(songs.songId), '_blank');
        }
    };

    /**
     * addSong
     */
    $scope.addSong = function (index) {
        $scope.rows.push($scope.rows.length);
    };

    /**
     * removeSong
     */
    $scope.removeSong = function (index) {
        $scope.rows.splice($scope.rows.length - 1, 1);
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


app.directive('loading', ['$http', '$window', '$timeout', function ($http, $window, $timeout) {
    return {
        restrict: 'A',

        link: function (scope, element, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (value) {
                value ? element.removeClass('ng-hide') : element.addClass('ng-hide');
            });
        }
    };
}]);

