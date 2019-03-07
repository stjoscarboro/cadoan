let app = angular.module('stjoscarboro', ['ui.bootstrap']);

app.directive('loading', ['$http', '$window', '$timeout', function ($http, $window, $timeout) {
    return {
        restrict: 'A',

        link: (scope, element) => {
            let content = $window.angular.element('.content');

            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                if(value) {
                    element.removeClass('ng-hide');
                    content && content.addClass('ng-hide hide-scrollbar');
                } else {
                    element.addClass('ng-hide');
                    content && content.removeClass('ng-hide');

                    $timeout(() => {
                        content.removeClass('hide-scrollbar');
                    });
                }
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
