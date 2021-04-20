// 
//  index.js
//  ROK
//  
//  Created by S.Barker on 2020-11-17.
//  Copyright 2020 S.Barker. All rights reserved.
// 


var goSetup = function() {
	// Original behavior went to hello screen to begin setup.
	// var helloWindow = Alloy.createController('hello').getView();
	// helloWindow.open();
	// New behavior selects language first.
	global.setupWizardWindow.open();
};

var goHome = function() {
	global.homeWindow.open();
};

Ti.API.info('Configured == ' + JSON.stringify(Ti.App.Properties.getBool('configured')));
//if (!Ti.App.getBool('configured') || !Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, 'pdfViewer/viewer.html').exists()) {
	global.recursiveResourcesCopy('pdfViewer/build');
	global.recursiveResourcesCopy('pdfViewer/cmaps');
	global.recursiveResourcesCopy('pdfViewer/images');
	//global.recursiveResourcesCopy('pdfViewer/locale');
	global.recursiveResourcesCopy('pdfViewer');
//}
if (Ti.App.Properties.getBool('configured')) {
	var url = 'http://www.africau.edu/images/default/sample.pdf';
	global.xhr.GET({
	    extraParams: {shouldAuthenticate: false, contentType: '', ttl: 60},
	    url: url,
	    onSuccess: function(results) {
		    var hashedURL = Titanium.Utils.md5HexDigest(url);
		    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL).nativePath;
			var webview = Titanium.UI.createWebView({
				url: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, '/pdfViewer/viewer.html').nativePath + '?local&file=' + file
			}); 
			$.index.add(webview);
			$.index.open();
	    }
	});
	//goHome();
} else {
	// Original behavior opened this selection window.
	//$.index.open();
	// New behavior jumps straight into setup.
	goSetup();
}

