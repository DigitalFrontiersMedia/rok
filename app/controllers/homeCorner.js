// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	Ti.API.info('Going home...');
	//global.homeWindow.open();
	Alloy.createController('home').getView().open();
};

var getFormattedTime = function() {
	$.lbl_dateTime.text = global.formatDate(new Date()) + ' | ' + global.formatTime(new Date());
};
setInterval(getFormattedTime, 10000);
setTimeout(getFormattedTime, 100);