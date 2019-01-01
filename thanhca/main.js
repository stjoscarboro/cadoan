var app = angular.module("mainApp", []);

app.controller("MainCtrl", ($scope, $window, $timeout, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.schedule_db = 'thanhnhac_schedule';
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = {};
        $scope.rows = [0, 1, 2, 3, 4];
        $scope.categories = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

        $scope.get();
    }

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
                            let title = song.name.replace(/(.*)(.pdf)$/, '$1');

                            song.url = $scope.httpService.getOpenURL(song.id);
                        }

                        $scope.schedules.push({
                            rawdate: date,
                            date: $.datepicker.formatDate($scope.dateFormat, new Date(date)),
                            liturgy: liturgy,
                            songs: songs
                        });
                    }
                }

                //init songs
                $scope.listSongs();
            });
    }

    /**
     * listSongs
     */
    $scope.listSongs = function () {
        $scope.httpService.getFolderData($scope.sheets_folder)
            .then(response => {
                let folders = response.data.files;

                if (folders) {
                    for (let [index, folder] of folders.entries()) {
                        $scope.httpService.getFolderData(folder.id)
                            .then(response => {
                                if ($scope.rows.indexOf(index) !== -1) {
                                    $scope.categories[index] = {
                                        id: folder.id,
                                        name: folder.name.replace(/\d+[.][ ]+(.*)/, '$1')
                                    }
                                }

                                $scope.songs[index] = {
                                    id: folder.id,
                                    name: folder.name,
                                    list: response.data.files
                                }
                            }, error => {
                                $scope.error();
                            });
                    }
                }
            });
    }

    /**
     * print
     */
    $scope.print = function () {
        $('.pbody').printThis({
            base: window.location.href
        });
    }
});