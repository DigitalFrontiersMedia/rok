// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	// TODO:  Only go Home if configuration completed.
	Ti.API.info('Going home...');
	//global.homeWindow.open();
	Alloy.createController('home').getView().open();
	global.isHome = true;
};

var getFormattedTime = function() {
	$.lbl_dateTime.text = global.formatDate(new Date()) + ' | ' + global.formatTime(new Date());
	if ($.getView().parent.id == 'home') {
		global.isHome = true;
	} else {
		global.isHome = false;
	}
};
setInterval(getFormattedTime, 10000);
setTimeout(getFormattedTime, 100);