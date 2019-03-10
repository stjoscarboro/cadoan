app.controller("ScheduleCtrl", ($scope, $q, $window, $uibModal, $timeout, $document, HttpService, DataService, FileService, AppUtil) => {

    /**
     * init
     */
    $scope.init = () => {
        $scope.schedule = {liturgy: {}, songs: []};
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
                    });
            }
        });
    };

    /**
     * signin
     */
    $scope.signin = (profile, token) => {
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
    $scope.get = () => {
        $scope.schedules = [];

        DataService.loadSchedules($scope.songs)
            .then(schedules => {
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                for (let schedule of schedules) {
                    if ($scope.accessToken || schedules.length <= 4 || schedule.date >= today.getTime()) {
                        schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(schedule.date));

                        //parse liturgy
                        for (let liturgy of $scope.liturgies) {
                            if (liturgy.id === schedule.liturgy.id && liturgy.year === schedule.liturgy.year) {
                                Object.assign(schedule.liturgy, AppUtil.pick(liturgy, 'name', 'year'));
                            }
                        }

                        $scope.schedules.push(schedule);
                    }
                }

                //resize host's iframe
                AppUtil.resizeFrame($scope);
            });
    };

    /**
     * sort
     */
    $scope.sort = () => {
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
                $scope.clear();
                $scope.get();
            });
    };

    /**
     * clear
     */
    $scope.clear = () => {
        $scope.lists = {};
        $scope.schedule = {liturgy: {}, songs: []};
        $scope.rows = 5;
    };

    /**
     * create
     */
    $scope.create = () => {
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
                        $scope.clear();
                        popup.close();
                    };
                }
            });

        //init datepicker
        popup.opened.then(() => {
            $timeout(() => {
                //init datepicker
                let datepicker = $('#datepicker');

                let setLiturgy = () => {
                    let date = $.datepicker.parseDate($scope.dateFormat, $scope.schedule.date);

                    for (let liturgy of $scope.liturgies) {
                        if (date.getTime() === liturgy.date.getTime()) {
                            Object.assign($scope.schedule.liturgy, AppUtil.pick(liturgy, 'id', 'year'));
                        }
                    }
                };

                let setCategories = () => {
                    if ($scope.schedule.songs.length === 0) {
                        for (let i = 0; i < 5; i++) {
                            $scope.schedule.songs.push({category: $scope.categories[i]});
                            $scope.selectSongs(i);
                        }
                    }
                };

                //init datepicker
                datepicker.datepicker({
                    dateFormat: $scope.dateFormat,
                    onSelect: (date) => {
                        //init datepicker with this date
                        $scope.schedule.date = date;

                        //init liturgy
                        $scope.schedule.liturgy = {};
                        setLiturgy()
                    }
                });

                //set datepicker to a week from last scheduled date
                if (!$scope.schedule.date) {
                    for (let schedule of $scope.schedules) {
                        let date = $.datepicker.parseDate($scope.dateFormat, schedule.date);
                        $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(date.getTime() + $scope.week));
                    }
                }

                //init liturgy
                setLiturgy();

                //init categories
                setCategories();
            }, 100);
        });
    };

    /**
     * edit
     */
    $scope.edit = (id) => {
        $scope.schedule = angular.copy($scope.schedules[id]);
        $scope.rows = $scope.schedule.songs.length;

        //get liturgy
        let liturgy = $scope.liturgies.find(i => {
            return i.id === $scope.schedule.liturgy.id;
        });
        liturgy && Object.assign($scope.schedule.liturgy, liturgy);

        $scope.schedule.songs.forEach((song, index) => {
            //get singer
            let singer = $scope.singers.find(i => {
                return i.name === song.singer;
            });
            singer && (song.singer = singer.id);

            Object.assign($scope.schedule.songs[index], AppUtil.pick(song, 'id', 'category'));
            $scope.selectSongs(index);
        });

        $scope.create();
    };

    /**
     * remove
     */
    $scope.remove = (id) => {
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
    $scope.save = () => {
        let date = $.datepicker.parseDate($scope.dateFormat, $scope.schedule.date),
            liturgy = Object.assign({}, AppUtil.pick($scope.schedule.liturgy, 'id', 'year', 'special')),
            songs = [], payload, removed = [],
            deferred = $q.defer();

        //parse songs
        for (let song of $scope.schedule.songs) {
            songs.push(Object.assign({}, AppUtil.pick(song, 'id', 'singer')));
        }

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
    $scope.loadData = () => {
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
                $scope.categories = DataService.listCategories($scope.songs);

                //populate liturgies
                $scope.liturgies = values[1];

                //populate singers
                $scope.singers = values[2];

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
    $scope.selectSongs = (index) => {
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
    $scope.previewSong = (index) => {
        let song = $scope.schedule.songs[index];

        if (song) {
            $window.open(FileService.getOpenURL(song.id), '_blank');
        }
    };
});
