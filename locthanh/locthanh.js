let app = angular.module('locthanh', ['ui.bootstrap']);

app.controller("LocThanhCtrl", [
    '$scope',
    ($scope) => {

        /**
         * init
         */
        $scope.init = () => {
            $scope.next();
        };

        $scope.next = () => {
            const total = 80;
            const number = Math.floor(Math.random() * Math.floor(total)) + 1;
            $scope.image = number < 10 ? `00${number}` : number < 100 ? `0${number}` : number;
        }

    }]);
