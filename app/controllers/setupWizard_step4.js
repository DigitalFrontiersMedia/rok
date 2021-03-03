// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	Ti.App.Properties.setBool('configured', true);
	//goHome();
	var nextWindow = Alloy.createController('hello').getView();
	nextWindow.open();
};
