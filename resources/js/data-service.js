app.factory('DataService', ['$q', 'HttpService', function ($q, HttpService) {

    let sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/',
        sheets = {
            liturgies: {
                id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
                range: 'A:B' // [text]
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
     * loadLiturgies
     *
     * @returns {f}
     */
    service.loadLiturgies = function () {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('liturgies')
            .then(
                //success
                (response) => {
                    let values = response.data.values;

                    if (values) {
                        for (let value of values) {
                            if (value[1]) {
                                results.push({id: value[0], name: value[1]});
                            }
                        }
                    }

                    deferred.resolve(results);
                },

                //failure
                (response) => {
                    console.log(response.data.error);
                }
            );

        return deferred.promise;
    };

    /**
     * loadSingers
     *
     * @returns {f}
     */
    service.loadSingers = function () {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('cadoan.singers')
            .then(
                //success
                (response) => {
                    let values = response.data.values;

                    if (values) {
                        for (let value of values) {
                            if (value[1]) {
                                results.push({id: value[0], name: value[1]});
                            }
                        }
                    }

                    deferred.resolve(results);
                },

                //failure
                (response) => {
                    console.log(response.data.error);
                }
            );

        return deferred.promise;
    };

    /**
     * loadSchedules
     *
     * @param liturgies
     * @param singers
     * @param songs
     * @returns {f}
     */
    service.loadSchedules = function (liturgies, singers, songs) {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('cadoan.schedules')
            .then(
                //success
                (response) => {
                    let values = response.data.values,
                        pick = (obj, ...keys) => keys.reduce((o, k) => (o[k] = obj[k], o), {});

                    if (values) {
                        for (let value of values) {
                            let date = Number.parseInt(value[0]),
                                liturgy = value[1],
                                list = JSON.parse(value[2]);

                            //get liturgy
                            if (liturgy) {
                                let item = liturgies.find(i => { return i.id === liturgy; });
                                liturgy = item.name;
                            }

                            //populate songs
                            for (let item of list) {
                                //find song
                                let song = (songs.find(i => { return i.id === item.id; }));
                                Object.assign(item, pick(song, 'title', 'category', 'author', 'audio', 'url', 'folder'));

                                //get singer
                                if (item.singer) {
                                    let singer = singers.find(i => { return i.id === item.singer; });
                                    item.singer = singer.name;
                                }
                            }

                            results.push({
                                date: date,
                                liturgy: liturgy,
                                songs: list
                            });
                        }
                    }

                    deferred.resolve(results);
                },

                //failure
                (response) => {
                    console.log(response.data.error);
                }
            );

        return deferred.promise;
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

        for (let key of split) {
            sheet = sheet[key];
        }

        return sheet;
    };

    return service;

}]);
