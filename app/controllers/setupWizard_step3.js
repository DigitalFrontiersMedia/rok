// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var wizardContinue = function() {
	Alloy.createController('setupWizard_step4').getView().open();
};

var login = function() {
	$.TextField_user.blur();
	$.TextField_pass.blur();
	wizardContinue();	
};

var account = global.jDrupal.currentUser();
global.userId = account ? account.id() : null;
if (global.userId) {
	$.View_loginForm.visible = false;
	$.alreadyLoggedIn.visible = true;
	$.nxtBtn.visible = true;
/*
	setTimeout(function() {
		var dialog = Ti.UI.createAlertDialog({
		    ok: 0,
		    buttonNames: ['OK'],
			message: L('already_logged_in'),
			title: L('sign_in'),
			buttonClickRequired: true
		});	
		dialog.addEventListener('click', function (e) {
			if (e.index === e.source.ok) {
			  wizardContinue();
			}
		});
		dialog.show();
	}, 500);*/

} else {
	$.View_loginForm.visible = true;
	$.alreadyLoggedIn.visible = false;
	$.nxtBtn.visible = false;
}
