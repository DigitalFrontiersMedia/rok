// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var startWizard = function() {
	var setupWizard_step1Window = Alloy.createController('setupWizard_step1').getView();
	setupWizard_step1Window.open();
};
