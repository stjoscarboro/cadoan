app.factory('AirtableService', ['$q', '$http', 'AppUtil', ($q, $http, AppUtil) => {

    let service = {},
        tableURL = 'https://api.airtable.com/v0/appct8Cpvuk7NtKiQ',
        apiKey = Base64.decode('a2V5UUxrUm82andCeTdNWmg='),

        tables = {
            singers: {
                fields: [ 'id', 'name' ]
            },

            liturgies: {
                fields: [ 'id', 'name', 'year', 'date', 'intention' ]
            },

            schedules: {
                fields: [ 'id', 'date', 'liturgy', 'songs' ]
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

        service.getData('singers')
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

        service.getData('liturgies')
            .then(records => {
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

        service.getData('schedules')
            .then(records => {
                records.forEach(record => {
                    let list = JSON.parse(record.songs);

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

        return service.createData('schedules', data);
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

        return service.updateData('schedules', refId, data);
    };

    /**
     * deleteSchedule
     *
     * @param refId
     *
     * @returns {*|void}
     */
    service.deleteSchedule = (refId) => {
        return service.deleteData('schedules', refId);
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

    /**
     * parseDate
     *
     * @param value
     *
     * @returns {Date}
     */
    let parseDate = (value) => {
        let date = new Date(Date.parse(value));

        date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        return date;
    };

    /**
     * getData
     *
     * @param table
     *
     * @return {*}
     */
    service.getData = (table) => {
        let deferred = $q.defer(),
            url = `${tableURL}/${table}?api_key=${apiKey}`,
            records = [];

        let loadURL = (url, offset) => {
            let deferred = $q.defer();

            $http({
                url: url + (offset ? `&offset=${ offset }` : ''),
                method: 'GET'
            })
                .then(
                    //success
                    response => {
                        //process records
                        (response.data['records'] || []).forEach(record => {
                            let value = {refId: record.id};

                            tables[table].fields.forEach(field => {
                                switch(true) {
                                    case field === 'date':
                                        value[field] = parseDate(record.fields[field]);
                                        break;

                                    case Array.isArray(record.fields[field]):
                                        value[field] = record.fields[field][0];
                                        break;

                                    default:
                                        value[field] = `${record.fields[field]}`;
                                }
                            });

                            records.push(value);
                        });

                        //process next page
                        if (response.data['offset']) {
                            loadURL(url, response.data['offset'])
                                .then(() => {
                                    deferred.resolve();
                                });
                        } else {
                            deferred.resolve();
                        }
                    },

                    //failure
                    (response) => {
                        deferred.reject(response.error);
                    }
                );

            return deferred.promise;
        };

        loadURL(url)
            .then(
                //success
                () => {
                    records.sort((r1, r2) => { return parseInt(r1.id) - parseInt(r2.id); });
                    deferred.resolve(records);
                },

                //failure
                (error) => {
                    console.log(error);
                }
            );

        return deferred.promise;
    };

    /**
     * createData
     *
     * @param table
     * @param data
     *
     * @returns {*|void}
     */
    service.createData = (table, data) => {
        let deferred = $q.defer();

        $http({
            url: `${tableURL}/${table}?api_key=${apiKey}`,
            method: 'POST',
            data: data
        })
            .then(
                //success
                () => {
                    deferred.resolve();
                },

                //failure
                (response) => {
                    console.log(`Error: ${response.error}`);
                }
            );

        return deferred.promise;
    };

    /**
     * updateData
     *
     * @param table
     * @param refId
     * @param data
     *
     * @returns {*|void}
     */
    service.updateData = (table, refId, data) => {
        let deferred = $q.defer();

        $http({
            url: `${tableURL}/${table}/${refId}?api_key=${apiKey}`,
            method: 'PUT',
            data: data
        })
            .then(
                //success
                () => {
                    deferred.resolve();
                },

                //failure
                (response) => {
                    console.log(`Error: ${response.error}`);
                }
            );

        return deferred.promise;
    };

    /**
     * deleteData
     *
     * @param table
     * @param refId
     *
     * @returns {*|void}
     */
    service.deleteData = (table, refId) => {
        let deferred = $q.defer();

        $http({
            url: `${tableURL}/${table}/${refId}?api_key=${apiKey}`,
            method: 'DELETE'
        })
            .then(
                //success
                () => {
                    deferred.resolve();
                },

                //failure
                (response) => {
                    console.log(`Error: ${response.error}`);
                }
            );

        return deferred.promise;
    };

    return service;

}]);