// 
//  konstruction.js
//  ROK
//  
//  Created by S.Barker on 2021-03-22.
//  Copyright 2021 S.Barker. All rights reserved.
// 

Konstruction = function() {};
var nonce;
var fullReturn = {data:[]};
var self = Konstruction.prototype;

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

Konstruction.prototype.processPagination = function(results, callingFunction, onSuccessCallback, options) {
	Ti.API.info('processPagination results = ' + JSON.stringify(results));
	var reqResult = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	//if (reqResult.data && reqResult.data.length) {
		fullReturn.data = fullReturn.data.concat(reqResult.data);
	    if (fullReturn.data.length < reqResult.total_count) {
	    	callingFunction(onSuccessCallback, options, reqResult.next_page_url);
	    } else {
	    	if (results.status == 200) {
	    		results.data = JSON.stringify(fullReturn);
				//Ti.API.info('Returned results.data.length = ' + JSON.parse(results.data).data.length);
	    	} else {
	    		results.data.text = JSON.stringify(fullReturn);
				//Ti.API.info('Returned results.data.text.length = ' + JSON.parse(results.data.text).data.length);
	    	}
	    	fullReturn = {data:[]};
		    onSuccessCallback(results);
	    }
    // } else {
    	// fullReturn = {data:[]};
	    // onSuccessCallback(results);
    // }
};

Konstruction.prototype.getProjects = function(onSuccessCallback, next_page_url) {
    // Create some default params
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
		        global.oauth.refresh(self.getProjects, onSuccessCallback, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getProjects, onSuccessCallback);
    	},
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfis = function(onSuccessCallback, options, next_page_url) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getRfis, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getRfis, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.createRfi = function(data, onSuccessCallback) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.createRfi, data, onSuccessCallback);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis';
			break;
	}
	global.xhr.POST({
	    url: apiURL + endpoint,
	    data: data,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getUserInfo = function(user, onSuccessCallback) {
    // Create some default params
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
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
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

Konstruction.prototype.getRfiPhotos = function(rfiUid, onSuccessCallback, next_page_url) {
    // Create some default params
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
		        global.oauth.refresh(self.getRfiPhotos, rfiUid, onSuccessCallback, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/photos';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getRfiPhotos, onSuccessCallback);
    	},
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiDocuments = function(rfiUid, onSuccessCallback, next_page_url) {
    // Create some default params
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
		        global.oauth.refresh(self.getRfiDocuments, rfiUid, onSuccessCallback, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/attachments';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getRfiDocuments, onSuccessCallback);
    	},
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiSnapshots = function(rfiUid, onSuccessCallback, next_page_url) {
    // Create some default params
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
		        global.oauth.refresh(self.getRfiSnapshots, rfiUid, onSuccessCallback, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/snapshots';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getRfiSnapshots, onSuccessCallback);
    	},
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getRfiHistoryEvents = function(rfiUid, onSuccessCallback, next_page_url) {
    // Create some default params
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
		        global.oauth.refresh(self.getRfiHistoryEvents, rfiUid, onSuccessCallback, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid + '/history';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getRfiHistoryEvents, onSuccessCallback);
    	},
	    onError: onErrorCallback
	});
};

Konstruction.prototype.updateRfi = function(rfiUid, data, onSuccessCallback) {
    // Create some default params
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
		        global.oauth.refresh(self.updateRfi, rfiUid, data, onSuccessCallback);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/rfis/' + rfiUid;
			break;
	}
	global.xhr.PATCH({
		data: data,
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};

Konstruction.prototype.getDocuments = function(onSuccessCallback, options, next_page_url) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getDocuments, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/attachments';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getDocuments, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.getDrawings = function(onSuccessCallback, options, next_page_url) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
    if (!options || !options.forceRefresh) {
    	options = global.xhrOptions;
    	options.forceRefresh = false;
    }
    Ti.API.info('getDrawings.options = ' + JSON.stringify(options));
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getDrawings, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/sheets';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getDrawings, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.getDrawing = function(drawingUid, onSuccessCallback, options) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getDrawing, drawingUid, onSuccessCallback, options);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/sheets/' + drawingUid;
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.createDrawingPacket = function(data, onSuccessCallback, drawingUid, showDrawing, drawingName, drawingUrl) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.createDrawingPacket, data, onSuccessCallback, drawingUid, showDrawing, drawingName, drawingUrl);
			} else {
				if (drawingName && drawingUrl) {
		      		showDrawing(drawingName, drawingUrl);
		      	} else if (global.show429Error) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/sheets/packets';
			break;
	}
	global.xhr.POST({
	    url: apiURL + endpoint,
	    data: data,
	    onSuccess: function(results) {
	    	onSuccessCallback(results, drawingUid);
    	},
	    onError: onErrorCallback,
	});
};

Konstruction.prototype.getDrawingPacket = function(packet_uid, onSuccessCallback, options, drawingUid) {
    // Create some default params
    if (onSuccessCallback) { Ti.API.info('onSuccessCallback'); }
    
    var onSuccessCallback = onSuccessCallback || function() {};
	var opts = global.xhrOptions;
    var options = options || opts;
    if (options) {
    	options.forceRefresh = true;
    }
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getDrawingPacket, packet_uid, onSuccessCallback, options, drawingUid);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/sheets/packets/' + packet_uid;
			break;
	}
	global.xhr.GET({
	    url: apiURL + endpoint,
	    onSuccess: function(results) {
	    	onSuccessCallback(results, drawingUid);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.getSubmittalPackages = function(onSuccessCallback, options, next_page_url) {
    // Create some default params
    if (onSuccessCallback) { Ti.API.info('onSuccessCallback'); }
    
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getSubmittalPackages, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/submittals/packages';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getSubmittalPackages, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.getSubmittalPackageHistory = function(packageUid, onSuccessCallback, options, next_page_url) {
    // Create some default params
    if (onSuccessCallback) { Ti.API.info('onSuccessCallback'); }
    
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getSubmittalPackageHistory, packageUid, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/submittals/packages/' + packageUid + '/history';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	Ti.API.info('got first set of results back for history. about to check pagination.');
	    	self.processPagination(results, self.getSubmittalPackageHistory, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.getSubmittalFiles = function(packageUid, onSuccessCallback, options, next_page_url) {
    // Create some default params
    if (onSuccessCallback) { Ti.API.info('onSuccessCallback'); }
    
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getSubmittalFiles, packageUid, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/submittals/packages/' + packageUid + '/file_groups';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	Ti.API.info('got first set of results back for history. about to check pagination.');
	    	self.processPagination(results, self.getSubmittalFiles, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

Konstruction.prototype.getSubmittals = function(onSuccessCallback, options, next_page_url) {
    // Create some default params
    if (onSuccessCallback) { Ti.API.info('onSuccessCallback'); }
    
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || null;
	var apiURL = global.konstruction.apiURL;
	var endpoint;
	//var onErrorCallback = global.onXHRError || function() {};
	var onErrorCallback = function(xhrResults) {
		if (!nonce) {
			if (xhrResults.status === 401) {
				Ti.API.info('401: ', JSON.stringify(xhrResults));
		        nonce++;
		        global.oauth.refresh(self.getSubmittals, onSuccessCallback, options, next_page_url);
			} else {
				//alert('ERROR ' + xhrResults.error);
				if (xhrResults.status != 429) {
		      		alert('ERROR:  ' + xhrResults.error);
		      	}
			}
	    } else {
			Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
			alert('An error occurred: \n', JSON.stringify(xhrResults));
			nonce = null;
		}
		Alloy.Globals.loading.hide();
	};
	switch (this.platform) {
		case 'PlanGrid':
		default:
			endpoint = 'projects/' + Ti.App.Properties.getString("project_uid") + '/submittals/items';
			break;
	}
	global.xhr.GET({
	    url: next_page_url ? next_page_url : apiURL + endpoint,
	    onSuccess: function(results) {
	    	self.processPagination(results, self.getSubmittals, onSuccessCallback, options);
    	},
	    onError: onErrorCallback,
	    extraParams: options
	});
};

// Returns everything. 
module.exports = Konstruction;
