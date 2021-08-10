// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	Ti.API.info('Going home...');
	//global.homeWindow.open();
	if ($.getView().parent.id != 'home') {
		clearInterval(timeCheck);
	    Titanium.Android.currentActivity.finish();
		//Alloy.createController('home').getView().open();
		global.home.open();
		global.isHome = true;
	}
};

var getFormattedTime = function() {
	$.lbl_dateTime.text = global.formatDate(new Date()) + ' | ' + global.formatTime(new Date());
};
var timeCheck = setInterval(getFormattedTime, 10000);
setTimeout(getFormattedTime, 100);