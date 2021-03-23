// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	Ti.App.Properties.setBool('configured', true);
	//goHome();
	Alloy.createController('hello').getView().open();
};

$.deviceNameValue.value = Ti.App.Properties.getString('deviceName');
$.superNameValue.value = Ti.App.Properties.getString('superName');
$.superPhoneValue.value = Ti.App.Properties.getString('superPhone');
