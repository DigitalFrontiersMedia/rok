// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var wizardContinue = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	if (deviceInfo.length == 1) {
		Ti.App.Properties.setInt("deviceIndex", 0);
		Alloy.createController('setupWizard_step3_2').getView().open();
	} else {
		Alloy.createController('setupWizard_step3_1').getView().open();
	}
};

var doJDrupalLogin = function() {
	global.jDrupal.userLogin($.TextField_user.value, $.TextField_pass.value, Alloy.Globals.loading).then(function(e) {
		Alloy.Globals.loading.hide();
		var account = global.jDrupal.currentUser();
		global.userId = account ? account.id() : null;
		if (global.userId) {
			Ti.API.info('User id: ' + global.userId);
			Ti.API.info('Logged in!');
			Ti.App.Properties.setString("email", $.TextField_user.value);
			Ti.App.Properties.setString("password", $.TextField_pass.value);			
			global.getDeviceInfo(wizardContinue);
			//wizardContinue();
		} else {
			//alert('Could not login. Try again.')
		}
	});
};

var login = function() {
	// Ti.UI.Android.hideSoftKeyboard();
	$.TextField_user.blur();
	$.TextField_pass.blur();
	if (global.userId) {
		Ti.API.info('Clearing any logins to prevent 403 login access problems...');
		global.jDrupal.userLogout().then(function(e) {
			Alloy.Globals.loading.show('Logging in...');
			doJDrupalLogin();
		});
	} else {
		doJDrupalLogin();
	}
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
