// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goWhiteboard = function() {
	var whiteboardWindow = Alloy.createController('whiteboard').getView();
	whiteboardWindow.open();	
};
