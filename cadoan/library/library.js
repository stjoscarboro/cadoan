app.controller("LibraryCtrl", [
    '$scope', '$q', '$window', '$uibModal', '$timeout', '$filter', '$document', 'HttpService', 'DataService', 'FileService', 'AppUtil',
    ($scope, $q, $window, $uibModal, $timeout, $filter, $document, HttpService, DataService, FileService, AppUtil) => {

        /**
         * init
         */
        $scope.init = () => {
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
                    pageLength: 15,
                    lengthMenu: [[10, 15, 25, 50, -1], [10, 15, 25, 50, "All"]],
                    dom: '<fpl<t>i<"dataTables_drive">>',
                    initComplete: () => {
                        if ($scope.accessToken) {
                            $(".dataTables_drive").append('<a href="' + $scope.driveURL + '" target="_blank" title="Danh Sách Bài Hát" class="drive-icon"></a>');
                        }

                        //resize host's iframe
                        AppUtil.resizeFrame($scope);
                    }
                });
            }, 1);
        };

        /**
         * edit
         */
        $scope.edit = (id) => {
            let song = $filter('filter')($scope.songs, {'id': id})[0];

            $scope.song = angular.copy(song);

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
                                    Object.assign(song, AppUtil.pick($scope.song, 'title', 'category', 'author', 'others'));
                                    $scope.refresh();
                                    popup.close();
                                });
                        };

                        $scope.cancel = () => {
                            popup.close();
                        };
                    }
                });

            popup.opened.then(() => {
                $timeout(() => {
                    //scroll host's iframe
                    AppUtil.scrollFrame();
                }, 100);
            });
        };

        /**
         * search
         */
        $scope.search = (param) => {
            $('.table').DataTable().search(param).draw();
        };

        /**
         * save
         */
        $scope.save = () => {
            let deferred = $q.defer(),
                description = {
                    title: $scope.song.title,
                    author: $scope.song.author,
                    category: $scope.song.category,
                    others: $scope.song.others
                };

            FileService.updateFile($scope.song.id, {description: JSON.stringify(description)})
                .then(() => {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        /**
         * refresh
         */
        $scope.refresh = () => {
            //parse categories
            $scope.categories = DataService.listCategories($scope.songs);

            //parse authors
            $scope.authors = DataService.listAuthors($scope.songs);

            //refresh table
            $('.table').DataTable().draw();
        };

        /**
         * loadData
         */
        $scope.loadData = () => {
            let deferred = $q.defer();

            $q.all([
                FileService.listFolder('cadoan.sheets')
            ])
                .then((values) => {
                    //populate songs
                    for (let list of values[0]) {
                        Array.prototype.push.apply($scope.songs, list);
                    }

                    //parse categories
                    $scope.categories = DataService.listCategories($scope.songs);

                    //parse authors
                    $scope.authors = DataService.listAuthors($scope.songs);

                    //sort data
                    DataService.sortByLocale($scope.songs, 'title');

                    deferred.resolve();
                });

            return deferred.promise;
        };
    }]);
