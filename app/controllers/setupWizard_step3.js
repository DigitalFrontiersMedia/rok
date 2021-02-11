// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var login = function() {
	$.TextField_user.blur();
	$.TextField_pass.blur();
	
	var setupWizard_step4Window = Alloy.createController('setupWizard_step4').getView();
	setupWizard_step4Window.open();	
};