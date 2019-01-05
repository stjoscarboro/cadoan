var app = angular.module("newsformApp", ['ngQuill']);

app.controller("NewsformCtrl", ($scope, $q, $window, $timeout, $sce, HttpService) => {

    /**
     * init
     */
    $scope.init = function () {
        $scope.notices_db = 'cadoan_notices';

        $scope.notices = [];
        $scope.notice = {};

        $scope.httpService = new HttpService($scope);
        $scope.dateFormat = "DD, dd/mm/yy";

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
        $scope.notices = [];

        $scope.httpService.getSheetData($scope.notices_db)
            .then(response => {
                let values = response.data.values;

                if (values) {
                    values.sort((a, b) => (a[0] > b[0]) ? -1 : ((b[0] > a[0]) ? 1 : 0));

                    for (let value of values) {
                        let date = new Date(Number.parseInt(value[0])),
                            sender = value[1],
                            text = value[2];

                        $scope.notices.push({
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

        if ($scope.notice.text) {
            if(Base64.encode($scope.profile.getEmail()) === gapiid) {
                sender = 'Admin';
            }

            payload = {
                values: [
                    [
                        date.getTime(),
                        sender,
                        $scope.notice.text
                    ]
                ]
            };

            //add new notice
            $scope.httpService.appendSheetData($scope.notices_db, payload, {
                valueInputOption: "USER_ENTERED"
            })
                .then(() => {
                    $scope.notice = {};
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
        let listFrame = parent.document.getElementById("notice_frame"),
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
            seconds = date.getSeconds(),
            ampm = 'AM', time = '';

        if (today.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)) {
            time += 'Hôm nay';
        } else if (today.setHours(0, 0, 0, 0) === date.setHours(24, 0, 0, 0)) {
            time += 'Hôm qua'
        } else {
            time += $.datepicker.formatDate($scope.dateFormat, date);
        }

        if (hours > 12) {
            hours = hours - 12;
            ampm = 'PM';
        } else if (hours === 12 && minutes > 0) {
            ampm = 'PM';
        }

        minutes = (minutes < 10 ? '0' : '') + minutes;

        seconds = (seconds < 10 ? '0' : '') + seconds;

        return time + ' lúc ' + (hours < 10 ? '0' : '') + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    };
});