// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goReconfigure = function() {
	global.setupWizardWindow.open();
};

var goBrowser = function() {
	Alloy.createWidget('com.alfaqeir.webviewbrowser', null, {
        url : 'http://google.com',
        showUrlBox : true // optional
    }).getView().open();
};
