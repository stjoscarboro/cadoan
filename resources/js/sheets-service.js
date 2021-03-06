app.factory('SheetsService', ['$q', 'GoogleService', 'AppUtil', ($q, GoogleService, AppUtil) => {

    let sheetURL = 'https://sheets.googleapis.com/v4/spreadsheets/',

        sheets = {
            liturgies: {
                years: {
                    id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
                    range: 'Years!A:C', // [id, name, from]
                },

                1: {
                    id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
                    range: 'A!A:E', // [id, name, year, date, intention]
                },

                2: {
                    id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
                    range: 'B!A:E', // [id, name, year, date, intention]
                },

                3: {
                    id: '1iax4O8R0IiZd9N77bK9XNRDllG40ZUJL7wiGCZocUak',
                    range: 'C!A:E', // [id, name, year, date, intention]
                }
            },

            cadoan: {
                schedules: {
                    id: '1wJc-PNIW73HSGuYus5JBZw9IMr1fZ3J74GXm-e5b-8A',
                    range: 'A:C' // [date, liturgy, songs]
                },

                singers: {
                    id: '1UUNHdYv2V4JZ492eiQUCaujSMy2zti1aLblefL36yjs',
                    range: 'A:B' // [id, name]
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

        return GoogleService.getData(url, params);
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

        return GoogleService.postData(url, payload, params);
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

        return GoogleService.postData(url, payload, params);
    };

    /**
     * loadYears
     *
     * @returns {f}
     */
    service.loadYears = () => {
        let deferred = $q.defer(),
            results = [];

        service.getSheetData('liturgies.years')
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
                                    start: parseDate(value[2])
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
     * loadLiturgies
     *
     * @returns {f}
     */
    service.loadLiturgies = () => {
        let results = [],
            deferred = $q.defer(),
            promises = [];

        //iterate through years to get all liturgies
        for (let i = 1; i <= 3; i++) {
            promises.push(
                $q.resolve(service.getSheetData('liturgies.' + i), response => {
                    let values = response.data.values;

                    if (values) {
                        values.forEach(value => {
                            if (value[3]) {
                                results.push({
                                    id: value[0],
                                    name: value[1],
                                    year: value[2],
                                    date: parseDate(value[3]),
                                    intention: value[4]
                                });
                            }
                        });
                    }
                })
            );
        }

        $q.all(promises)
            .then(() => {
                deferred.resolve(results);
            });

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
                                results.push({
                                    id: value[0],
                                    name: value[1]
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
                    let values = response.data.values;

                    if (values) {
                        values.forEach(value => {
                            let date = parseDate(value[0]),
                                liturgy = JSON.parse(value[1]),
                                list = JSON.parse(value[2]);

                            //populate songs
                            list.forEach(item => {
                                //find song
                                let song = (songs.find(i => {
                                    return i.id === item.id;
                                }));
                                if (song) {
                                    Object.assign(item, AppUtil.pick(song, 'title', 'category', 'author', 'audio', 'url', 'folder'));
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
     * addSchedule
     *
     * @param payload
     * @returns {*|void}
     */
    service.addSchedule = (payload) => {
        return service.appendSheetData('cadoan.schedules', payload, {
            valueInputOption: "USER_ENTERED"
        });
    };

    /**
     * updateSchedule
     *
     * @param payload
     * @returns {*|void}
     */
    service.updateSchedule = (payload) => {
        return service.updateSheetData('cadoan.schedules', payload);
    };

    /**
     * listCategories
     *
     * @param songs
     * @returns {Array}
     */
    service.listCategories = (songs) => {
        let categories = songs.reduce((count, song) => {
            count[song.category] = (count[song.category] || 0) + 1;
            return count;
        }, {});

        categories = Object.keys(categories).reduce((values, key) => {
            categories[key] > 0 && values.push(key);
            return values;
        }, []);

        service.sortCategories(categories);
        return categories;
    };

    /**
     * listAuthors
     *
     * @param songs
     * @returns {Array}
     */
    service.listAuthors = (songs) => {
        let authors = songs.reduce((count, song) => {
            count[song.author] = (count[song.author] || 0) + 1;
            return count;
        }, {});

        authors = Object.keys(authors).reduce((values, key) => {
            authors[key] > 0 && values.push(key);
            return values;
        }, []);

        service.sortByLocale(authors, 'name');
        return authors;
    };

    /**
     * sortByLocale
     *
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
     *
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

    /**
     * parseDate
     *
     * @param value
     * @returns {Date}
     */
    let parseDate = (value) => {
        let date = new Date(Date.parse(value));

        date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        return date;
    };

    return service;

}]);
