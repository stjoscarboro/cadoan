var app = angular.module("libraryApp", ['app.filters']);

app.controller("LibraryCtrl", ($scope, $q, $window, $timeout, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = [];

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
        // console.log($scope.songs);
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


app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',

        link: (scope, element) => {
            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                value ? element.removeClass('ng-hide') : element.addClass('ng-hide');
            });
        }
    };
}]);


angular.module("app.filters", [])
    .filter("localeOrderBy", [() => {
        return function (array, sortPredicate, reverseOrder) {
            if (!Array.isArray(array)) {
                return array;
            }

            if (!sortPredicate) {
                return array;
            }

            let isString = (value) => {
                return (typeof value === "string");
            };

            let isNumber = (value) => {
                return (typeof value === "number");
            };

            let isBoolean = (value) => {
                return (typeof value === "boolean");
            };

            let arrayCopy = [];
            angular.forEach(array, (item) => {
                arrayCopy.push(item);
            });

            arrayCopy.sort((a, b) => {
                let valueA = a[sortPredicate];
                let valueB = b[sortPredicate];

                if (isString(valueA))
                    return !reverseOrder ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);

                if (isNumber(valueA) || isBoolean(valueA))
                    return !reverseOrder ? valueA - valueB : valueB - valueA;

                return 0;
            });

            return arrayCopy;
        }
    }]);