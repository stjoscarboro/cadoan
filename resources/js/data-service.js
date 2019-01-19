app.factory('DataService', function() {

    function DataService(scope) {
        this.getLiturties = () => {
            return [
                'Nhập Lễ',
                'Đáp Ca',
                'Dâng Lễ',
                'Hiệp Lễ',
                'Kết Lễ',
                'Phụng Vụ'
            ]
        };
    }

    return DataService;
});
