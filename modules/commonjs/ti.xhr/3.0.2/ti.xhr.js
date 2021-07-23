// Create the cache manager (a shared object)
var cacheManager = Ti.App.Properties.getObject("cachedXHRDocuments", {});
var storedExtraParams = addDefaultsToOptions({});

XHR = function() {};

// Public functions
// ================

// GET
// @e (object) url is required field. supports onSucces, onError and extraParams. 
XHR.prototype.GET = function(e) {
    // Create some default params
    var onSuccess = e.onSuccess || function() {};
    var onError = e.onError || function() {};
    
    if (e.extraParams) {
        var extraParams = addDefaultsToOptions(e.extraParams);
        Ti.API.info('addDefaults = ' + JSON.stringify(extraParams));
    } else {
        var extraParams = storedExtraParams;
        Ti.API.info('storedExtraParams = ' + JSON.stringify(extraParams));
    }

    var cache = readCache(e.url, e.drawingUid);
    
	// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
	var url = e.url;
	if (url.indexOf('.pdf?') > -1) {
		url = url.split('?')[0];
		if (e.drawingUid) {
			url = url.split(url.substring(url.lastIndexOf('/') + 1)).join(e.drawingUid);
		}
	}
    // Hash the URL
    var hashedURL = Titanium.Utils.md5HexDigest(url);
    // Check if the file exists in the manager
    var cachedFile = cacheManager[hashedURL];

    // If there is nothing cached, no TTL expected, or cachedFile TTL has been exceeded, send the request
    //if(true) {
    
    Ti.API.info('cache = ' + cache);
    Ti.API.info('extraParams = ' + JSON.stringify(extraParams));
    if (cache === false || !extraParams.ttl || extraParams.forceRefresh || (cachedFile.timestamp < new Date().getTime() && Ti.Network.online)) {

        var xhr = initXHRRequest('GET', e.url, extraParams);

        // When the connection was successful
        xhr.onload = function() {
            var result = handleSuccess(xhr, extraParams);
            onSuccess(result);

            // only cache if there is a ttl
            if (extraParams.ttl) {
                writeCache(result.data, e.url, extraParams.ttl, e.responseType, e.drawingUid);
            }
        };

        // When there was an error
        xhr.onerror = function(err) {
            onError(handleError(xhr, err));
        };

        xhr.send();

    } else {
        var result = {};
        result.result = "cache";
        result.status = 304;
        // not modified
        result.data = cache;

        onSuccess(result);
    }
};

// POST requests
// @e (object) url & data are required, supports onSuccess, onError and extraParams
XHR.prototype.POST = function(e) {

    // Create some default params
    var onSuccess = e.onSuccess || function() {};
    var onError = e.onError || function() {};

    if (e.extraParams) {
        var extraParams = addDefaultsToOptions(e.extraParams);
    } else {
        var extraParams = storedExtraParams;
    }

    var xhr = initXHRRequest('POST', e.url, extraParams);

    // When the connection was successful
    xhr.onload = function() {
        onSuccess(handleSuccess(xhr, extraParams));
    };

    // When there was an error
    xhr.onerror = function(err) {
        // Check the status of this
        onError(handleError(xhr, err));
    };

	if (Ti.Network.online) {
		xhr.send(extraParams.parseJSON ? JSON.stringify(e.data) : e.data);
	} else {
		setTimeout(function() {
			XHR.prototype.POST(e);
		}, global.postRetryDelay * 60 * 1000);
	}
};

// PUT requests
// @e (object) url & data are required, supports onSuccess, onError and extraParams
XHR.prototype.PUT = function(e) {

    // Create some default params
    var onSuccess = e.onSuccess || function() {};
    var onError = e.onError || function() {};

    if (e.extraParams) {
        var extraParams = addDefaultsToOptions(e.extraParams);
    } else {
        var extraParams = storedExtraParams;
    }

    var xhr = initXHRRequest('PUT', e.url, extraParams);

    // When the connection was successful
    xhr.onload = function() {
        onSuccess(handleSuccess(xhr, extraParams));
    };

    // When there was an error
    xhr.onerror = function(err) {
        // Check the status of this
        onError(handleError(xhr, err));
    };

	if (Ti.Network.online) {
	    xhr.send(extraParams.parseJSON ? JSON.stringify(e.data) : e.data);
	} else {
		setTimeout(function() {
			XHR.prototype.PUT(e);
		}, global.postRetryDelay * 60 * 1000);
	}
};

// PATCH requests
// @e (object) url & data are required, supports onSuccess, onError and extraParams
XHR.prototype.PATCH = function(e) {

    // Create some default params
    var onSuccess = e.onSuccess || function() {};
    var onError = e.onError || function() {};

    if (e.extraParams) {
        var extraParams = addDefaultsToOptions(e.extraParams);
    } else {
        var extraParams = storedExtraParams;
    }

    var xhr = initXHRRequest('PATCH', e.url, extraParams);

    // When the connection was successful
    xhr.onload = function() {
        onSuccess(handleSuccess(xhr, extraParams));
    };

    // When there was an error
    xhr.onerror = function(err) {
        // Check the status of this
        onError(handleError(xhr, err));
    };

	if (Ti.Network.online) {
    	xhr.send(extraParams.parseJSON ? JSON.stringify(e.data) : e.data);
	} else {
		setTimeout(function() {
			XHR.prototype.PATCH(e);
		}, global.postRetryDelay * 60 * 1000);
	}
};

// @e (object) url is required, supports onSuccess, onError and extraParams
XHR.prototype.DELETE = function(e) {

    // Create some default params
    var onSuccess = e.onSuccess || function() {};
    var onError = e.onError || function() {};

    if (extraParams) {
        var extraParams = addDefaultsToOptions(extraParams);
    } else {
        var extraParams = storedExtraParams;
    }

    var xhr = initXHRRequest('DELETE', e.url, extraParams);

    // When the connection was successful
    xhr.onload = function() {
        onSuccess(handleSuccess(xhr, extraParams));
    };

    // When there was an error
    xhr.onerror = function(err) {
        // Check the status of this
        onError(handleError(xhr, err));
    };

	if (Ti.Network.online) {
    	xhr.send();
	} else {
		setTimeout(function() {
			XHR.prototype.DELETE(e);
		}, global.postRetryDelay * 60 * 1000);
	}
};

// Helper functions
// =================

// Removes the cached content of a given URL (this is useful if you are not satisfied with the data returned that time)
XHR.prototype.clear = function(url, drawingUid) {

    if (url) {
		// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
		if (url.indexOf('.pdf?') > -1) {
			url = url.split('?')[0];
			if (drawingUid) {
				url = url.split(url.substring(url.lastIndexOf('/') + 1)).join(drawingUid);
			}
		}
        // Hash the URL
        var hashedURL = Titanium.Utils.md5HexDigest(url);
        // Check if the file exists in the manager
        var cache = cacheManager[hashedURL];

        // If the file was found
        if (cache) {
            // Delete references and file
            var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
            // Delete the record and file
            delete cacheManager[hashedURL];
            file.deleteFile();

            // Update the cache manager
            updateCacheManager();
        }
    }

};

// Removes all the expired documents from the manager and the file system
XHR.prototype.clean = function() {

    var nowInMilliseconds = new Date().getTime();
    var expiredDocuments = 0;

    for (var key in cacheManager) {
        var cache = cacheManager[key];

        if (cache.timestamp <= nowInMilliseconds) {
            // Delete references and file
            var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, key);
            // Delete the record and file
            delete cacheManager[key];
            file.deleteFile();

            // Update the cache manager
            updateCacheManager();

            // Update the deleted documents count
            expiredDocuments = expiredDocuments + 1;
        }

    }

    // Return the number of files deleted
    return expiredDocuments;
};

// Removes all documents from the manager and the file system
XHR.prototype.purge = function(progressBar, updateCallback) {
    var purgedDocuments = 0;

	// convert object to key's array
	Object.keys(cacheManager).forEach(function(key) {
	//for (var key of Object.keys(cacheManager)) {
    //for (var key in cacheManager) {
        var cache = cacheManager[key];
        // Delete references and file
        var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, key);
        // Delete the record and file
        delete cacheManager[key];
        file.deleteFile();

        // Update the cache manager
        updateCacheManager();

        // Update the deleted documents count
        purgedDocuments = purgedDocuments + 1;
    });

    // Return the number of files deleted
    return purgedDocuments;
};

XHR.prototype.setStaticOptions = function(params) {
    var params = addDefaultsToOptions(params);
    Ti.App.Properties.setObject("extraXHRParams", params);
    storedExtraParams = params;

};

// Private Helper Functions
// ========================
function addDefaultsToOptions(providedParams) {
    var extraParams = providedParams || {};
    extraParams.async = (extraParams.hasOwnProperty('async')) ? extraParams.async : true;
    extraParams.ttl = (extraParams.hasOwnProperty('ttl')) ? extraParams.ttl : false;
    //extraParams.forceRefresh = (extraParams.hasOwnProperty('forceRefresh')) ? extraParams.forceRefresh : false;
    extraParams.shouldAuthenticate = extraParams.shouldAuthenticate || false;
    extraParams.contentType = (extraParams.hasOwnProperty('contentType')) ? extraParams.contentType : "application/json";
    extraParams.responseType = (extraParams.hasOwnProperty('responseType')) ? extraParams.responseType : "json";
    extraParams.parseJSON = (extraParams.hasOwnProperty('parseJSON')) ? extraParams.parseJSON : false;
    extraParams.returnXML = (extraParams.hasOwnProperty('returnXML')) ? extraParams.returnXML : false;
    extraParams.debug = (extraParams.hasOwnProperty('debug')) ? extraParams.debug : false;
    extraParams.requestHeaders = providedParams.requestHeaders || [];
    return extraParams;
}

// Return a standardized response
function handleSuccess(xhr, extraParams) {
    var result = {};
    result.result = "success";
    result.status = xhr.status;

    /**
     * Check if the response is XML, if not try to parse JSON (if that was requested)
     * As a final catch, when that fails too, return the data that was received;
     * xhr.responseXML is null by default unless the response actually is XML
     */
    try {
        if (extraParams.returnXML && xhr.responseXML) {
            result.data = xhr.responseXML;
        	Ti.API.info('*************** XML **************');
        } else {
        	if (extraParams.responseType == 'blob') {
        		Ti.API.info('*************** BLOB **************');
        		result.data = xhr.responseData;
        	} else {
            	result.data = extraParams.parseJSON ? JSON.parse(xhr.responseText) : xhr.responseText;
            	// result.metaData = extraParams.parseJSON ? JSON.parse(xhr.metaData) : xhr.metaData;
            	Ti.API.info('*************** JSON/responseText **************');
           }
        }
    } catch(e) {
        result.data = xhr.responseData;
        // result.metaData = xhr.metaData;
        Ti.API.info('*************** responseData Catch **************');
    }
	//Ti.API.info('*************** result.data **************\n' + JSON.stringify(result));
    return result;
}

// Return a standardized response
function handleError(xhr, error) {
    var result = {};
    result.result = "error";
    result.status = xhr.status;
    result.error = error.error;
    Ti.API.info('xhr.status = ' + xhr.status);
    
    // TODO:  return readCache(url) if available and 429.
    if (result.status == 429 && global.show429Error) {
    	result.status = 304;
    	result.error = global.konstruction.platform + " rate limit exceeded.  Please wait a short while before trying again.";
    	result.result = "success";
    	result.data = {text: readCache(xhr.url, xhr.drawingUid)};
	    Alloy.Globals.loading.hide();
	    return result;
    }
   
    // Parse error result body
    try {
        if (extraParams.returnXML && xhr.responseXML) {
            result.data = xhr.responseXML;
        } else {
            result.data = extraParams.parseJSON ? JSON.parse(xhr.responseText) : xhr.responseText;
        }
    } catch(e) {
        result.data = xhr.responseData;
    }
    Ti.API.info('****** error result ******\n' + JSON.stringify(result) + '\n******************');
    Alloy.Globals.loading.hide();
    return result;
}

function initXHRRequest(method, url, extraParams) {
    // Create the HTTP connection
    var xhr = Titanium.Network.createHTTPClient({
        enableKeepAlive : false,
        timeout: global.xhrTimeout * 1000, // milliseconds
        ontimeout: function (e) {
        	Ti.API.info('xhr timeout status = ' + xhr.status);
        }
    });

    // Open the HTTP connection
    xhr.open(method, url, extraParams.async);
    xhr.setRequestHeader('Content-Type', extraParams.contentType);

    // add extra provided request headers
    if (extraParams.requestHeaders && extraParams.requestHeaders.length > 0){
        for (var i = 0; i < extraParams.requestHeaders.length; i++) {
            xhr.setRequestHeader(extraParams.requestHeaders[i].key, extraParams.requestHeaders[i].value);
        }
    }

    if (extraParams.debug) {
        Ti.API.info(method + ': ' + url);
    }

    // If we need to authenticate
    if (extraParams.shouldAuthenticate) {
        if (extraParams.oAuthToken) {
            var authstr = 'Bearer ' + extraParams.oAuthToken;
        } else {
            var authstr = 'Basic ' + Titanium.Utils.base64encode(extraParams.username + ':' + extraParams.password);
        }
        xhr.setRequestHeader('Authorization', authstr);
    }
    return xhr;
}

// Private functions
// =================
function readCache(url, drawingUid) {
	cacheManager = Ti.App.Properties.getObject("cachedXHRDocuments", {});
	if (url) {
		// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
		if (url.indexOf('.pdf?') > -1) {
			url = url.split('?')[0];
			if (drawingUid) {
				url = url.split(url.substring(url.lastIndexOf('/') + 1)).join(drawingUid);
			}
		}
	    // Hash the URL
	    var hashedURL = Titanium.Utils.md5HexDigest(url);
	
	    // Check if the file exists in the manager
	    var cache = cacheManager[hashedURL];
	    // Default the return value to false
	    var result = false;
	
	    //Titanium.API.info("CHECKING CACHE");
	
	    // If the file was found
	    if (cache) {
	        // Fetch a reference to the cache file
	        var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
	
	        // Check that the TTL is further than the current date
	        // if (cache.timestamp >= new Date().getTime()) {
	            //Titanium.API.info("CACHE FOUND");
			if (!file.exists()) {
				Ti.API.info('Cache file not found!');
			}
	
	            // Return the content of the file
	            result = file.read();
	            // Return if found regardless of TTL and let GET decide whether or not to return it or get new based on TTL. *** DFM ***
	
	/*
	        } else {
	            //Titanium.API.info("OLD CACHE");
	
	            // Delete the record and file
	            delete cacheManager[hashedURL];
	            file.deleteFile();
	
	            // Update the cache manager
	            updateCacheManager();
	        }
	*/
	    } else {
	        //Titanium.API.info("CACHE " + hashedURL + " NOT FOUND");
	    }
	
	    return result;
    }
};

function updateCacheManager() {
    Titanium.App.Properties.setObject("cachedXHRDocuments", cacheManager);
};

function writeCache(data, url, ttl, type, drawingUid) {

    //Titanium.API.info("WRITING CACHE");

	// TODO:  Change how hashdURL is stored for PDF/Blob resources so changing timestamp query strings don't cause multiple copies
	//        in storage, eating up space unnecessarily.
    // hash the url
	// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
	if (url.indexOf('.pdf?') > -1) {
		url = url.split('?')[0];
		if (drawingUid) {
			url = url.split(url.substring(url.lastIndexOf('/') + 1)).join(drawingUid);
		}
	}
    var hashedURL = Titanium.Utils.md5HexDigest(url);

    // Write the file to the disk
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);

	if (type == 'blob') {
		//data = data.toBlob();
		Ti.API.info('*************** Writing Cache file ' + hashedURL + '***************');
	}
    // Write the file to the disk
    // TODO: There appears to be a bug in Titanium and makes the method
    // below always return false when dealing with binary files
    file.write(data);
    
	if (!file.exists()) {
		Ti.API.info('Cache file not saved!');
	}
    // Insert the cached object in the cache manager
    cacheManager[hashedURL] = {
        "timestamp" : (new Date().getTime()) + (ttl * 60 * 1000)
    };
    updateCacheManager();

    //Titanium.API.info("WROTE CACHE");
};

// Return everything
module.exports = XHR; 
