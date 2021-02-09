app.factory('AirtableFilesService', [
    '$q', '$http', 'AirtableService', 'DriveService', 'AppUtil',
    ($q, $http, AirtableService, DriveService, AppUtil) => {

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

        $q.all([
            AirtableService.getData('files', config),
            DriveService.listFolder('cadoan.music')
        ])
            .then(data => {
                let records = data[0],
                    files = data[1][0],
                    removes = [];

                //check added files
                files.forEach(file => {
                    let record = records.find(record => { return record.id === file.id; });

                    if(!record) {
                        records.push(AppUtil.pick(file, 'id', 'title', 'category', 'author', 'others', 'audio'));
                    } else {
                        Object.assign(record, AppUtil.pick(file, 'audio'));
                    }
                });

                //check removed files
                records.forEach(record => {
                    record.url = `${DriveService.getViewURL(record.id)}`;

                    if(!files.find(file => { return file.id === record.id; })) {
                        removes.push(record.refId);
                    }
                });

                removes.length > 0 && console.log(`removes: ${removes}`);
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