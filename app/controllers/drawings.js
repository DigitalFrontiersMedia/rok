// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var packetPoll = null;
var requestTime = 0;
var timeoutLimit = 30;
var drawingName = null;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var showDrawing = function(title, url) {
	Alloy.Globals.loading.hide();
	if (!url) {
		alert('*** No URL for requested resource!!! ***');
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
	var drawing = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('drawing = ' + JSON.stringify(drawing));
	if (drawing.file_url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: 60, responseType: 'blob'},
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
		alert('Failed to load.');
		return;
	}
	var hashedURL = Titanium.Utils.md5HexDigest(packet.file_url);
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
	Alloy.Globals.loading.show('Loading...');
	data.sheet_uids = [e.uid];
	drawingName = e.text;
	global.konstruction.createDrawingPacket(JSON.stringify(data), preProcessDrawing);
};

var listDrawings = function(results) {
	Ti.API.info('konstruction.getDrawings results = ' + JSON.stringify(results));
	//var x = 1;
	var item = null;
	//var tableData = [];
	var drawings = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('drawings = ' + JSON.stringify(drawings));
	//var drawingsGrid = Alloy.createController('br.com.coredigital.GridLayout');
	if (drawings) {
		global.setDrawings(drawings);
		drawings.forEach(function(drawing) {
			if (!drawing.deleted) {
				item = $.UI.create('View', {uid: drawing.uid, text: drawing.name, classes: ["gridItem"]});
				var imageUrl = (drawing.uid.indexOf('.jpg') > -1 || drawing.uid.indexOf('.png') > -1) ? drawing.url : '/images/locked.png';
				item.add($.UI.create('ImageView', {image: imageUrl, classes: ["itemImage"]}));
				item.add($.UI.create('Label', {text: drawing.name + ' (' + drawing.version_name + ')', classes: ["itemLabel"]}));
				item.addEventListener('click', function() {
					chooseDrawing({uid: drawing.uid, text: drawing.name});
				});
				$.drawingsGrid.addItem(item);
			}
		});
	} else {
		item = $.UI.create('View', {classes: ["gridItem"]});
		item.add($.UI.create('Label', {text: L('no_items'), classes: ["itemLabel"]}));
		$.drawingsGrid.addItem(item);
	}
};

global.konstruction.getDrawings(listDrawings);