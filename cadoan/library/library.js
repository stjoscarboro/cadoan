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
        let columns = [
            { width: 500, targets: 0, type: "html" },
            { width: 200, targets: 1 },
            { width: 80, targets: 2 }
        ];

        $scope.accessToken && columns.push({ width: 20, targets: 3, searchable: false, orderable: false });

        $('.table').DataTable({
            language: {
                "url": "//cdn.datatables.net/plug-ins/1.10.19/i18n/Vietnamese.json"
            },
            columns: columns,
            autoWidth: false
        });
    };

    $scope.edit = function(id) {
        let song = $filter('filter')($scope.songs, {'id':id});
        if(song && song.constructor === Array && song.length > 0) {
            $scope.song = song[0];
        }

        let popup = $uibModal.open({
            scope: $scope,
            templateUrl: 'editor.html',
            backdrop: false,
            controller: () => {
                $scope.modify = function() {
                    console.log($scope.song);
                    popup.close();
                };

                $scope.cancel = function() {
                    popup.close();
                };
            }
        });

        popup.result.finally(angular.noop).then(angular.noop, angular.noop);
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
            properties;

        $scope.httpService.getFolderData(folder)
            .then(response => {
                if(response.data.files.length > 0) {
                    response.data.files.forEach(song => {
                        try {
                            properties = JSON.parse(song.description);
                        } catch(e) {
                            // No-Op
                        } finally {
                            song = Object.assign(song, properties || {});
                            song.title = song.title || song.name;
                            properties = null;
                        }

                        song.url = $scope.httpService.getOpenURL(song.id);
                        $scope.songs.push(song);
                    });
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
