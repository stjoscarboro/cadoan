app.factory('FileService', ['$q', 'HttpService', function ($q, HttpService) {

    let docURL = 'https://docs.google.com/document/d/',
        openURL = 'https://drive.google.com/open?id=',
        driveURL = 'https://www.googleapis.com/drive/v3/files';

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
        let query = 'q="' + folderId + '"+in+parents',
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
     * listSongs
     */
    service.listSongs = (folder) => {
        let deferred = $q.defer(),
            promises = [];

        service.getFolderData(folder)
            .then(response => {
                let folders = response.data.files;

                if (folders) {
                    for (let folder of folders) {
                        promises.push(service.listFolder(folder.id));
                    }
                }

                Promise.all(promises)
                    .then((values) => {
                        deferred.resolve(values);
                    });
            });

        return deferred.promise;
    };

    /**
     * listFolder
     */
    service.listFolder = (folder) => {
        let deferred = $q.defer(),
            songs = [];

        service.getFolderData(folder)
            .then(response => {
                if (response.data.files.length > 0) {
                    let files = response.data.files,
                        properties;

                    if (files && files.length > 0) {
                        files.forEach(song => {
                            if (song.mimeType === 'application/pdf') {
                                try {
                                    properties = JSON.parse(song.description);
                                } catch (e) {
                                    // No-Op
                                } finally {
                                    song = Object.assign(song, properties || {});
                                    song.title = song.title || song.name;
                                    properties = null;
                                }

                                let title = song.name.replace(/(.*)(.pdf)$/, '$1');
                                for (let file of files) {
                                    if (file.mimeType === 'audio/mp3' && file.name.indexOf(title) !== -1) {
                                        song.audio = service.getOpenURL(file.id);
                                    }
                                }

                                song.folder = folder;
                                song.url = service.getOpenURL(song.id);
                                songs.push(song);
                            }
                        });
                    }
                }

                deferred.resolve(songs);
            });

        return deferred.promise;
    };

    return service;

}]);
