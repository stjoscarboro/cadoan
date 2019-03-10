let app = angular.module('stjoscarboro', ['ui.bootstrap']);

app.directive('loading', ['$http', '$window', function ($http, $window) {
    return {
        restrict: 'A',

        link: (scope, element) => {
            let content = $window.angular.element('.content');

            scope.isLoading = () => {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, (value) => {
                if (value) {
                    element.removeClass('ng-hide');
                    content && content.addClass('ng-hide');
                } else {
                    element.addClass('ng-hide');
                    content && content.removeClass('ng-hide');
                }
            });
        }
    };
}]);

app.factory('AppUtil', ['$document', '$interval', '$timeout', ($document, $interval, $timeout) => {
    let util = {};

    /**
     * resizeFrame
     *
     * @param scope
     */
    util.resizeFrame = (scope) => {
        let promise, currentHeight = 0;

        let resize = () => {
            let contentHeight = $document.offsetParent().outerHeight();

            if (contentHeight > currentHeight || currentHeight - contentHeight !== 20) {
                currentHeight = contentHeight + 20;
                parent.postMessage("resize::" + currentHeight, "*");
            }
        };

        //set frame resize interval
        promise = $interval(() => {
            resize();
        }, 100);

        //cancel interval
        scope.$on('$destroy', () => {
            $interval.cancel(promise);
        });
    };

    /**
     * pick
     *
     * @param obj
     * @param keys
     */
    util.pick = (obj, ...keys) => {
        return keys.reduce((o, k) => (o[k] = obj[k], o), {});
    };

    return util;
}]);

app.filter('range', () => {
    return (input, total) => {
        total = parseInt(total);

        for (let i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    };
});
