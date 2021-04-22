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
if (!Ti.App.Properties.getBool('configured') || !Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, 'pdfViewer/viewer.html').exists()) {
	global.recursiveResourcesCopy('pdfViewer/build');
	global.recursiveResourcesCopy('pdfViewer/cmaps');
	global.recursiveResourcesCopy('pdfViewer/images');
	global.recursiveResourcesCopy('pdfViewer/locale/en-US');
	global.copyFileToAppData('pdfViewer/viewer.html');
	global.copyFileToAppData('pdfViewer/viewer.css');
}
if (Ti.App.Properties.getBool('configured')) {
	goHome();
} else {
	// Original behavior opened this selection window.
	//$.index.open();
	// New behavior jumps straight into setup.
	goSetup();
}

