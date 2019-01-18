var app = angular.module("libraryApp", []);

app.controller("LibraryCtrl", ($scope, $q, $window, $timeout, HttpService) => {

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
        // $scope.httpService.getFolderData(folder, {properties: {author: 'Nguyễn Văn Hiển'}})
            .then(response => {
                if(response.data.files.length > 0) {
                    response.data.files.forEach(song => {
                        song.url = $scope.httpService.getOpenURL(song.id)
                        $scope.songs.push(song);
                    });
                }
                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * resizeFrame
     */
    $scope.resizeFrame = function () {
        let currentHeight = 0;

        let resize = () => {
            let contentHeight = $(document).outerHeight();

            if(contentHeight !== currentHeight) {
                contentHeight += 20;
                currentHeight = contentHeight;
                parent.postMessage("resize::" + contentHeight, "*");
            }
        };

        if($scope.resizeInterval) {
            clearInterval($scope.resizeInterval);
        }

        $(document).ready(() => {
            resize();
            $scope.resizeInterval = setInterval(resize, 1000);
        });
    };

/**
     * print
     */
    $scope.print = function () {
        $('.pbody').printThis({
            base: window.location.href
        });
    };
});


app.directive('loading', ['$http', '$window', function ($http, $window) {
    return {
        restrict: 'A',

        link: (scope, element) => {
            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                if(value) {
                    setTimeout(() => {
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
