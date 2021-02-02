let app = angular.module('locthanh', []);

app.controller("LocThanhCtrl", ['$scope', ($scope) => {

    const filter = [
        '004', '007', '010', '011', '012', '013', '015', '017', '022', '023',
        '024', '025', '029', '030', '036', '040', '041', '051', '056', '060',
        '065', '074', '077', '085', '086', '087', '090', '091', '095', '101',
        '102', '108', '109', '110', '112', '116', '117', '120', '128', '129',
        '132', '134', '142', '145', '147', '150', '154', '159', '167', '171',
        '180', '187', '190', '192', '195', '200', '211', '213', '228', '235',
        '213', '016', '174', '145', '197', '227', '034', '181'
    ];

    /**
     * init
     */
    $scope.init = () => {
        $scope.next();
    };

    $scope.next = () => {
        let total = 240,
            number = Math.floor(Math.random() * Math.floor(total)) + 1,
            image = number < 10 ? `00${number}` : number < 100 ? `0${number}` : `${number}`;

        console.log(image);
        filter.includes(image) ? $scope.next() : $scope.image = image;
    }

}]);
