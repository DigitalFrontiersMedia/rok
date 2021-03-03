// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var oldWindow;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	goHome();
};

for (i = 4; i > 0; i--) {
	oldWindow = Alloy.createController('setupWizard_step' + i).getView();
	oldWindow.close();
}