app.factory("FileService", function($http) {
	let fileURL = 'https://www.googleapis.com/drive/v3/files';
	
	function FileService(scope) {
		
		this.listYears = function() {
			let url = fileURL + '?q="139ho75h2sTOC4EuwXU_AHJP_vnhh7Pwl"+in+parents&orderBy=name&key=' + scope.apiKey;
			
			$http.get(url)
				.then(response => {
					scope.years = response.data.files;
				});
		}
		
		this.listReadings = function(year) {
			let url = fileURL + '?q="' + year.id + '"+in+parents&orderBy=name&key=' + scope.apiKey;
			
			$http.get(url)
				.then(response => {
					let folders = response.data.files;
					
					if(folders) {
						for(let [index, folder] of folders.entries()) {
							let url = fileURL + '?q="' + folder.id + '"+in+parents&orderBy=name&key=' + scope.apiKey;
							
							$http.get(url)
								.then(response => {
									scope.readings[index] = response.data.files;
								});
						}
					}
				});
		}
		
	}
	
	return FileService;
});