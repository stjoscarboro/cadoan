app.controller("AdminCtrl", ($scope, $window, $timeout) => {

    /**
     * init
     */
    $scope.init = function () {
    };

    /**
     * signin
     */
    $scope.signin = function (profile, token) {
        $timeout(() => {
            $scope.profile = profile;
            $scope.accessToken = token;
        }, 10);
    }
});

app.directive('a', function () {
    return {
        restrict: 'E',
        link: function (scope, elem) {
            elem.on('click', function (e) {
                if (!scope.accessToken) {
                    e.preventDefault(); // prevent link click
                }
            });
        }
    };
});