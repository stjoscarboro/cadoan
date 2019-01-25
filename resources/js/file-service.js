app.factory('FileService', ['$q', 'HttpService', ($q, HttpService) => {

    let docURL = 'https://docs.google.com/document/d/',
        openURL = 'https://drive.google.com/open?id=',
        driveURL = 'https://www.googleapis.com/drive/v3/files',

        folders = {
            cadoan: {
                sheets: '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p'
            }
        };

    let service = {};

    /**
     * getFolderURL
     */
    service.getFolderURL = (folderId) => {
        return 'https://drive.google.com/drive/folders/' + folderId;
    };

    /**
     * getPreviewURL
     */
    service.getPreviewURL = (docId) => {
        return docURL + docId + '/preview';
    };

    /**
     * getOpenURL
     */
    service.getOpenURL = (docId) => {
        return openURL + docId;
    };

    /**
     * getFolderData
     */
    service.getFolderData = (folderId, filters) => {
        let folder = getFolder(folderId) || folderId,
            query = 'q="' + folder + '"+in+parents',
            params;

        if (filters) {
            Object.keys(filters).forEach(filter => {
                switch (filter) {
                    case 'properties':
                        params = filters[filter];
                        Object.keys(params).forEach(key => {
                            query += '+and+properties+has+{key="' + key + '"+and+value="' + params[key] + '"}';
                        });
                        break;
                }
            });
        }

        let url = driveURL + '?' + query + '&fields=files(id,kind,mimeType,name,description)&orderBy=name';
        return HttpService.getFile(url);
    };

    /**
     * listFolder
     */
    service.listFolder = (folder) => {
        let deferred = $q.defer(),
            promises = [];

        service.getFolderData(folder)
            .then(
                //success
                (response) => {
                    let folders = response.data.files;

                    if (folders) {
                        for (let folder of folders) {
                            promises.push(service.listFiles(folder.id));
                        }
                    }

                    Promise.all(promises)
                        .then((values) => {
                            deferred.resolve(values);
                        });
                },

                //failure
                (response) => {
                    console.log(response.data.error);
                }
            );

        return deferred.promise;
    };

    /**
     * listFiles
     */
    service.listFiles = (folder) => {
        let deferred = $q.defer(),
            results = [];

        service.getFolderData(folder)
            .then(
                //success
                (response) => {
                    if (response.data.files.length > 0) {
                        let sheets = response.data.files,
                            properties;

                        if (sheets && sheets.length > 0) {
                            sheets.forEach(sheet => {
                                if (sheet.mimeType === 'application/pdf') {
                                    try {
                                        properties = JSON.parse(sheet.description);
                                    } catch (e) {
                                        // No-Op
                                    } finally {
                                        sheet = Object.assign(sheet, properties || {});
                                        sheet.title = sheet.title || sheet.name;
                                        properties = null;
                                    }

                                    let title = sheet.name.replace(/(.*)(.pdf)$/, '$1');
                                    for (let file of sheets) {
                                        if (file.mimeType === 'audio/mp3' && file.name.indexOf(title) !== -1) {
                                            sheet.audio = service.getOpenURL(file.id);
                                        }
                                    }

                                    sheet.folder = folder;
                                    sheet.url = service.getOpenURL(sheet.id);
                                    results.push(sheet);
                                }
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
     * getFolder
     *
     * @param folderId
     *
     * @returns {*}
     */
    let getFolder = (folderId) => {
        let split = folderId.split('.'),
            folder = folders;

        for (let key of split) {
            folder = folder[key];
        }

        return folder;
    };

    return service;

}]);
