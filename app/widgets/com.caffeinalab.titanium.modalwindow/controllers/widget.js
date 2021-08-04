var args = arguments[0] || {};
var webviewOverlay = args.webviewOverlay || {};
var initDrawingTitle = args.initTitle || '';

if (args.title) $.win.title = args.title;

/*
Methods
*/

function open(options) {
	var widgetOptions = options || {modal: true};
	if (OS_ANDROID) {
		widgetOptions.modal = null;
	}
	$.nav.open(widgetOptions);
}

function close() {
	//Ti.App.fireEvent('close');
	if ($.win.closingAnimation && OS_IOS) {
		$.nav.animate($.win.closingAnimation, function() {
			$.nav.close({animated: false});
		});
	} else {
		$.nav.close();
	}
}

function add($ui) {
	$.win.add($ui);
}

function setWebviewOverlay(wvOverlay) {
	webviewOverlay = wvOverlay;
}

function showRemoveOverlayOption() {
	setTimeout(function() {
		$.removeOverlayButton.visible = true;
	}, 1600);
}

function hideOverlayOption() {
	setTimeout(function() {
		$.overlayButton.visible = false;
		$.removeOverlayButton.visible = false;
	}, 1500);
}

function showOverlayOption() {
	setTimeout(function() {
		$.removeOverlayButton.visible = false;
		$.overlayButton.visible = true;
		//$.win.activity.invalidateOptionsMenu();
	}, 1500);
}

function setTitle(title) {
	$.win.title = title;
}

function overlay() {
	Alloy.createController('drawings', {overlay: true, originalShowDrawing: args.originalShowDrawing, sourceModal: $}).getView().open();
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
exports.setWebviewOverlay = setWebviewOverlay;
exports.hideOverlayOption = hideOverlayOption;
exports.showOverlayOption = showOverlayOption;
exports.showRemoveOverlayOption = showRemoveOverlayOption;
exports.setTitle = setTitle;
exports.overlay = overlay;
