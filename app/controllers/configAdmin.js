// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.deviceId.text = L('device_id') + ':  ' + Ti.Platform.id;
$.appVersion.text = L('app_version') + ':  ' + Ti.App.version;

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
