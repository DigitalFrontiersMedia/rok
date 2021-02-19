// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.Label_pass_prompt.text = String.format(L('wifi_password'), args.title);
$.TextField_pass.focus();

var connect = function() {
	if ($.TextField_pass.value.length == 0) {
		cancel();
		return;
	}
	if ($.TextField_pass.value.length < 8) {
		alert(L("wifi_password_too_short"));
		return;
	}
	global.netConnect($.TextField_pass.value);
};

var cancel = function(e) {
	$.TextField_pass.blur();
	var setupWizard_step2Window = Alloy.createController('setupWizard_step2').getView();
	setupWizard_step2Window.setupWizard2Container.remove($.password);
	//setupWizard_step2Window.open();
};