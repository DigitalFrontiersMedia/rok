// 
//  konstruction.js
//  ROK
//  
//  Created by S.Barker on 2021-03-22.
//  Copyright 2021 S.Barker. All rights reserved.
// 

Konstruction = function() {};

 
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

Konstruction.prototype.platform = function() {
    return this.platform;
};

Konstruction.prototype.getProjects = function(onSuccessCallback) {
    // Create some default params
    var onSuccessCallback = onSuccessCallback || function() {};
    var options = options || {};
	var apiURL = this.apiURL;
	var onErrorCallback = global.onXHRError || function() {};
	global.xhr.GET({
	    url: apiURL + 'projects',
	    onSuccess: onSuccessCallback,
	    onError: onErrorCallback
	});
};
 
// Returns everything. 
module.exports = Konstruction;
