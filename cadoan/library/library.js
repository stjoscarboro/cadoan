// let app = angular.module("libraryApp", ['ui.bootstrap']);

app.controller("LibraryCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $filter, $document, HttpService, DataService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = [];
        $scope.song = {
            properties: {}
        };

        $scope.httpService = new HttpService($scope);
        $scope.dataService = new DataService($scope);

        $scope.dateFormat = "DD, dd/mm/yy";

        $.fn.dataTable.ext.order.intl('vi', {
            sensitivity: 'accent'
        } );

        $scope.liturgies = $scope.dataService.getLiturties();

        $document.ready(() => {
            if($window.angular.element('.signin').length === 0) {
                $scope.listSongs()
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

        $scope.listSongs()
            .then(() => {
                $scope.get();
                $scope.resizeFrame();
            });
    };

    /**
     * get
     */
    $scope.get = function () {
        let admin = $scope.accessToken !== null && $scope.accessToken !== undefined,
            columns = [
                { width: 500, targets: 0 },
                { width: 200, targets: 1 },
                { width: 80, targets: 2 },
                { width: 16, targets: 3, visible: admin, searchable: false, orderable: false },
                { width: 0, targets: 4, visible: false, type: 'hidden' }
            ];

        $('.table').DataTable({
            language: {
                "url": "../../resources/js/datatables-vi.json"
            },
            columns: columns,
            autoWidth: false
        });
    };

    /**
     * edit
     */
    $scope.edit = function(id) {
        let song = $filter('filter')($scope.songs, {'id':id});
        if(song && song.constructor === Array && song.length > 0) {
            $scope.song = song[0];
        }

        let popup = $uibModal.open({
            scope: $scope,
            templateUrl: 'editor.html',
            backdrop: false,
            keyboard: false,
            controller: () => {
                $scope.modify = function() {
                    popup.close();
                };

                $scope.cancel = function() {
                    popup.close();
                };
            }
        });
    };

    /**
     * search
     */
    $scope.search = function(param) {
        $('.table').DataTable().search(param).draw();
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
        let deferred = $q.defer(),
            files, properties;

        $scope.httpService.getFolderData(folder)
            .then(response => {
                if(response.data.files.length > 0) {
                    files = response.data.files;

                    if(files && files.length > 0) {
                        files.forEach(song => {
                            if(song.mimeType === 'application/pdf') {
                                try {
                                    properties = JSON.parse(song.description);
                                } catch(e) {
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

        link: (scope, element) => {
            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                if(value) {
                    element.removeClass('ng-hide');
                } else {
                    $timeout(() => {
                        element.addClass('ng-hide');
                        $window.angular.element('.content').removeClass('ng-hide');
                    }, 100);
                }
            });
        }
    };
}]);
