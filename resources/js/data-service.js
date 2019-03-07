app.factory('DataService', ['$q', 'HttpService', ($q, HttpService) => {

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
                },

                years: {
                    id: '1GPIzPBml9fx_W_Tgl4udEGBpmDHOxiZL-3rNiEGvwYE',
                    range: 'A:D' // [id, name, from, to]
                }
            }
        };

    let service = {};

    /**
     * getCategories
     *
     * @returns {string[]}
     */
    service.getCategories = () => {
        return [
            'Nhập Lễ',
            'Đáp Ca',
            'Dâng Lễ',
            'Hiệp Lễ',
            'Kết Lễ'
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
    service.updateSheetData = (sheetId, payload, params) => {
        let sheet = getSheet(sheetId),
            url = sheetURL + sheet.id + ':batchUpdate';

        return HttpService.postData(url, payload, params);
    };

    /**
     * loadLiturgies
     *
     * @returns {f}
     */
    service.loadLiturgies = () => {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('liturgies')
            .then(
                //success
                (response) => {
                    let values = response.data.values;

                    if (values) {
                        values.forEach(value => {
                            if (value[1]) {
                                results.push({id: value[0], name: value[1]});
                            }
                        });
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
    service.loadSingers = () => {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('cadoan.singers')
            .then(
                //success
                (response) => {
                    let values = response.data.values;

                    if (values) {
                        values.forEach(value => {
                            if (value[1]) {
                                results.push({id: value[0], name: value[1]});
                            }
                        });
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
    service.loadYears = () => {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('cadoan.years')
            .then(
                //success
                (response) => {
                    let values = response.data.values;

                    if (values) {
                        values.forEach(value => {
                            if (value[1]) {
                                results.push({
                                    id: value[0],
                                    name: value[1],
                                    start: Date.parse(value[2]),
                                    end: Date.parse(value[3])
                                });
                            }
                        });
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
     * @param songs
     * @returns {f}
     */
    service.loadSchedules = (songs) => {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('cadoan.schedules')
            .then(
                //success
                (response) => {
                    let values = response.data.values,
                        pick = (obj, ...keys) => keys.reduce((o, k) => (o[k] = obj[k], o), {});

                    if (values) {
                        values.forEach(value => {
                            let date = Number.parseInt(value[0]),
                                liturgy = JSON.parse(value[1]),
                                list = JSON.parse(value[2]);

                            //populate songs
                            list.forEach(item => {
                                //find song
                                let song = (songs.find(i => {
                                    return i.id === item.id;
                                }));

                                if(song) {
                                    Object.assign(item, pick(song, 'title', 'category', 'author', 'audio', 'url', 'folder'));
                                }
                            });

                            results.push({
                                date: date,
                                liturgy: liturgy,
                                songs: list
                            });
                        });
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
     * listCategories
     *
     * @param songs
     * @returns {Array}
     */
    service.listCategories = (songs) => {
        let categories = {}, category;

        for (let song of songs) {
            category = categories[song.category] || 0;
            categories[song.category] = category + 1;
        }

        return Object.keys(categories).reduce((values, key) => {
            categories[key] > 0 && values.push(key);
            return values;
        }, []);
    };

    /**
     * listAuthors
     *
     * @param songs
     * @returns {Array}
     */
    service.listAuthors = (songs) => {
        let authors = {}, author;

        for (let song of songs) {
            author = authors[song.author] || 0;
            authors[song.author] = author + 1;
        }

        return Object.keys(authors).reduce((values, key) => {
            authors[key] > 1 && values.push(key);
            return values;
        }, []);
    };

    /**
     * sortByLocale
     * @param array
     * @param property
     */
    service.sortByLocale = (array, property) => {
        array && array.sort((v1, v2) => {
            let p1 = typeof v1 === 'object' && property ? v1[property] : v1,
                p2 = typeof v2 === 'object' && property ? v2[property] : v2;
            return p1 && p2 ? p1.localeCompare(p2) : 0;
        });
    };

    /**
     * sortCategories
     * @param array
     */
    service.sortCategories = (array) => {
        service.sortByLocale(array);

        array && array.sort((v1, v2) => {
            let order = service.getCategories().reverse();
            return order.indexOf(v2) - order.indexOf(v1);
        });
    };

    /**
     * getSheet
     *
     * @param sheetId
     *
     * @returns {*}
     */
    let getSheet = (sheetId) => {
        let split = sheetId.split('.'),
            sheet = sheets;

        split.forEach(key => {
            sheet = sheet[key];
        });

        return sheet;
    };

    return service;

}]);
