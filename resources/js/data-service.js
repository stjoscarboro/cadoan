app.factory('DataService', ['$q', 'HttpService', function($q, HttpService) {

    let sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/',
        sheets = {
            liturgies: {
                id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
                range: 'A:A' // [text]
            },

            cadoan: {
                schedules: {
                    id: '1wJc-PNIW73HSGuYus5JBZw9IMr1fZ3J74GXm-e5b-8A',
                    range: 'A:C' // [date, liturgy, songs]
                },

                members: {
                    id: '1rrjh3TAPnDz7odZTEQ6YIWKqFXxSVylVGstyb3VkqL0',
                    range: 'A:C' // [id, email, name]
                },

                messages: {
                    id: '1R462i8PpuGfpI38MNFexgtrTAplinMC5lcYSDTYLZdw',
                    range: 'A:C' // [date, member, text]
                },

                singers: {
                    id: '1c-CU_cRvWy_Wp5PhrkKN_k-H3TKArH9-5z098Wx6Ibo',
                    range: 'A:B' // [id, name]
                }
            }
    };

    let service = {};

    service.getLiturties = () => {
        return [
            'Nhập Lễ',
            'Đáp Ca',
            'Dâng Lễ',
            'Hiệp Lễ',
            'Kết Lễ',
            'Phụng Vụ'
        ]
    };

    /**
     * getSheetData
     *
     * @param sheetId
     * @param params
     *
     * @returns {*}
     */
    service.getSheetData = (sheetId, params) => {
        let sheet = getSheet(sheetId),
            url = sheetURL + sheet.id + '/values/' + sheet.range;

        return HttpService.getData(url, params);
    };

    /**
     * appendSheetData
     *
     * @param sheetId
     * @param payload
     * @param params
     *
     * @returns {*|void}
     */
    service.appendSheetData = (sheetId, payload, params) => {
        let sheet = getSheet(sheetId),
            url = sheetURL + sheet.id + '/values/' + sheet.range + ':append';

        return HttpService.postData(url, payload, params);
    };

    /**
     * updateSheetData
     *
     * @param sheetId
     * @param payload
     * @param params
     *
     * @returns {*|void}
     */
    service.updateSheetData = function (sheetId, payload, params) {
        let sheet = getSheet(sheetId),
            url = sheetURL + sheet.id + ':batchUpdate';

        return HttpService.postData(url, payload, params);
    };

    /**
     *
     * @param sheetId
     *
     * @returns {*}
     */
    let getSheet = (sheetId) => {
        let split = sheetId.split('.'),
            sheet = sheets;

        for(let key of split) {
            sheet = sheet[key];
        }

        return sheet;
    };

    return service;

}]);
