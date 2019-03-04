let app = angular.module('stjoscarboro', ['ui.bootstrap']);

app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',

        link: (scope, element) => {
            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                value ? element.removeClass('ng-hide') : element.addClass('ng-hide');
                scope.loading = value;
            });
        }
    };
}]);

app.factory('resizeFrame', ['$interval', ($interval) => {
    return ($scope) => {
        let promise, height = 0;

        let resize = (currentHeight) => {
            let contentHeight = $(document).outerHeight();

            if (contentHeight !== currentHeight) {
                contentHeight += 20;
                parent.postMessage("resize::" + contentHeight, "*");
            }

            return contentHeight;
        };

        //set resize interval
        promise = $interval(() => {
            height = resize(height);
        }, 1000);

        //cancel interval
        $scope.$on('$destroy', () => {
            $interval.cancel(promise);
        });
    }
}]);
