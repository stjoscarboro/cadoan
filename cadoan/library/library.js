var app = angular.module("libraryApp", []);

app.controller("LibraryCtrl", ($scope, $q, $window, $timeout, $interval, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = [];

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

        $.fn.dataTable.ext.order.intl('vi');

        $scope.listSongs()
            .then(() => {
                $scope.get();
            });
    };

    /**
     * get
     */
    $scope.get = function () {
        $('.table').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.10.19/i18n/Vietnamese.json"
            }
        });

        //resize frame
        $timeout(() => {
            $scope.resizeFrame();
        }, 1000);
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
        let deferred = $q.defer();

        $scope.httpService.getFolderData(folder)
            .then(response => {
                if(response.data.files.length > 0) {
                    response.data.files.forEach(song => {
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
        $scope.$on('destroy', () => {
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
                    $timeout(() => {
                        element.removeClass('ng-hide');
                    }, 100);
                } else {
                    element.addClass('ng-hide');
                    $window.angular.element('.content').removeClass('ng-hide');
                }
            });
        }
    };
}]);
