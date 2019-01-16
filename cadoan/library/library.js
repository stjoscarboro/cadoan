var app = angular.module("libraryApp", []);

app.controller("LibraryCtrl", ($scope, $q, $window, $timeout, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

        $scope.listSongs()
            .then(() => {
                $scope.get();
            });
    };

    /**
     * get
     */
    $scope.get = function () {
        console.log($scope.songs);
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
        let songs = $scope.songs[folder],
            deferred = $q.defer();

        if (songs) {
            deferred.resolve(songs);
        } else {
            $scope.httpService.getFolderData(folder, {properties: {author: 'Nguyễn Văn Hiển'}})
                .then(response => {
                    $scope.songs[folder] = response.data.files;
                    deferred.resolve($scope.songs[folder]);
                });
        }

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


app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',

        link: function (scope, element, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (value) {
                if (value) {
                    element.removeClass('ng-hide');
                } else {
                    element.addClass('ng-hide');
                }
            });
        }
    };
}]);
