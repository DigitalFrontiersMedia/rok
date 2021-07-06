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
	Alloy.Globals.loading.show(L('connecting'));
	global.netConnect($.TextField_pass.value);
};

var cancel = function(e) {
	$.TextField_pass.blur();
	//var setupWizard_step2Window = Alloy.createController('setupWizard_step2').getView();
	//setupWizard_step2Window.getViewById('setupWizard2Container').remove($.password);
	$.getView().parent.remove($.password);
	//setupWizard_step2Window.open();
};