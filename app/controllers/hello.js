// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var windowName;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	Alloy.createController('setupWizard_step2').getView().open();
	//goHome();
	$.hello.close();
};
