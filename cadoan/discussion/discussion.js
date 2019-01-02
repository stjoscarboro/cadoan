var app = angular.module("discussionApp", []);

app.controller("DiscussionCtrl", ($scope, $q, $window, $timeout, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.members_db = 'cadoan_members';
        $scope.discussions_db = 'cadoan_discussions';

        $scope.discussion = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

        $scope.loadData()
            .then(() => {
                $scope.get();
            });
    }

    /**
     * get
     */
    $scope.get = function () {
        console.log('get');
    }

    /**
     * create
     */
    $scope.create = function() {
        let date = new Date(),
            text = $scope.discussion.text,
            payload;

        payload = {
            values: [
                [
                    date.getTime(),
                    0,
                    text
                ]
            ]
        };

        //add new discussion
        $scope.httpService.appendSheetData($scope.discussions_db, payload, {
                valueInputOption: "USER_ENTERED"
            })
            .then(() => {
                $scope.discussion = {};
            });
    }

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer(),
            promises = [];

        promises.push($scope.loadMembers());

        Promise.all(promises)
            .then(() => {
                deferred.resolve();
            });

        return deferred.promise;
    }

    /**
     * loadMembers
     */
    $scope.loadMembers = function() {
        let deferred = $q.defer();

        $scope.httpService.getSheetData($scope.members_db)
            .then(response => {
                $scope.members = response.data.values;
                deferred.resolve();
            });

        return deferred.promise;
    }
});