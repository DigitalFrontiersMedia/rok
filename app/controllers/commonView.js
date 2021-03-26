// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var container = args.container;

$.Label_title.text = args.title;

var done = function() {
	Ti.API.info('*** DONE ***');
	container.remove($.commonView);
};
