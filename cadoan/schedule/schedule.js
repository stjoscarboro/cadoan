app.controller("ScheduleCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $document, $anchorScroll, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.schedule = { songs: [] };
        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];
        $scope.songs = [];
        $scope.categories = [];
        $scope.lists = {};

        $scope.rows = 5;
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

                for (let schedule of schedules) {
                    if (schedules.length <= 4 || schedule.date >= today.getTime()) {
                        schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(schedule.date));
                        $scope.schedules.push(schedule);
                    }
                }
            });
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
                    $scope.save()
                        .then(() => {
                            popup.close();
                        });
                };

                $scope.cancel = () => {
                    $scope.lists = {};
                    $scope.schedule = { songs: [] };
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

                //init datepicker to a week from last date
                if(!$scope.schedule.date) {
                    for (let schedule of $scope.schedules) {
                        let date = $.datepicker.parseDate($scope.dateFormat, schedule.date);
                        $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(date.getTime() + $scope.week));
                    }
                }
            }, 100);
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
            $scope.schedule.songs[index].category = song.category;
            $scope.selectSongs(index);
        });

        $anchorScroll();
        $scope.create();
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
     * save
     */
    $scope.save = function() {
        let date = $.datepicker.parseDate($scope.dateFormat, $scope.schedule.date),
            liturgy = $scope.schedule.liturgy,
            songs = [], payload, removed = [],
            deferred = $q.defer();

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
                            deferred.resolve();
                        },

                        (response) => {
                            console.log(response.data.error);
                            deferred.reject();
                        }
                    );
            });

        return deferred.promise;
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
                for (let list of values[0]) {
                    Array.prototype.push.apply($scope.songs, list);
                }

                //parse categories
                for (let song of $scope.songs) {
                    if (song.category && $scope.categories.indexOf(song.category) === -1) {
                        $scope.categories.push(song.category);
                    }
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
     * selectSongs
     */
    $scope.selectSongs = function (index) {
        let songs = $scope.schedule.songs[index];

        if (songs && songs.category) {
            $scope.lists[index] = {songs: []};

            for (let song of $scope.songs) {
                if (song.category === songs.category) {
                    $scope.lists[index].songs.push(song);
                }
            }
        }
    };

    /**
     * addSong
     */
    $scope.addSong = function () {
        $scope.rows.push($scope.rows.length);
    };

    /**
     * removeSong
     */
    $scope.removeSong = function () {
        $scope.rows.splice($scope.rows.length - 1, 1);
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

    /**
     * localeSensitiveComparator
     */
    $scope.localeComparator = function (v1, v2) {
        // If we don't get strings, just compare by index
        if (v1.type !== 'string' || v2.type !== 'string') {
            return (v1.index < v2.index) ? -1 : 1;
        }

        // Compare strings alphabetically, taking locale into account
        return v1.value.localeCompare(v2.value);
    };

    /**
     * categoryComparator
     */
    $scope.categoryComparator = function (v1, v2) {
        let order = [ 'Kết Lễ', 'Hiệp Lễ', 'Dâng Lễ', 'Đáp Ca', 'Nhập Lễ' ];
        return order.indexOf(v2.value) - order.indexOf(v1.value) || $scope.localeComparator(v1, v2);
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

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);

        for (let i=0; i<total; i++) {
            input.push(i);
        }

        return input;
    };
});
