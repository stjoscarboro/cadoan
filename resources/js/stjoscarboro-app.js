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
            });
        }
    };
}]);

app.factory('AppUtil', ['$document', '$window', '$interval', '$timeout', ($document, $window, $interval, $timeout) => {
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

            if (currentHeight !== contentHeight) {
                currentHeight = contentHeight;
                parent.postMessage("resize::" + (currentHeight + 20), "*");
            }
        };

        //resize frame
        $timeout(() => {
            resize();
        }, 10);

        //set frame resize interval
        promise = $interval(() => {
            resize();
        }, 1000);

        //cancel interval
        scope.$on('$destroy', () => {
            $interval.cancel(promise);
        });

        //display content
        $window.angular.element('.content').removeClass('ng-hide');
    };

    /**
     * scrollFrame
     */
    util.scrollFrame = () => {
        parent.postMessage("scroll::0:0", "*");
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
