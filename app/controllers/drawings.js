// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var packetPoll = null;
var requestTime = 0;
var timeoutLimit = 30;
var drawingName = null;
var currentFilter;
var drawingUid = null;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var showDrawing = function(title, url) {
	Alloy.Globals.loading.hide();
	if (!url) {
		alert(L('no_url'));
		return;
	}
	if (url.indexOf('response-content-disposition=attachment') == -1) {
		var dialog = require('ti.webdialog');
		if (dialog.isSupported()) {
			dialog.open({
				id: 'docDisplay',
		    	title: title,
		    	url: url,
		        tintColor: '#ffffff',
		        barColor: '#ff9200',
		        showTitle: true,
		        animated: true,
		        fadeTransition: true,
		        enableSharing: false
		   });
	   }
	 } else {
		// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
		if (url.indexOf('.pdf?') > -1) {
			url = url.split('?')[0];
		}
	    var hashedURL = Titanium.Utils.md5HexDigest(url);
	    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
	    var modal = Alloy.createWidget("com.caffeinalab.titanium.modalwindow", {
			title : 'ROK ' + title,//file.name,
			classes : ["modal"]
		});
		Ti.API.info('url = ' + url);
		Ti.API.info('file.nativePath = ' + file.nativePath);
		var webview = Titanium.UI.createWebView({
			backgroundColor: 'transparent',
			url: Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, '/pdfViewer/viewer.html').nativePath + '?file=' + file.nativePath.split('file://').join('')
		});
		modal.add(webview);
		modal.open();
	}
};

var processDrawing = function(results) {
	Ti.API.info('results = ' + JSON.stringify(results));
	var drawings = Ti.App.Properties.getList("drawings");
	var drawing = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('drawing = ' + JSON.stringify(drawing));
	// Add drawing result to drawings cached object.
	_.findWhere(drawings, {uid: drawingUid}).drawing = drawing;
	global.setDrawings(drawings);
	if (drawing.file_url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
		    url: drawing.file_url,
		    onSuccess: function (results) {
		    	Ti.API.info('processDrawing xhr file retrieval results = ' + JSON.stringify(results));
		    	showDrawing(drawingName, drawing.file_url);
		    },
		    onError: global.onXHRError
		});
	} else {
		showDrawing(drawingName, drawing.file_url);
	}
};

var preProcessDrawing = function(results) {
	Ti.API.info('preProcess results = ' + JSON.stringify(results));
	var packet = (results.status == 200 || results.status == 201 || results.status == 304) ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('packet = ' + JSON.stringify(packet));
	if (requestTime > timeoutLimit) {
		clearTimeout(packetPoll);
		packetPoll = null;
		Alloy.Globals.loading.hide();
		alert(L('load_failed'));
		return;
	}
	var url = packet.file_url;
	// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
	if (url.indexOf('.pdf?') > -1) {
		url = url.split('?')[0];
	}
	var hashedURL = Titanium.Utils.md5HexDigest(url);
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
	if (packet.status == 'complete' || (results.status == 304 && file.exists()) ) {
		clearTimeout(packetPoll);
		packetPoll = null;
		processDrawing(results);
		return;
	}
	packetPoll = setTimeout(function() {
		Ti.API.info('packetPoll packet = ' + JSON.stringify(packet));
		requestTime ++;
		global.konstruction.getDrawingPacket(packet.uid, preProcessDrawing);
	}, 1000);
};

var chooseDrawing = function(e) {
	Ti.API.info('e = ' + JSON.stringify(e));
	var data = {};
	Alloy.Globals.loading.show(L('loading'));
	drawingUid = e.uid;
	data.sheet_uids = [drawingUid];
	drawingName = e.text;
	
	// Test if the target drawing has been cached so that we can bypass createDrawingPacket step.
	var drawings = Ti.App.Properties.getList("drawings");
	var cacheManager = Ti.App.Properties.getObject("cachedXHRDocuments", {});
	Ti.API.info('choose drawings = ' + JSON.stringify(drawings));
	Ti.API.info('_.findWhere(drawings, {uid: drawingUid}) = ' + JSON.stringify(_.findWhere(drawings, {uid: drawingUid})));
	var selectedDrawing = _.findWhere(drawings, {uid: drawingUid}).drawing;
	Ti.API.info('selectedDrawing = ' + JSON.stringify(selectedDrawing));
	var url = selectedDrawing ? selectedDrawing.file_url : ' ';
	var drawingUrl = url;
	// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
	if (url.indexOf('.pdf?') > -1) {
		url = url.split('?')[0];
	}
	var hashedURL = Titanium.Utils.md5HexDigest(url);
    // Check if the file exists in the manager
    var cache = cacheManager[hashedURL];
    // If the file was found
    if (cache && cache.timestamp >= new Date().getTime()) {
        // Check that the TTL is still valid and won't expire until future
        // Titanium.API.info("CACHE FOUND");
        // Somehow get the cached drawing and display it.
        showDrawing(drawingName, drawingUrl);
	} else {
		global.konstruction.createDrawingPacket(JSON.stringify(data), preProcessDrawing);
	}
};

var listDrawings = function(results, preFetched) {
	Ti.API.info('konstruction.getDrawings results = ' + JSON.stringify(results));
	//var x = 1;
	var drawings;
	var cachedDrawings = Ti.App.Properties.getList("drawings");
	var item = null;
	//var tableData = [];
	if (preFetched) {
		drawings = cachedDrawings;
	} else {
		drawings = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	}
	Ti.API.info('listDrawings drawings = ' + JSON.stringify(drawings));
	//var drawingsGrid = Alloy.createController('br.com.coredigital.GridLayout');
	if (drawings) {
		drawings.forEach(function(drawing) {
			// Merge with saved drawings before re-saving.
			_.findWhere(drawings, {uid: drawing.uid}).drawing = _.findWhere(cachedDrawings, {uid: drawing.uid}).drawing;
			//Ti.API.info('Looking at drawing ' + drawing.name);
			if (!drawing.deleted) {
				item = $.UI.create('View', {uid: drawing.uid, text: drawing.name, classes: ["gridItem"]});
				var imageUrl = (drawing.uid.indexOf('.jpg') > -1 || drawing.uid.indexOf('.png') > -1) ? drawing.url : '/images/locked.png';
				item.add($.UI.create('ImageView', {image: imageUrl, classes: ["itemImage"]}));
				item.add($.UI.create('Label', {text: drawing.name + ' (' + drawing.version_name + ')', classes: ["itemLabel"]}));
				item.addEventListener('click', function() {
					chooseDrawing({uid: drawing.uid, text: drawing.name});
				});
				if ((!currentFilter || currentFilter == 'None') || (drawing.tags.indexOf(currentFilter) > -1 || drawing.version_name == currentFilter)) {
					$.drawingsGrid.addItem(item);
				}
			}
		});
		global.setDrawings(drawings);
	} else {
		item = $.UI.create('View', {classes: ["gridItem"]});
		item.add($.UI.create('Label', {text: L('no_items'), classes: ["itemLabel"]}));
		$.drawingsGrid.addItem(item);
	}
};

var filterDrawings = function(e) {
	currentFilter = e.data[0].value;
	$.drawingsGrid.removeAllItems();
	listDrawings(null, true);
};

var showDrawingFilters = function() {
	var opts = [{option_label: 'None'}];
	var tags = [];
	var versions = [];
	var drawings = Ti.App.Properties.getList("drawings");
	drawings.forEach(function(drawing) {
		drawing.tags.forEach(function(tag) {
			if (tags.indexOf(tag) == -1) {
				tags.push(tag);
			}
		});
		if (versions.indexOf(drawing.version_name) == -1) {
			versions.push(drawing.version_name);
		}
	});
	tags.forEach(function(tag) {
		opts.push({option_label: tag});
	});
	versions.forEach(function(version) {
		opts.push({option_label: version});
	});
	global.showOptions(L('filter_to_apply'), opts, $, filterDrawings);
};

$.addClass($.optionCorner.lbl_optionCorner, 'filter');
$.optionCorner.lbl_optionCorner.addEventListener('click', showDrawingFilters);

global.konstruction.getDrawings(listDrawings);