app.controller("LibraryCtrl", ($scope, $q, $window, $uibModal, $timeout, $interval, $filter, $document, HttpService, DataService, FileService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.sheets_folder = '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p';

        $scope.songs = [];
        $scope.song = {};

        $scope.dateFormat = "DD, dd/mm/yy";

        $.fn.dataTable.ext.order.intl('vi', {
            sensitivity: 'accent'
        });

        $scope.liturgies = DataService.getLiturties();

        $document.ready(() => {
            if ($window.angular.element('.signin').length === 0) {
                $scope.loadData()
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
        HttpService.setAccessToken(token);

        $scope.loadData()
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
                {width: 500, targets: 0},
                {width: 200, targets: 1},
                {width: 80, targets: 2},
                {width: 16, targets: 3, visible: admin, searchable: false, orderable: false},
                {width: 0, targets: 4, visible: false, type: 'hidden'}
            ];

        $timeout(() => {
            $('.table').DataTable({
                language: {
                    "url": "../../resources/js/datatables-vi.json"
                },
                columns: columns,
                autoWidth: false
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
                backdrop: false,
                keyboard: false,
                controller: () => {
                    $scope.modify = function () {
                        popup.close();
                    };

                    $scope.cancel = function () {
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
            FileService.listSongs($scope.sheets_folder)
        ])
            .then((values) => {
                let songs = values[0];
                for(let list of songs) {
                    $scope.songs = $scope.songs.concat(list);
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
                if (value) {
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
