app.controller("SchedulerCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $anchorScroll, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
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

        $scope.driveURL = FileService.getFolderURL($scope.sheets_folder);
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
        HttpService.setAccessToken(token);

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
        DataService.getSheetData('cadoan.schedules')
            .then(response => {
                let values = response.data.values,
                    pick = (obj, ...keys) => keys.reduce((o, k) => (o[k] = obj[k], o), {}),
                    lastDate = Date.now();

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
                id: song.id,
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
                DataService.appendSheetData('cadoan.schedules', payload, {
                    valueInputOption: "USER_ENTERED"
                })
                    .then(
                        //success
                        () => {
                            $scope.sort();
                        },

                        (response) => {
                            console.log(response.data.error);
                            // $scope.error(error.data.error);
                        }
                    );
            });
    };

    /**
     * edit
     */
    $scope.edit = function (id) {
        $scope.schedule = angular.copy($scope.schedules[id]);

        //get liturgy
        let liturgy = $scope.liturgies.find(i => { return i.name === $scope.schedule.liturgy; });
        liturgy && ($scope.schedule.liturgy = liturgy.id);

        $scope.schedule.songs.forEach((song, index) => {
            //get singer
            let singer = $scope.singers.find(i => { return i.name === song.singer; });
            singer && (song.singer = singer.id);

            $scope.schedule.songs[index].id = song.id;
            $scope.schedule.songs[index].categoryId = song.folder;
            $scope.schedule.songs[index].folderId = song.folder;
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

        DataService.updateSheetData('cadoan.schedules', payload)
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

        DataService.updateSheetData('cadoan.schedules', payload)
            .then(() => {
                $scope.refresh();
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
     * error
     */
    $scope.error = function (error) {
        let popup = $uibModal.open({
                scope: $scope,
                templateUrl: '../../resources/error.html',
                backdrop: false,
                keyboard: false
            });

        $scope.error = error;
    };

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer();

        Promise.all([
            FileService.listSongs($scope.sheets_folder),
            DataService.listLiturgies(),
            DataService.listSingers(),
            $scope.listCategories()
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

    $scope.listCategories = function() {
        let deferred = $q.defer();

        FileService.getFolderData($scope.sheets_folder)
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
        let song = $scope.schedule.songs[index];

        if (song) {
            $window.open(FileService.getOpenURL(song.id), '_blank');
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

