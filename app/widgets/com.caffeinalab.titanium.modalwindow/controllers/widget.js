var args = arguments[0] || {};
var webviewOverlay = args.webviewOverlay || {};
var initDrawingTitle = args.initTitle || '';
var showOverlay = args.overlay || '';

if (args.title) $.win.title = args.title;

/*
Methods
*/

function open(options) {
	var widgetOptions = options || {modal: true};
	if (OS_ANDROID) {
		widgetOptions.modal = null;
	}
	// Used to be $.nav
	$.win.open(widgetOptions);
}

function close() {
	//Ti.App.fireEvent('close');
	// Used to be $.nav
	if ($.win.closingAnimation && OS_IOS) {
		$.win.animate($.win.closingAnimation, function() {
			$.win.close({animated: false});
		});
	} else {
		$.win.close();
	}
}

function add($ui) {
	$.win.add($ui);
}

function remove($ui) {
	$.win.remove($ui);
}

function setWebviewOverlay(wvOverlay) {
	webviewOverlay = wvOverlay;
}

function showRemoveOverlayOption() {
	setTimeout(function() {
		$.removeOverlayButton.visible = true;
	}, 2100);
}

function hideOverlayOption() {
	setTimeout(function() {
		$.overlayButton.visible = false;
		$.removeOverlayButton.visible = false;
	}, 2000);
}

function showOverlayOption() {
	setTimeout(function() {
		$.removeOverlayButton.visible = false;
		$.overlayButton.visible = true;
		//$.win.activity.invalidateOptionsMenu();
	}, 2000);
}

function setTitle(title) {
	$.win.title = title;
}

function overlay() {
	close();
	setTimeout(function() {
			Alloy.createController('drawings', {overlay: true, originalShowDrawing: args.originalShowDrawing, sourceModal: $}).getView().open();
		}
	, 50);
}

function removeOverlay() {
	$.win.remove(webviewOverlay);
	setTitle(initDrawingTitle);
	showOverlayOption();
}

/*
Listeners
*/

//$.closeButton.addEventListener('click', close);

/*
Interface
*/

exports.open = open;
exports.close = close;
exports.add = add;
exports.remove = remove;
exports.setWebviewOverlay = setWebviewOverlay;
exports.hideOverlayOption = hideOverlayOption;
exports.showOverlayOption = showOverlayOption;
exports.showRemoveOverlayOption = showRemoveOverlayOption;
exports.setTitle = setTitle;
exports.overlay = overlay;
