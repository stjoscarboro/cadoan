var app = angular.module("schedulerApp", []);

app.controller("SchedulerCtrl", ($scope, $q, $window, $timeout, HttpService, EmailService) => {

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

        $scope.folders = {};
        $scope.songs = {};
        $scope.lists = {};
        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];

        $scope.rows = [0, 1, 2, 3, 4];
        $scope.categories = {};

        $scope.httpService = new HttpService($scope);
        $scope.emailService = new EmailService($scope);

        $scope.driveURL = $scope.httpService.getDriveURL($scope.sheets_folder);
        $scope.dateFormat = "DD, dd/mm/yy";
        $scope.week = 7 * 24 * 3600 * 1000;
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
                    lastDate = Date.now();

                if (values) {
                    for (let value of values) {
                        let date = Number.parseInt(value[0]),
                            liturgy = value[1],
                            songs = JSON.parse(value[2]);

                        for (let song of songs) {
                            song.url = $scope.httpService.getOpenURL(song.id);

                            let list = $scope.folders[song.folder],
                                title = song.name.replace(/(.*)(.pdf)$/, '$1');

                            for (let item of list) {
                                if (item.mimeType === 'audio/mp3' && item.name.indexOf(title) !== -1) {
                                    song.audio = $scope.httpService.getOpenURL(item.id);
                                }
                            }
                        }

                        $scope.schedules.push({
                            rawdate: date,
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
                        $scope.schedule.rawdate = date.getTime();
                    }
                });

                //init datepicker to a week from last date
                $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(lastDate + $scope.week));
                $scope.schedule.rawdate = lastDate + $scope.week;
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
            songs = [],
            payload;

        for (let item of $scope.schedule.songs) {
            let category, folder, song, singer;

            Object.values($scope.categories).forEach(c => {
                category = category ? category : c.id === item.category ? c : null;
            });

            Object.values($scope.songs).forEach(f => {
                folder = folder ? folder : f.id === item.folder ? f : null;
            });

            Object.values(folder.list).forEach(s => {
                song = song ? song : s.id === item.song ? s : null;
            });

            songs.push({
                category: category.name,
                id: song.id,
                name: song.name,
                folder: folder.id,
                singer: item.singer
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
            if (schedule.rawdate === date.getTime()) {
                $scope.remove(index);
            }
        });

        //add new schedule
        $scope.httpService.appendSheetData($scope.schedules_db, payload, {
            valueInputOption: "USER_ENTERED"
        })
            .then(response => {
                $scope.clear();
                $scope.sort();
                $scope.refresh();
            }, error => {
                $scope.error();
            });
    };

    /**
     * delete
     */
    $scope.remove = function (id) {
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
                $scope.sort();
            }, error => {
                $scope.error();
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
                console.log($scope.singers);
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
                        if ($scope.rows.indexOf(index) !== -1) {
                            $scope.categories[index] = {
                                id: folder.id,
                                name: folder.name.replace(/\d+[.][ ]+(.*)/, '$1')
                            }
                        }

                        $scope.songs[index] = {
                            id: folder.id,
                            name: folder.name
                        };

                        promises.push($scope.listFolder(folder.id));
                    }

                    Promise.all(promises)
                        .then(values => {
                            for (let [index, songs] of values.entries()) {
                                //filter only pdf files
                                songs = songs.filter(item => {
                                    return item.mimeType === 'application/pdf';
                                });

                                $scope.songs[index].list = songs;
                            }

                            deferred.resolve();
                        });
                }
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
     * listFolder
     */
    $scope.listFolder = function (folder) {
        let songs = $scope.folders[folder],
            deferred = $q.defer();

        if (songs) {
            deferred.resolve(songs);
        } else {
            $scope.httpService.getFolderData(folder)
                .then(response => {
                    songs = response.data.files;
                    $scope.folders[folder] = songs;
                    deferred.resolve(songs);
                });
        }

        return deferred.promise;
    };

    /**
     * selectFolder
     */
    $scope.selectFolder = function (index) {
        let category = $scope.schedule.songs[index].category;

        for (let folder of Object.values($scope.categories)) {
            if (folder.id === category) {
                $scope.schedule.songs[index].folder = category;
                $scope.selectSongs(index);
            }
        }
    };

    /**
     * selectSongs
     */
    $scope.selectSongs = function (index) {
        let songs = $scope.schedule.songs[index];

        if (!songs || !songs.folder) {
            $scope.lists[index] = null;
        } else {
            for (let list of Object.values($scope.songs)) {
                if (list.id === songs.folder) {
                    $scope.lists[index] = list;
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
            $window.open($scope.httpService.getOpenURL(songs.song), '_blank');
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
});