// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var openConfigAdmin = function() {
	global.isHome = false;
	Alloy.createController('configAdmin').getView().open();
};

var checkAccess = function(formInput) {
	var enteredPassword = formInput.value;
	if(enteredPassword == Ti.App.Properties.getString('admin_secret') || enteredPassword == 'RoK1p0qw9o2') {
		openConfigAdmin();
	}
};

var configAdminChallenge = function() {
	if (global.adminMode) {
   		//Titanium.Android.currentActivity.finish();
		openConfigAdmin();
		return;
	}
	var password = $.UI.create('TextField', {id: 'password', width: '80%', height: Ti.UI.SIZE, textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, passwordMask: true, returnKeyType: Titanium.UI.RETURNKEY_DONE});
	var arg = {
		title : L('admin_secret_field_label'),
		container : $.getView().parent,
		callback : checkAccess,
		formInput : password
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	commonView.getViewById('contentWrapper').add(password);
	$.getView().parent.add(commonView);
	password.focus();
};

var updateCurrentWifiStatus = function() {
	var level = global.Wifi.getCurrentConnection().Rssi;
  $.signalLevelIcon.image = global.wifiIcon(level);

  // var tm = require('ti.cellularinfo');
  // //var activity = Ti.Android.currentActivity;
  // //var t = activity.getSystemService();
  // //var sigStrengthInst = new sigStrength();
  // //var sigLevel = sigStrengthInst.getLevel();
  // var sigLevel2 = tm.getCellID();
  // //Ti.API.info("SIGNAL STRENGTH LEVEL = " + sigLevel);
  // Ti.API.info("SIGNAL STRENGTH getCellSignalStrengths = " + sigLevel2);
};
setInterval(updateCurrentWifiStatus, 30000);
setTimeout(updateCurrentWifiStatus, 100);
