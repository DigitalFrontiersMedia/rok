// 
//  konstruction.js
//  ROK
//  
//  Created by S.Barker on 2021-03-22.
//  Copyright 2021 S.Barker. All rights reserved.
// 

Konstruction = function() {};
var nonce;
 
// Public functions
// ================

Konstruction.prototype.setPlatform = function(platform) {
    this.platform = platform;
    switch (platform) {
    	case 'PlanGrid':
    	default:
    		this.apiURL = 'https://io.plangrid.com/';
    		Ti.API.info('apiURL set as: ' + this.apiURL);
    		break;
    }
};

Konstruction.prototype.apiURL = function() {
    return this.apiURL;
};

Konstruction.prototype.platform = function() {
    return this.platform;
};

Konstruction.prototype.getProjects = function(onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getProjects, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects';
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfis = function(onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getRfis, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis';
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getUserInfo = function(user, onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function(results) { return results; };
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getUserInfo, user, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/users/' + user.uid;
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiPhotos = function(rfiUid, onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getRfiPhotos, rfiUid, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/photos';
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiDocuments = function(rfiUid, onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getRfiDocuments, rfiUid, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/attachments';
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiSnapshots = function(rfiUid, onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getRfiSnapshots, rfiUid, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/snapshots';
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiHistoryEvents = function(rfiUid, onSuccessCallback) {
    // Create some default params
    var self = this;
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getRfiHistoryEvents, rfiUid, onSuccessCallback);
	       }
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/history';
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

// Returns everything. 
module.exports = Konstruction;
