// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var showDrawing = function(title, url) {
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
			url: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, '/pdfViewer/viewer.html').nativePath + '?file=' + file.nativePath
		});
		modal.add(webview);
		modal.open();
	}
};

var processDrawing = function(results) {
	Ti.API.info('results = ' + JSON.stringify(results));
	var drawing = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('drawing = ' + JSON.stringify(drawing));
	if (drawing.uid.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: 60, responseType: 'blob'},
		    url: drawing.url,
		    onSuccess: function (results) {
		    	//Ti.API.info('getDrawing = ' + JSON.stringify(results));
		    	showDrawing(drawing.name, drawing.uid);
		    },
		    onError: global.onXHRError
		});
	} else {
		showDrawing(drawing.name, drawing.url);
	}
};

var chooseDrawing = function(e) {
	Ti.API.info('e = ' + JSON.stringify(e));
	global.konstruction.getDrawing(e.uid, processDrawing);
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
				item.add($.UI.create('Label', {text: drawing.name, classes: ["itemLabel"]}));
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