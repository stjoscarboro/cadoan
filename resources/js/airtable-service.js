app.factory('AirtableService', ['$q', '$http', 'DelayHttp', ($q, $http, DelayHttp) => {

    let service = {};

    /**
     * getData
     *
     * @param table
     * @param config
     *
     * @return {*}
     */
    service.getData = (table, config) => {
        let deferred = $q.defer(),
            url = `${config.url}/${table}?api_key=${config.key}`,
            records = [];

        let loadURL = (url, offset) => {
            let deferred = $q.defer();

            DelayHttp({
                url: url + (offset ? `&offset=${ offset }` : ''),
                method: 'GET'
            }).then(
                    //success
                    response => {
                        //process records
                        (response.data['records'] || []).forEach(record => {
                            let value = {refId: record.id};

                            config.tables[table].fields.forEach(field => {
                                switch(true) {
                                    case field === 'date':
                                        value[field] = parseDate(record.fields[field]);
                                        break;

                                    case Array.isArray(record.fields[field]):
                                        value[field] = record.fields[field][0];
                                        break;

                                    default:
                                        value[field] = record.fields[field] ? `${record.fields[field]}` : '';
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
     * @param config
     *
     * @returns {*|void}
     */
    service.createData = (table, data, config) => {
        let deferred = $q.defer();

        $http({
            url: `${config.url}/${table}?api_key=${config.key}`,
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
     * @param config
     *
     * @returns {*|void}
     */
    service.updateData = (table, refId, data, config) => {
        let deferred = $q.defer();

        $http({
            url: `${config.url}/${table}/${refId}?api_key=${config.key}`,
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
     * @param config
     *
     * @returns {*|void}
     */
    service.deleteData = (table, refId, config) => {
        let deferred = $q.defer();

        $http({
            url: `${config.url}/${table}/${refId}?api_key=${config.key}`,
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

    return service;

}]);