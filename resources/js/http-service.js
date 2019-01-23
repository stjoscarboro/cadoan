app.factory('HttpService', ['$http', function ($http) {

    let sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/',
        gapiKey = Base64.decode('QUl6YVN5RFZLNXpQMFRuaFJhbTBCc3Z2YjU5UnZGWk1tUjNqR1c4');

    let sheets = {
        lector_members: {
            id: '1yl0oy1a9Brr2O3a9zC4HtuFnq2U9UkUZGj_A6C0YWDM',
            range: 'A:D'
        },

        lector_schedules: {
            id: '18vfSNSUZ7zBH-MLhpyuo9floVgLpmCRxv2qg1ss_4tk',
            range: 'A:H'
        },

        liturgies: {
            id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
            range: 'A:A' // [text]
        },

        cadoan_schedules: {
            id: '1wJc-PNIW73HSGuYus5JBZw9IMr1fZ3J74GXm-e5b-8A',
            range: 'A:C' // [date, liturgy, songs]
        },

        cadoan_members: {
            id: '1rrjh3TAPnDz7odZTEQ6YIWKqFXxSVylVGstyb3VkqL0',
            range: 'A:C' // [id, email, name]
        },

        cadoan_messages: {
            id: '1R462i8PpuGfpI38MNFexgtrTAplinMC5lcYSDTYLZdw',
            range: 'A:C' // [date, member, text]
        },

        cadoan_singers: {
            id: '1c-CU_cRvWy_Wp5PhrkKN_k-H3TKArH9-5z098Wx6Ibo',
            range: 'A:B' // [id, name]
        }
    };

    let service = {};

    /**
     * setAccessToken
     *
     * @param token
     */
    service.setAccessToken = function (token) {
        service.access_token = token;
    };

    /**
     * get
     *
     * @param url
     * @param params
     * @returns {*}
     */
    service.get = function (url, params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + 'key=' + gapiKey;
        return $http.get(url, {
            params: params
        });
    };

    /**
     * getSheetData
     */
    service.getSheetData = function (sheetId, params) {
        let sheet = sheets[sheetId],
            url = sheetURL + sheet.id + '/values/' + sheet.range;

        params = service.getParams(params);
        return $http.get(url, {
            params: params
        });
    };

    /**
     * appendSheetData
     */
    service.appendSheetData = function (sheetId, payload, params) {
        let sheet = sheets[sheetId],
            url = sheetURL + sheet.id + '/values/' + sheet.range + ':append';

        params = service.getParams(params);
        return $http.post(url, payload, {
            params: params
        });
    };

    /**
     * updateSheetData
     */
    service.updateSheetData = function (sheetId, payload, params) {
        let sheet = sheets[sheetId],
            url = sheetURL + sheet.id + ':batchUpdate';

        params = service.getParams(params);
        return $http.post(url, payload, {
            params: params
        });
    };

    /**
     * getParams
     */
    service.getParams = function (params) {
        !params && (params = {});
        params.key = gapiKey;
        params.access_token = service.access_token;

        return params;
    };

    return service;

}]);