(function constructor(args) {
	$.gridLayout.applyProperties(_.pick(args, ["visible", "height", "top", "bottom", "left", "right", "width", "backgroundColor"]));

	var totalColumns = parseInt(args.columns) || 2;
	var gap = parseInt(args.gap) || 3;
	var totalItens = 0;
	var row = 0;
	var heightView;

	var setDocLayout = function(docLayout) {
		heightView = ((widthScreen - gap * (totalColumns + 1)) / totalColumns) * (global.gridHeightMultiplier + (docLayout * 0.45));
	};
	
	var widthScreen = OS_ANDROID ? px2dpi(Ti.Platform.displayCaps.platformWidth) : Ti.Platform.displayCaps.platformWidth;

	if (typeof args.width === 'string' && args.width.indexOf('%') > -1){
		widthScreen = parseInt((widthScreen / 100) * parseInt(args.width));
	} else if (args.hasOwnProperty('width')) {
		widthScreen = args.width;
	}

	var widthView = (widthScreen - gap * (totalColumns + 1)) / totalColumns;
	heightView = ((widthScreen - gap * (totalColumns + 1)) / totalColumns) * global.gridHeightMultiplier;
	var horizontalView ;

	$.footer.height = gap;
	_.each(args.children, function(view, index) {
		addItem(view);
	});

	function addItem(view) {
		view.height = heightView;
		view.width = widthView;
		view.left = gap;
		view.top = gap;
		if (totalItens % totalColumns == 0) {
			row++;
			horizontalView = Ti.UI.createView({
				layout: 'horizontal',
				height: row == 1 ? heightView - gap : heightView
			});
			$.wrapperGridLayout.add(horizontalView);
		}
		if (row == 1) {
			view.top = 0;
			view.height = heightView - gap;
		}
		horizontalView.add(view);
		totalItens ++ ;
	}

	function removeAllItems() {
		$.wrapperGridLayout.removeAllChildren();
		row = 0;
		totalItens = 0;
	}

	function px2dpi(px) {
		return Math.ceil(px / (Titanium.Platform.displayCaps.dpi / 160));
	};

	function dpi2px(dpi) {
	    return Math.ceil(dpi * (Titanium.Platform.displayCaps.dpi / 160));
	};

	exports.removeAllItems = removeAllItems;
	exports.addItem = addItem;
	exports.setDocLayout = setDocLayout;
})(arguments[0] || {});

