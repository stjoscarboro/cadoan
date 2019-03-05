app.controller("LibraryCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $filter, $document, resizeFrame, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.songs = [];
        $scope.categories = [];
        $scope.authors = [];
        $scope.song = {};

        $scope.dateFormat = "DD, dd/mm/yy";
        $scope.driveURL = FileService.getFolderURL('cadoan.sheets');

        $scope.pageSize = 10;
        $scope.pageCounter = 1;
        $scope.maxSize = 7;

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
        let admin = $scope.accessToken !== null && $scope.accessToken !== undefined,
            columns = [
                {width: 'calc(50% - 16)', targets: 0},
                {width: '35%', targets: 1},
                {width: '15%', targets: 2},
                {width: 16, targets: 3, visible: admin, searchable: false, orderable: false},
                {width: 0, targets: 4, visible: false, type: 'hidden'}
            ];

        $timeout(() => {
            $('.table').DataTable({
                language: {
                    "url": "../../resources/js/datatables-vi.json"
                },
                columns: columns,
                autoWidth: false,
                ordering: false,
                lengthMenu: [15, 25, 50],
                dom: '<fpl<t>i<"dataTables_drive">>',
                initComplete: () => {
                    if ($scope.accessToken) {
                        $(".dataTables_drive").append('<a href="' + $scope.driveURL + '" target="_blank" title="Tải Bài Hát">Danh Sách Bài Hát</a>');
                    }
                }
            });
        }, 1);
    };

    /**
     * edit
     */
    $scope.edit = function (id) {
        let song = $filter('filter')($scope.songs, {'id': id});
        if (song && song.constructor === Array && song.length > 0) {
            $scope.song = song[0];
        }

        let popup = $uibModal.open({
                scope: $scope,
                templateUrl: 'editor.html',
                backdrop: 'static',
                backdropClass: 'light',
                keyboard: false,
                controller: () => {
                    $scope.submit = () => {
                        let description = {
                            title: $scope.song.title,
                            author: $scope.song.author,
                            category: $scope.song.category,
                            others: $scope.song.others
                        };

                        FileService.updateFile($scope.song.id, {description: JSON.stringify(description)});
                        popup.close();
                    };

                    $scope.cancel = () => {
                        popup.close();
                    };
                }
            });
    };

    /**
     * search
     */
    $scope.search = function (param) {
        $('.table').DataTable().search(param).draw();
    };

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer();

        Promise.all([
            FileService.listFolder('cadoan.sheets')
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

                    if (song.author && $scope.authors.indexOf(song.author) === -1) {
                        $scope.authors.push(song.author);
                    }
                }

                //sort data
                DataService.sortByLocale($scope.songs, 'title');
                DataService.sortCategories($scope.categories);
                DataService.sortByLocale($scope.authors, 'name');

                deferred.resolve();
            });

        return deferred.promise;
    };
});
