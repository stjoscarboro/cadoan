app.factory('AirtableLiturgyService', ['$q', '$http', 'AirtableService', ($q, $http, AirtableService) => {

    let service = {},
        config = {
            url: 'https://api.airtable.com/v0/appxZJX1miL5S5RCk',
            key: Base64.decode('a2V5UUxrUm82andCeTdNWmg='),
            tables: {
                years: {
                    fields: [ 'id', 'year', 'date' ]
                },

                liturgies: {
                    fields: [ 'id', 'name', 'year', 'date', 'intention' ]
                }
            }
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
                let records = values.reduce((p, v) => {
                    let r = v.date && p.find(r => { return r.date.getTime() === v.date.getTime(); });
                    r ? (r.intention = v.name) : v.date && p.push(v);
                    return p;
                }, []);

                deferred.resolve(records);
            });

        return deferred.promise;
    };

    return service;

}]);