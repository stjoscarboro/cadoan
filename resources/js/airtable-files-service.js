app.factory('AirtableFilesService', ['$q', '$http', 'AirtableService', 'DriveService', ($q, $http, AirtableService, DriveService) => {

    let service = {},
        config = {
            url: 'https://api.airtable.com/v0/appVE982OoHuubrWS',
            key: Base64.decode('a2V5UUxrUm82andCeTdNWmg='),
            tables: {
                files: {
                    fields: [ 'id', 'title', 'author', 'category', 'others' ]
                }
            }
        };

    /**
     * getDriveURL
     *
     * @return {string}
     */
    service.getDriveURL = () => {
        return DriveService.getFolderURL('cadoan.music.sheets.id');
    };

    /**
     * loadFiles
     *
     * @return {f}
     */
    service.loadFiles = () => {
        let deferred = $q.defer();

        AirtableService.getData('files', config)
            .then(records => {
                records.forEach(record => {
                    record.url = `${DriveService.getViewURL(record.id)}`;
                });

                deferred.resolve(records);
            });

        return deferred.promise;
    };

    /**
     * createFile
     *
     * @param payload
     *
     * @return {*|void}
     */
    service.createFile = (payload) => {
        let data = {
            fields: payload
        };

        return AirtableService.createData('files', data, config);
    };

    /**
     * updateFile
     *
     * @param refId
     * @param payload
     *
     * @return {*|void}
     */
    service.updateFile = (refId, payload) => {
        let data = {
            fields: payload
        };

        return AirtableService.updateData('files', refId, data, config);
    };

    /**
     * deleteFile
     *
     * @param refId
     *
     * @return {*|void}
     */
    service.deleteFile = (refId) => {
        return AirtableService.deleteData('files', refId, config);
    };

    return service;

}]);