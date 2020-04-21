app.factory('FileService', ['$q', 'HttpService', ($q, HttpService) => {

    let docURL = 'https://drive.google.com/file/d/',
        openURL = 'https://drive.google.com/open?id=',
        driveURL = 'https://www.googleapis.com/drive/v3/files',

        folders = {
            cadoan: {
                music: {
                    id: '1lUpluzFLr3t_FN1jvDgAvLfu2e2_vcYB',

                    sheets: {
                        id: '1M7iDcM3nVTZ8nDnij9cSnM8zKI4AhX6p'
                    }
                }
            }
        };

    let service = {};

    /**
     * getFolderURL
     *
     * @param folderId
     * @returns {string}
     */
    service.getFolderURL = (folderId) => {
        let folder = getFolder(folderId) || folderId;
        return 'https://drive.google.com/drive/folders/' + folder;
    };

    /**
     * getPreviewURL
     *
     * @param docId
     * @returns {string}
     */
    service.getPreviewURL = (docId) => {
        return docURL + docId + '/preview';
    };

    /**
     * getOpenURL
     *
     * @param docId
     * @returns {string}
     */
    service.getOpenURL = (docId) => {
        // return openURL + docId;
        return docURL + docId + '/preview';
    };

    /**
     * getFolderData
     *
     * @param folderId
     * @param filters
     * @returns {*}
     */
    service.getFiles = (folderId, filters) => {
        let deferred = $q.defer(),
            query = 'q="' + folderId + '"+in+parents',
            params, files = [];

        let loadURL = (url, pageToken) => {
            let deferred = $q.defer();

            HttpService.getFile(url + (pageToken ? '&pageToken=' + pageToken : ''))
                .then(
                    //success
                    response => {
                        files = files.concat(response.data.files);
                        pageToken = response.data['nextPageToken'];

                        if(pageToken) {
                            loadURL(url, pageToken)
                                .then(() => {
                                    deferred.resolve();
                                });
                        } else {
                            deferred.resolve();
                        }
                    },

                    //failure
                    response => {
                        console.log(response.data.error);
                        deferred.reject();
                    }
                );

            return deferred.promise;
        };

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

        loadURL(driveURL + '?' + query + '&fields=files(id,kind,mimeType,name,description),nextPageToken&orderBy=name&pageSize=512')
            .then(() => {
                deferred.resolve(files);
            });

        return deferred.promise;
    };

    /**
     * listFolder
     *
     * @param folder
     * @returns {f}
     */
    service.listFolder = (folder) => {
        let deferred = $q.defer(),
            results = [], promises = [];

        folder = getFolder(folder) || folder;
        service.getFiles(folder.id)
            .then(
                //success
                (folders) => {
                    folders.forEach(folder => {
                        promises.push(
                            $q.resolve(service.listFiles(folder), result => {
                                results.push(result);
                            })
                        );
                    });

                    $q.all(promises)
                        .then(() => {
                            deferred.resolve(results);
                        });
                }
            );

        return deferred.promise;
    };

    /**
     * listFiles
     *
     * @param folder
     * @returns {f}
     */
    service.listFiles = (folder) => {
        let deferred = $q.defer(),
            results = [];

        service.getFiles(folder.id)
            .then(
                //success
                (files) => {
                    let properties;

                    if (files && files.length > 0) {
                        files.forEach(sheet => {
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
                                files.forEach(file => {
                                    if (file.mimeType === 'audio/mp3' && file.name.indexOf(title) !== -1) {
                                        sheet.audio = service.getOpenURL(file.id);
                                    }
                                });

                                sheet.folder = folder.name;
                                sheet.url = service.getOpenURL(sheet.id);
                                results.push(sheet);
                            }
                        });
                    }

                    deferred.resolve(results);
                }
            );

        return deferred.promise;
    };

    /**
     * updateFile
     *
     * @param id
     * @param payload
     * @returns {*}
     */
    service.updateFile = (id, payload) => {
        let url = driveURL + '/' + id;
        return HttpService.updateData(url, payload);
    };

    /**
     * getFolder
     *
     * @param folderId
     * @returns {{cadoan: {sheets: string}}}
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
