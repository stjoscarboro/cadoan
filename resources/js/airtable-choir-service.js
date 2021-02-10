app.factory('AirtableChoirService', ['$q', '$http', 'AirtableService', 'AppUtil', ($q, $http, AirtableService, AppUtil) => {

    let service = {},
        config = {
            url: 'https://api.airtable.com/v0/appct8Cpvuk7NtKiQ',
            key: Base64.decode('a2V5UUxrUm82andCeTdNWmg='),
            tables: {
                singers: {
                    fields: [ 'id', 'name' ]
                },

                years: {
                    fields: [ 'id', 'year', 'date' ]
                },

                liturgies: {
                    fields: [ 'id', 'name', 'year', 'date', 'intention' ]
                },

                schedules: {
                    fields: [ 'id', 'date', 'liturgy', 'songs' ]
                }
            }
        };

    /**
     * getCategories
     *
     * @returns {string[]}
     */
    service.getCategories = () => {
        return [ 'Nhập Lễ', 'Đáp Ca', 'Dâng Lễ', 'Hiệp Lễ', 'Kết Lễ' ];
    };

    /**
     * loadSingers
     *
     * @returns {f}
     */
    service.loadSingers = () => {
        let deferred = $q.defer();

        AirtableService.getData('singers', config)
            .then(records => {
                deferred.resolve(records);
            });

        return deferred.promise;
    };

    /**
     * loadYears
     *
     * @returns {f}
     */
    service.loadYears = () => {
        let deferred = $q.defer();

        AirtableService.getData('years', config)
            .then(records => {
                deferred.resolve(records);
            });

        return deferred.promise;
    };

    /**
     * loadLiturgies
     *
     * @returns {f}
     */
    service.loadLiturgies = () => {
        let deferred = $q.defer();

        AirtableService.getData('liturgies', config)
            .then(values => {
                let records = [];

                values.forEach(value => {
                    let record = records.find(record => { return record.date.getTime() === value.date.getTime(); });
                    if(record) {
                        record.intention = value.name;
                    } else {
                        value.date && records.push(value);
                    }
                });

                deferred.resolve(records);
            });

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

        AirtableService.getData('schedules', config)
            .then(records => {
                records.forEach(record => {
                    let list = JSON.parse(record.songs);

                    //populate songs
                    list.forEach(item => {
                        //find song
                        let song = (songs.find(i => {
                            return i.id === item.id;
                        }));

                        if(song) {
                            Object.assign(item, AppUtil.pick(song, 'title', 'category', 'author', 'audio', 'url', 'folder'));
                        }
                    });

                    results.push({
                        id: record.id,
                        refId: record.refId,
                        date: record.date,
                        liturgy: JSON.parse(record.liturgy),
                        songs: list
                    });
                });

                results.sort((r1, r2) => { return r1.date - r2.date; });
                deferred.resolve(results);
            });

        return deferred.promise;
    };

    /**
     * createData
     *
     * @param payload
     *
     * @returns {*|void}
     */
    service.createSchedule = (payload) => {
        let data = {
                fields: payload
            };

        return AirtableService.createData('schedules', data, config);
    };

    /**
     * updateSchedule
     *
     * @param refId
     * @param payload
     *
     * @returns {*|void}
     */
    service.updateSchedule = (refId, payload) => {
        let data = {
                fields: payload
            };

        return AirtableService.updateData('schedules', refId, data, config);
    };

    /**
     * deleteSchedule
     *
     * @param refId
     *
     * @returns {*|void}
     */
    service.deleteSchedule = (refId) => {
        return AirtableService.deleteData('schedules', refId, config);
    };

    /**
     * listCategories
     *
     * @param songs
     *
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
     *
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

    return service;

}]);