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
        let folder = getFolder(folderId) || folderId;
        return 'https://drive.google.com/drive/folders/' + folder;
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
        let deferred = $q.defer();

        service.getFolderData(folder)
            .then(
                //success
                (response) => {
                    let folders = response.data.files;

                    // service.sequencelListFolders(folders)
                    service.groupListFolders(folders, 2)
                        .then(results => {
                            deferred.resolve(results);
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
     * sequencelListFolders
     */
    service.sequencelListFolders = (folders) => {
        let results = [],
            promise = $q.when(),
            deferred = $q.defer();

        folders.forEach(folder => {
            promise = promise.then(() => {
                return service.listFiles(folder.id);
            })
                .then(result => {
                    results.push(result);
                });
        });

        promise.then(() => {
            deferred.resolve(results);
        });

        return deferred.promise;
    };

    /**
     * groupListFolders
     */
    service.groupListFolders = (folders, count) => {
        let results = [], groups = [],
            promise = $q.when(),
            deferred = $q.defer();

        for (let i = 0; i < Math.ceil(folders.length / count); i++) {
            let group = [];
            for (let j = 0; j < count; j++) {
                let folder = folders[i * count + j];
                folder && group.push(folders[i * count + j]);
            }
            groups.push(group);
        }

        groups.forEach(group => {
            promise = promise.then(() => {
                return new Promise(resolve => {
                    let promises = [];

                    group.forEach(folder => {
                        promises.push(service.listFiles(folder.id));
                    });

                    Promise.all(promises)
                        .then(values => {
                            values.forEach(value => {
                                results.push(value);
                            });
                            resolve();
                        });
                });
            });
        });

        promise.then(() => {
            deferred.resolve(results);
        });

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
                                    sheets.forEach(file => {
                                        if (file.mimeType === 'audio/mp3' && file.name.indexOf(title) !== -1) {
                                            sheet.audio = service.getOpenURL(file.id);
                                        }
                                    });

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
     * updateFile
     */
    service.updateFile = (id, payload) => {
        let url = driveURL + '/' + id;
        return HttpService.updateData(url, payload);
    };

    /**
     * getFolder
     */
    let getFolder = (folderId) => {
        let split = folderId.split('.'),
            folder = folders;

        split.forEach(key => {
            folder = folder[key];
        });

        return folder;
    };

    return service;

}]);
