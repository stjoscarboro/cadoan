var app = angular.module("adminApp", []);

app.controller("AdminCtrl", ($scope, $window, $timeout) => {

    /**
     * init
     */
    $scope.init = function () {};

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