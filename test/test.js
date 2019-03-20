app.controller("TestCtrl", ($scope, $q, $uibModal, HttpService) => {

    /**
     * init
     */
    $scope.init = () => {
        $scope.authorize()
            .then(
                //success
                (data) => {
                    console.log(data);
                },

                //failure
                (error) => {
                    console.log(error);
                    $scope.error(error);
                }
            );
    };

    $scope.authorize = () => {
        let deferred = $q.defer();

        $.get("../resources/js/stjoscarboro-api.data", (data) => {
            let json = JSON.parse(Base64.decode(data)),
                header = {alg: 'RS256', typ: 'JWT'},
                payload = {
                    iss: json['client_email'],
                    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
                    aud: json['token_uri'],
                    sub: Base64.decode(gapiids[0]),
                    iat: KJUR.jws.IntDate.get('now'),
                    exp: KJUR.jws.IntDate.get('now + 1hour')
                },
                signature = KJUR.jws.JWS.sign(header.alg, JSON.stringify(header), JSON.stringify(payload), json['private_key']);

            HttpService.postFormData(json['token_uri'], {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: signature
            })
                .then(
                    response => {
                        deferred.resolve(response);
                    },

                    response => {
                        deferred.reject(response.data);
                    });

        });

        return deferred.promise;
    };

    $scope.error = (error) => {
        $scope.error = JSON.stringify(error);

        let popup = $uibModal.open({
            scope: $scope,
            templateUrl: '../resources/error.html',
            backdrop: 'static',
            backdropClass: 'light',
            keyboard: false,
            controller: () => {
                $scope.cancel = () => {
                    popup.close();
                };
            }
        });
    }
});
