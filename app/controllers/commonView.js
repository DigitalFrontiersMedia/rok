// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var container = args.container;
var callback = args.callback;
var formInput = args.formInput;

$.Label_title.text = args.title;

var done = function() {
	Ti.API.info('*** DONE ***');
	if (formInput) {
		formInput.blur();
	}
	if (callback) {
		callback(formInput);
	}
	container.remove($.commonView);
};
