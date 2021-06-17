// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var folders = [];
var currentFolder = args.currentFolder || null;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var showDocument = function(title, url) {
	Alloy.Globals.loading.hide();
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

var chooseDocument = function(e) {
	Ti.API.info('e = ' + JSON.stringify(e));
	Alloy.Globals.loading.show(L('loading'));
	if (e.url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
		    url: e.url,
		    onSuccess: function (results) {
		    	//Ti.API.info('getDocument = ' + JSON.stringify(results));
		    	showDocument(e.text, e.url);
		    },
		    onError: global.onXHRError
		});
	} else {
		showDocument(e.text, e.url);
	}
};

var listDocuments = function(results) {
	Ti.API.info('konstruction.getDocuments results = ' + JSON.stringify(results));
	$.currentFolder.text = currentFolder ? 'Folder:  ' + currentFolder : '';
	//var x = 1;
	var item = null;
	//var tableData = [];
	var documents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('documents = ' + JSON.stringify(documents));
	//var documentsGrid = Alloy.createController('br.com.coredigital.GridLayout');
	if (documents) {
		global.setDocuments(documents);
		documents.forEach(function(document) {
			if (!document.deleted) {
				item = $.UI.create('View', {url: document.url, text: document.name, classes: ["gridItem"]});
				var imageUrl = (document.url.indexOf('.jpg') > -1 || document.url.indexOf('.png') > -1) ? document.url : '/images/thumb_drawing_placeholder.png';
				item.add($.UI.create('ImageView', {image: imageUrl, classes: ["itemImage"]}));
				if (document.folder == currentFolder) {
					item.add($.UI.create('Label', {text: document.name,classes: ["itemLabel"]}));
					item.addEventListener('click', function() {
						chooseDocument({url: document.url, text: document.name});
					});
					$.documentsGrid.addItem(item);
				} else if (document.folder) {
					var folderName = (currentFolder == null) ? document.folder.split('/')[0] : document.folder.split(currentFolder + '/')[1];
					// Ti.API.info('currentFolder = ' + currentFolder);
					// Ti.API.info('document.folder = ' + document.folder);
					// Ti.API.info('document.folder.split(currentFolder + /)[1] = ' + document.folder.split(currentFolder + '/')[1]);
					// Ti.API.info('stringified document.folder.split = ' + JSON.stringify(document.folder.split(currentFolder + '/')));
					if (folders.indexOf(folderName) == -1) {
						item.add($.UI.create('Label', {
							text: folderName,
							classes: ["itemLabel"]
						}));
						item.addEventListener('click', function(e) {
							var componentIndex = currentFolder ? currentFolder.split('/').length : 0;
							var folderToLoad;
							if (currentFolder != null) {
								folderToLoad = currentFolder + '/' + document.folder.split('/')[componentIndex];
							} else {
								folderToLoad = document.folder.split('/')[componentIndex];
							}
							
							//$.documentsGrid.removeAllItems();
							//listDocuments(results);
							Alloy.createController('documents', {currentFolder: folderToLoad}).getView().open();
						});
						folders.push(folderName);
						$.documentsGrid.addItem(item);
					}
				}
			}
		});
	} else {
		item = $.UI.create('View', {classes: ["gridItem"]});
		item.add($.UI.create('Label', {text: L('no_items'), classes: ["itemLabel"]}));
		$.documentsGrid.addItem(item);
	}
};


global.konstruction.getDocuments(listDocuments);