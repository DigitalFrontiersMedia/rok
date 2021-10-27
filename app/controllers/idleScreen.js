// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	if (Ti.App.Properties.getBool('configured')) {
		//Titanium.Android.currentActivity.finish();
		global.isIdle = false;
		Alloy.createController('home').getView().open();
	} else {
		//Titanium.Android.currentActivity.finish();
		global.isIdle = false;
		Alloy.createController('setupWizard_step1').getView().open();
	}
};

global.adminMode = false;