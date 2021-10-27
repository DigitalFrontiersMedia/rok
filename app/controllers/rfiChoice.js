// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goRfiEntry = function() {
	Alloy.createController('rfi_entry').getView().open();
	global.isHome = false;
};

var goRfis = function() {
	Alloy.createController('rfis').getView().open();
	global.isHome = false;
};
