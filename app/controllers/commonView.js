// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var container = args.container;
var callback = args.callback;
var formInput = args.formInput;
var cancel = args.cancel;
var subtitle = args.subtitle;

$.Label_title.text = args.title;
if (subtitle) {
	$.Label_subtitle.text = subtitle;
} else {
	$.addClass($.Label_subtitle, 'hidden');
}
	
if (cancel) {
	$.removeClass($.defaultButton, 'ok');
	$.addClass($.defaultButton, 'cancel');
}

var done = function() {
	Ti.API.info('*** DONE ***');
	if (formInput) {
		Ti.API.info('formInput = ' + JSON.stringify(formInput));
		formInput.blur();
	}
	if (callback) {
		callback(formInput);
	}
	container.remove($.commonView);
	global.homeUIDirty = false;
};
