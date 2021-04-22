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