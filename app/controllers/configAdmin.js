// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var cacheManager = Ti.App.Properties.getObject("cachedXHRDocuments", {});
var purgedDocuments = 0;
var keys = Object.keys(cacheManager);
var okayToPurge = true;
var purgeInterval = null;
var resetInvoked = false;

$.deviceId.text = L('device_id') + ':  ' + Ti.Platform.id;
$.appVersion.text = L('app_version') + ':  ' + Ti.App.version;
$.availableSpace.text = L('avail_space') + ':  ' + global.UTIL.readableBytes(Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory).spaceAvailable());

var progressBar = $.UI.create('ProgressBar', {
	id: 'progressBar',
    top: '50%',
    width: '50%',
    height: 50,
    min: 0,
    max: keys.length,
    value: 0,
    color: '#ff9200',
	message: L('purging'),
	// location: Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
	// type: Ti.UI.Android.PROGRESS_INDICATOR_DETERMINANT,
	// cancelable: true,
	// canceledOnTouchOutside: true
});
$.configAdmin.add(progressBar);
progressBar.hide();

var goReconfigure = function() {
	//global.setupWizardWindow.open();
	//global.isHome = false;
	Alloy.createController('setupWizard_step1').getView().open();
};

var goBrowser = function() {
	//global.isHome = false;
	Alloy.createWidget('com.alfaqeir.webviewbrowser', null, {
        url : 'http://google.com',
        showUrlBox : true // optional
    }).getView().open();
};

var updatePurgeProgressBar = function(numDeleted) {
	progressBar.value = numDeleted;
};

var purge = function() {
	// convert object to key's array
	var key = keys.pop();
    // Delete references and file
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, key);
    // Delete the record and file
    delete cacheManager[key];
    file.deleteFile();

    // Update the cache manager
    Titanium.App.Properties.setObject("cachedXHRDocuments", cacheManager);

    // Update the deleted documents count
    purgedDocuments = purgedDocuments + 1;
    //progressBar.width = ((purgedDocuments / maxKeys) * 100) + '%';
    progressBar.value = purgedDocuments;

	global.userInteraction();

	if (!keys.length) {
		//purge();
		okayToPurge = false;
	}
};

var manualSync = function() {
	if (Ti.App.Properties.getBool('configured')) {
		var worker = require('ti.worker');
		// create a worker thread instance
		var task = worker.createWorker('syncService.js');
		global.manualSync = true;
	} else {
		alert(L('device_info_not_synced'));
	}
};

var factoryReset = function() {
	resetInvoked = true;
	//Ti.API.info('Ti.App.Properties.removeAllProperties();');
	Ti.App.Properties.removeAllProperties();
	Alloy.Globals.configured = false;
	if ($.backCorner) {
		$.addClass($.backCorner.getView(), 'hidden');
	}
	purgeCachedAssets();
};

var purgeCachedAssets = function() {
	if (keys.length) {
		progressBar.max = Object.keys(Ti.App.Properties.getObject("cachedXHRDocuments", {})).length;
		progressBar.show({animated: true});
		okayToPurge = true;
		purgeInterval = setInterval(function() {
			if (okayToPurge && keys.length) {
				purge();
			} else if (!okayToPurge && !keys.length) {
				clearInterval(purgeInterval);
				purgeInterval = null;
				progressBar.hide({animated: true});
				$.availableSpace.text = L('avail_space') + ':  ' + global.UTIL.readableBytes(Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory).spaceAvailable());
				if (resetInvoked) {
					resetInvoked = false;
					alert(L('factory_reset') + ' ' + L('done') + '.');
				}
				alert(String.format(L('purged_docs'), purgedDocuments));
			}
		}, 1);
	} else {
		if (resetInvoked) {
			resetInvoked = false;
			alert(L('factory_reset') + ' ' + L('done') + '.');
		}
		alert(L('no_docs'));
	}
};

var confirmPurge = function() {
	var arg = {
		title : L('purge'),
		container : $.getView().parent,
		callback : purgeCachedAssets
	};
	var messageWrapper = $.UI.create('View', {layout: 'vertical'});
	//var message = $.UI.create('Label', {top: '40%', text: L('sure')});
	var cancelBtn = $.UI.create('Label', {top: '10', height: '40', width: '120', classes: ['btnText', 'cancel', 'lesserOption']});
	cancelBtn.addEventListener('click', function() {
		$.getView().parent.remove(commonView);
	});
	var commonView = Alloy.createController('commonView', arg).getView();
	//messageWrapper.add(message);
	messageWrapper.add(cancelBtn);
	commonView.getViewById('contentWrapper').add(messageWrapper);
	$.getView().parent.add(commonView);
};

var confirmReset = function() {
	var arg = {
		title : L('factory_reset'),
		container : $.getView().parent,
		callback : factoryReset
	};
	var messageWrapper = $.UI.create('View', {layout: 'vertical'});
	var message = $.UI.create('Label', {top: '40%', text: L('long_task')});
	var cancelBtn = $.UI.create('Label', {top: '10', height: '40', width: '120', classes: ['btnText', 'cancel', 'lesserOption']});
	cancelBtn.addEventListener('click', function() {
		$.getView().parent.remove(commonView);
	});
	var commonView = Alloy.createController('commonView', arg).getView();
	messageWrapper.add(message);
	messageWrapper.add(cancelBtn);
	commonView.getViewById('contentWrapper').add(messageWrapper);
	$.getView().parent.add(commonView);
};

var confirmSync = function() {
	var arg = {
		title : L('manual_sync'),
		container : $.getView().parent,
		callback : manualSync
	};
	var messageWrapper = $.UI.create('View', {layout: 'vertical'});
	var message = $.UI.create('Label', {top: '40%', text: L('long_task')});
	var cancelBtn = $.UI.create('Label', {top: '10', height: '40', width: '120', classes: ['btnText', 'cancel', 'lesserOption']});
	cancelBtn.addEventListener('click', function() {
		$.getView().parent.remove(commonView);
	});
	var commonView = Alloy.createController('commonView', arg).getView();
	messageWrapper.add(message);
	messageWrapper.add(cancelBtn);
	commonView.getViewById('contentWrapper').add(messageWrapper);
	$.getView().parent.add(commonView);
};

global.adminMode = true;
