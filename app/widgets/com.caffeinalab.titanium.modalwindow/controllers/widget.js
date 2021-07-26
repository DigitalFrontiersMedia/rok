var args = arguments[0] || {};

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

function hideOverlayOption() {
	setTimeout(function() {
		$.overlayButton.visible = false;
	}, 2000);
}

function showOverlayOption() {
	setTimeout(function() {
		$.overlayButton.visible = true;
		//$.win.activity.invalidateOptionsMenu();
	}, 2000);
}

function setTitle(title) {
	$.win.title = title;
}

function overlay() {
	Alloy.createController('drawings', {overlay: true, originalShowDrawing: args.originalShowDrawing, sourceModal: $}).getView().open();
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
exports.hideOverlayOption = hideOverlayOption;
exports.showOverlayOption = showOverlayOption;
exports.setTitle = setTitle;
exports.overlay = overlay;
