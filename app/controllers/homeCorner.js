// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	Ti.API.info('Going home...');
	//global.homeWindow.open();
	if ($.getView().parent.id != 'home' && Ti.App.Properties.getBool('configured')) {
		clearInterval(timeCheck);
	    //Titanium.Android.currentActivity.finish();
		Alloy.createController('home').getView().open();
		//global.home.open();
		global.isHome = true;
	} else if (!Ti.App.Properties.getBool('configured')) {
		clearInterval(timeCheck);
	    //Titanium.Android.currentActivity.finish();
	    global.isHome = false;
		Alloy.createController('setupWizard_step1').getView().open();
		alert(L('device_info_not_synced'));
	}
};

var getFormattedTime = function() {
	$.lbl_dateTime.text = global.formatDate(new Date()) + ' | ' + global.formatTime(new Date());
};
var timeCheck = setInterval(getFormattedTime, 10000);
setTimeout(getFormattedTime, 100);