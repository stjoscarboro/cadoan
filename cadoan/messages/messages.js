var app = angular.module("messagesApp", ['ngQuill']);

app.controller("MessagesCtrl", ($scope, $q, $window, $timeout, $sce, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.messages_db = 'cadoan_messages';

        $scope.messages = [];
        $scope.message = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "dd/mm/yy";

        $scope.loadData()
            .then(() => {
                $scope.get();
            });

        $window.refresh = () => {
            $scope.get();
        };

        $window.angular.element('.content').bind('click', (event) => {
            let el = event.target;

            if (el.tagName === "A" && !el.isContentEditable && el.host !== window.location.host) {
                el.setAttribute("target", "_blank")
            }
        });
    };

    /**
     * signin
     */
    $scope.signin = function (profile, token) {
        $scope.profile = profile;
        $scope.accessToken = token;

        $scope.get();
    };

    /**
     * get
     */
    $scope.get = function () {
        $scope.messages = [];

        $scope.httpService.getSheetData($scope.messages_db)
            .then(response => {
                let values = response.data.values;

                if (values) {
                    values.sort((a, b) => (a[0] > b[0]) ? -1 : ((b[0] > a[0]) ? 1 : 0));

                    for (let value of values) {
                        let date = new Date(Number.parseInt(value[0])),
                            sender = value[1],
                            text = value[2];

                        $scope.messages.push({
                            date: $scope.getDateTime(date),
                            sender: sender,
                            text: $sce.trustAsHtml(text)
                        });
                    }
                }
            });
    };

    /**
     * create
     */
    $scope.create = function () {
        let date = new Date(),
            sender = $scope.profile.getName(),
            payload;

        if ($scope.message.text) {
            if (Base64.encode($scope.profile.getEmail()) === gapiids[0]) {
                sender = 'Admin';
            }

            payload = {
                values: [
                    [
                        date.getTime(),
                        sender,
                        $scope.message.text
                    ]
                ]
            };

            //add new message
            $scope.httpService.appendSheetData($scope.messages_db, payload, {
                valueInputOption: "USER_ENTERED"
            })
                .then(() => {
                    $scope.message = {};
                    $scope.updateList();
                });
        }
    };

    /**
     * loadData
     */
    $scope.loadData = function () {
        let deferred = $q.defer(),
            promises = [];

        Promise.all(promises)
            .then(() => {
                deferred.resolve();
            });

        return deferred.promise;
    };

    /**
     * updateList
     */
    $scope.updateList = function () {
        let listFrame = parent.document.getElementById("message_frame"),
            listWindow = listFrame && listFrame.contentWindow;

        listWindow && listWindow.refresh();
    };

    /**
     * getDateTime
     */
    $scope.getDateTime = function (date) {
        let today = new Date(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            diff = (today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 3600000,
            ampm, time = '';

        ampm = (hours > 12 || hours === 12 && minutes > 0) ? 'PM' : 'AM';
        hours = (hours > 12) ? hours - 12 : hours;
        hours = (hours < 10 ? '0' : '') + hours;
        minutes = (minutes < 10 ? '0' : '') + minutes;

        switch (diff) {
            case 0:
                time += 'Hôm nay lúc ' + hours + ':' + minutes + ' ' + ampm;
                break;

            case 24:
                time += 'Hôm qua lúc ' + hours + ':' + minutes + ' ' + ampm;
                break;

            case 48:
            case 72:
            case 96:
            case 120:
            case 144:
                time += (diff / 24) + ' ngày trước';
                break;

            case 168:
                time += '1 tuần trước';
                break;

            default:
                time += $.datepicker.formatDate($scope.dateFormat, date);
        }

        return time;
    };
});