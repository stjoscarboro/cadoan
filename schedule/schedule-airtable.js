app.controller("ScheduleCtrl", [
    '$scope', '$q', '$window', '$uibModal', '$timeout', '$document', 'GoogleService', 'AirtableChoirService', 'AirtableLiturgyService', 'AirtableFilesService', 'AppUtil',
    ($scope, $q, $window, $uibModal, $timeout, $document, GoogleService, AirtableChoirService, AirtableLiturgyService, AirtableFilesService, AppUtil) => {

    /**
     * init
     */
    $scope.init = () => {
        $scope.schedules = [];
        $scope.liturgies = [];
        $scope.singers = [];
        $scope.years = [];
        $scope.songs = [];
        $scope.categories = [];

        $scope.dateFormat = "DD, dd/mm/yy";
        $scope.dayms = 24 * 3600 * 1000;
        $scope.weekms = 7 * $scope.dayms;

        $scope.clear();

        $document.ready(() => {
            if($window.angular.element('.signin').length === 0) {
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
        GoogleService.setAccessToken(token);

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

        AirtableChoirService.loadSchedules($scope.songs)
            .then(schedules => {
                let today = new Date(),
                    count = 5,
                    first = (schedules.length >= count ? schedules.slice(-count) : schedules.slice(0))[0].date;

                today.setHours(0, 0, 0, 0);
                first.setHours(0, 0, 0, 0);

                for(let schedule of schedules) {
                    if($scope.accessToken || schedule.date >= today || schedule.date >= first) {
                        //parse liturgy
                        for(let liturgy of $scope.liturgies) {
                            if(liturgy.id === schedule.liturgy.id && liturgy.date.getTime() === schedule.date.getTime()) {
                                Object.assign(schedule.liturgy, AppUtil.pick(liturgy, 'name', 'year'));

                                //assign liturgy year
                                $scope.years.forEach(year => {
                                    year.id === schedule.liturgy.year && (schedule.liturgy.year = year);
                                });

                                //assign liturgy intention
                                if(liturgy.intention) {
                                    schedule.liturgy.intention = liturgy.intention;
                                }
                            }
                        }

                        //count duplicate category
                        let categories = schedule.songs.reduce((count, song) => {
                            count[song.category] = (count[song.category] || 0) + 1;
                            return count;
                        }, {});

                        //parse duplicate categories
                        Object.keys(categories).forEach(category => {
                            if(categories[category] > 1) {
                                let index = 1;
                                schedule.songs.forEach(song => {
                                    if(song.category === category) {
                                        song.category = category + ' ' + (index++);
                                    }
                                });
                            }
                        });

                        schedule.date = $.datepicker.formatDate($scope.dateFormat, schedule.date);
                        $scope.schedules.push(schedule);
                    }
                }

                //resize host's iframe
                AppUtil.resizeFrame($scope);
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
     * refresh
     */
    $scope.refresh = () => {
        $scope.clear();
        $scope.get();
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

                    //set liturgy
                    for(let liturgy of $scope.liturgies) {
                        if(date.getTime() === liturgy.date.getTime()) {
                            Object.assign($scope.schedule.liturgy, AppUtil.pick(liturgy, 'id', 'name', 'year'));

                            if(!$scope.schedule.liturgy.intention) {
                                $scope.schedule.liturgy.intention = liturgy.intention;
                            }
                        }
                    }

                    //set year
                    for(let year of $scope.years) {
                        if($scope.schedule.liturgy.year === year.id) {
                            $scope.schedule.liturgy.year = year;
                        }
                    }
                };

                let setCategories = () => {
                    if($scope.schedule.songs.length === 0) {
                        for(let i = 0; i < 5; i++) {
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
                if(!$scope.schedule.date) {
                    for(let schedule of $scope.schedules) {
                        let date = $.datepicker.parseDate($scope.dateFormat, schedule.date),
                            timediff = $scope.weekms - (date.getDay() * $scope.dayms);

                        $scope.schedule.date = $.datepicker.formatDate($scope.dateFormat, new Date(date.getTime() + timediff));
                    }
                }

                //init liturgy
                setLiturgy();

                //init categories
                setCategories();

                //scroll host's iframe
                AppUtil.scrollFrame();
            }, 100);
        });
    };

    /**
     * edit
     */
    $scope.edit = (index) => {
        $scope.schedule = angular.copy($scope.schedules[index]);
        $scope.rows = $scope.schedule.songs.length;

        //get liturgy
        let liturgy = $scope.liturgies.find(i => {
            return i.id === $scope.schedule.liturgy.id;
        });
        liturgy && Object.assign($scope.schedule.liturgy, AppUtil.pick(liturgy, 'name'));

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
    $scope.remove = (index) => {
        let deferred = $q.defer(),
            schedule = $scope.schedules[index] || {};

        AirtableChoirService.deleteSchedule(schedule.refId)
            .then(() => {
                $scope.schedules.splice(index, 1);
                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * save
     */
    $scope.save = () => {
        let date = $.datepicker.parseDate($scope.dateFormat, $scope.schedule.date),
            liturgy = {}, songs = [], payload,
            deferred = $q.defer();

        //parse songs
        for(let song of $scope.schedule.songs) {
            if(song.id) {
                songs.push(Object.assign({}, AppUtil.pick(song, 'id', 'singer')));
            }
        }

        //parse liturgy
        for(let liturgy of $scope.liturgies) {
            if(liturgy.name === $scope.schedule.liturgy.name && liturgy.year === $scope.schedule.liturgy.year.id) {
                $scope.schedule.liturgy.id = liturgy.id;
                $scope.schedule.liturgy.year = $scope.schedule.liturgy.year.id;
            }
        }

        //set liturgy
        if($scope.schedule.liturgy.id) {
            Object.assign(liturgy, AppUtil.pick($scope.schedule.liturgy, 'id', 'year', 'intention'));
        } else {
            Object.assign(liturgy, AppUtil.pick($scope.schedule.liturgy, 'name', 'year', 'intention'));
        }

        //set intention
        liturgy.intention = liturgy.intention && liturgy.intention.name && !liturgy.intention.id && {name: liturgy.intention.name} || null;
        !liturgy.intention && delete liturgy.intention;

        //create payload
        payload = {
            date: $.datepicker.formatDate('yy-mm-dd', date),
            liturgy: JSON.stringify(liturgy),
            songs: JSON.stringify(songs)
        };

        //find schedule with this date
        let schedule = $scope.schedules.find(i => {
            return i.date === $scope.schedule.date;
        });

        //create or update
        if(schedule) {
            //update
            AirtableChoirService.updateSchedule(schedule.refId, payload)
                .then(() => {
                    $scope.refresh();
                    deferred.resolve();
                });
        } else {
            //create
            AirtableChoirService.createSchedule(payload)
                .then(() => {
                    $scope.refresh();
                    deferred.resolve();
                });
        }

        deferred.resolve();
        return deferred.promise;
    };

    /**
     * loadData
     */
    $scope.loadData = () => {
        let deferred = $q.defer();

        $q.all([
            AirtableFilesService.loadFiles(),
            AirtableLiturgyService.loadYears(),
            AirtableLiturgyService.loadLiturgies(),
            AirtableChoirService.loadSingers()
        ])
            .then((values) => {
                //populate songs
                Array.prototype.push.apply($scope.songs, values[0]);

                //parse categories
                $scope.categories = AirtableChoirService.listCategories($scope.songs);
                $scope.categories.push('Tất Cả');

                //populate years
                $scope.years = values[1];

                //populate liturgies
                $scope.liturgies = values[2];

                //populate singers
                $scope.singers = values[3];
                $scope.singers.unshift({ id: null, name: null });

                //sort data
                AirtableChoirService.sortByLocale($scope.songs, 'title');
                AirtableChoirService.sortByLocale($scope.singers, 'name');

                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * selectSongs
     */
    $scope.selectSongs = (index) => {
        let songs = $scope.schedule.songs[index];

        if(songs && songs.category) {
            $scope.lists[index] = {songs: []};

            for(let song of $scope.songs) {
                if(songs.category.indexOf(song.category) !== -1) {
                    songs.category = song.category;
                    $scope.lists[index].songs.push(song);
                }
            }

            if($scope.lists[index].songs.length === 0) {
                $scope.lists[index].songs = $scope.songs;
            }
        }
    };

    /**
     * previewSong
     */
    $scope.previewSong = (index) => {
        let song = $scope.schedule.songs[index];

        if(song && song.id) {
            $window.open(song.url, '_blank');
        }
    };

    /**
     * addSong
     */
    $scope.addSong = () => {
        $scope.rows += 1;
        $scope.schedule.songs.push({});
    };

    /**
     * removeSong
     */
    $scope.removeSong = () => {
        $scope.rows -= 1;
        $scope.schedule.songs.splice($scope.rows, 1);
    };

    /**
     * tagHandler
     * Fixed error when expanding select using the arrow with search-enabled="false"
     *
     * @return {null}
     */
    $scope.tagHandler = function (){
        return null;
    }
}]);
