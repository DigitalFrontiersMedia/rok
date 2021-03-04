// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var windowName;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	goHome();
	$.hello.close();
};

for (i = 4; i > 0; i--) {
	windowName = 'setupWizard_step' + i;
	Ti.API.info('*** Closing:  ' + windowName + ' ***');
	Alloy.createController(windowName).getView().close();
}