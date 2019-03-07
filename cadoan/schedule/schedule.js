app.controller("ScheduleCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $document, resizeFrame, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.schedule = { liturgy: {}, songs: [] };
        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];
        $scope.years = [];
        $scope.songs = [];
        $scope.categories = [];
        $scope.lists = {};

        $scope.years = [ 'Năm A', 'Năm B', 'Năm C'];
        $scope.rows = 5;
        $scope.dateFormat = "DD, dd/mm/yy";
        $scope.week = 7 * 24 * 3600 * 1000;

        $document.ready(() => {
            if ($window.angular.element('.signin').length === 0) {
                $scope.loadData()
                    .then(() => {
                        $scope.get();
                        resizeFrame($scope);
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
                resizeFrame($scope);
            });
    };

    /**
     * get
     */
    $scope.get = function () {
        $scope.schedules = [];

        DataService.loadSchedules($scope.songs)
            .then(schedules => {
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let schedule of schedules) {
                    if ($scope.accessToken || schedules.length <= 4 || schedule.date >= today.getTime()) {
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
        $scope.schedule = { liturgy: {}, songs: [] };
        $scope.get();
    };

    /**
     * create
     */
    $scope.create = function () {
        let popup = $uibModal.open({
                scope: $scope,
                templateUrl: 'editor.html',
                backdrop: 'static',
                backdropClass: 'light',
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
                        $scope.schedule = { liturgy: {}, songs: [] };
                        $scope.rows = 5;
                        popup.close();
                    };
                }
            });

        //init datepicker
        popup.opened.then(() => {
            $timeout(() => {
                //init datepicker
                let datepicker = $('#datepicker');

                let setYear = () => {
                    let date = $.datepicker.parseDate($scope.dateFormat, $scope.schedule.date);

                    for(let year of $scope.years) {
                        if(date.getTime() >= year.start && date.getTime() < year.end) {
                            $scope.schedule.liturgy.year = year.id;
                        }
                    }
                };

                datepicker.datepicker({
                    dateFormat: $scope.dateFormat,
                    onSelect: (text) => {
                        let date = $.datepicker.parseDate($scope.dateFormat, text);

                        //init datepicker with this date
                        $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, date);

                        //init year
                        setYear();
                    }
                });

                //init datepicker to a week from last date
                if(!$scope.schedule.date) {
                    for (let schedule of $scope.schedules) {
                        let date = $.datepicker.parseDate($scope.dateFormat, schedule.date);
                        $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(date.getTime() + $scope.week));
                    }
                }

                //init year
                setYear();
            }, 100);
        });
    };

    /**
     * edit
     */
    $scope.edit = function (id) {
        $scope.schedule = angular.copy($scope.schedules[id]);
        $scope.rows = $scope.schedule.songs.length;

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

        //parse songs
        for (let song of $scope.schedule.songs) {
            songs.push({
                id: song.id,
                singer: song.singer
            });
        }

        //clean liturgy of empty properties
        Object.keys(liturgy).forEach(key => (!liturgy[key]) && delete liturgy[key]);

        //create payload
        payload = {
            values: [
                [
                    date.getTime(),
                    JSON.stringify(liturgy),
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
            DataService.loadSingers(),
            DataService.loadYears()
        ])
            .then((values) => {
                //populate songs
                for (let list of values[0]) {
                    Array.prototype.push.apply($scope.songs, list);
                }

                //parse categories
                $scope.categories = DataService.listCategories($scope.songs);

                //populate liturgies
                $scope.liturgies = values[1];

                //populate singers
                $scope.singers = values[2];

                //populate years
                $scope.years = values[3];

                //sort data
                DataService.sortByLocale($scope.songs, 'title');
                DataService.sortByLocale($scope.singers, 'name');
                DataService.sortCategories($scope.categories);

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
     * previewSong
     */
    $scope.previewSong = function (index) {
        let song = $scope.schedule.songs[index];

        if (song) {
            $window.open(FileService.getOpenURL(song.id), '_blank');
        }
    };
});

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);

        for (let i=0; i<total; i++) {
            input.push(i);
        }

        return input;
    };
});
