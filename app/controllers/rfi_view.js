// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var rfi = Ti.App.Properties.getObject("rfis");

Ti.API.info('RFI = ' + JSON.stringify(rfi[args.index]));

var formatDate = function(dateString) {
	return dateString ? new Date(dateString).toLocaleDateString(Ti.Locale.currentLanguage) : '';
};

var listUser = function(results) {
	var userInfo = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
	$.TextField_assigned.value += global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name) + '\n';
};

var getAndListAssignedUserInfo = function(users) {
	users.forEach(function(user) {
		global.konstruction.getUserInfo(user, listUser);
	});
};

var showRef = function(title, url) {
	if (url.indexOf('response-content-disposition=attachment') == -1) {
		var dialog = require('ti.webdialog');
		if (dialog.isSupported()) {
			dialog.open({
				id: 'refDisplay',
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
		var webview = Titanium.UI.createWebView({
			backgroundColor: 'transparent',
			url: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, '/pdfViewer/viewer.html').nativePath + '?file=' + file.nativePath
		});
		modal.add(webview);
		modal.open();
	}
};

var chooseRef = function(e) {
	Ti.API.info('e.section.rows[e.index].url = ' + e.section.rows[e.index].url);
	if (e.section.rows[e.index].url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: 60, responseType: 'blob'},
		    url: e.section.rows[e.index].url,
		    onSuccess: function (results) {
		    	//Ti.API.info('getDocument = ' + JSON.stringify(results));
		    	showRef(e.source.text, e.section.rows[e.index].url);
		    },
		    onError: global.onXHRError
		});
	} else {
		showRef(e.source.text, e.section.rows[e.index].url);
	}
};

var listPhotos = function(results) {
	var photoLabel;
	var x = 1;
	var dataRow;
	var tableData = [];
	var photos = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('photos = ' + JSON.stringify(photos));
	if (photos.length) {
		photoLabel = $.UI.create('Label', {text: 'Photos', classes: ['listLabels']});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'zebra']});
		dataRow.add(photoLabel);
		tableData.push(dataRow);
	}
	photos.forEach(function(photo) {
		photoTitle = global.UTIL.cleanString(photo.title) ? '• ' + global.UTIL.cleanString(photo.title) : "• Photo " + x;
		photoLabel = $.UI.create('Label', {text: photoTitle, classes: ["listLabels"]});
		dataRow = Ti.UI.createTableViewRow({url: photo.url});
		dataRow.add(photoLabel);
		x++;
		if (x % 2) {
			//$.addClass(dataRow, 'zebra');
		}
		tableData.push(dataRow);
	});
	$.ListView_refs.appendRow(tableData);
};

var listDocuments = function(results) {
	var attachmentLabel;
	var x = 1;
	var dataRow;
	var tableData = [];
	var attachments = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('attachments = ' + JSON.stringify(attachments));
	if (attachments.length) {
		attachmentLabel = $.UI.create('Label', {text: 'Documents', classes: ['listLabels']});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'zebra']});
		dataRow.add(attachmentLabel);
		tableData.push(dataRow);
	}
	attachments.forEach(function(attachment) {
		attachmentTitle = global.UTIL.cleanString(attachment.name) ? '• ' + global.UTIL.cleanString(attachment.name) : "• Document " + x;
		attachmentLabel = $.UI.create('Label', {text: attachmentTitle, classes: ["listLabels"]});
		dataRow = Ti.UI.createTableViewRow({url: attachment.url, name: attachment.name});
		dataRow.add(attachmentLabel);
		x++;
		if (x % 2) {
			//$.addClass(dataRow, 'zebra');
		}
		tableData.push(dataRow);
	});
	$.ListView_refs.appendRow(tableData);
};

var listSnapshot = function(results) {
	var snapshotInfo = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('snapshotInfo = ' + JSON.stringify(snapshotInfo));
	$.TextField_references.value += snapshotInfo.first_name + ' ' + snapshotInfo.last_name + '\n';
};

var getAndListSnapshots = function(snapshots) {
	snapshots.forEach(function(snapshot) {
		global.konstruction.getSnapshot(snapshot, listSnapshot);
	});
};

var getAndListHistory = function(historicalEntries) {
	historicalEntries.forEach(function(historicalEntry) {
		//global.konstruction.getSnapshot(snapshot, listSnapshot);
	});
};

$.Label_Title.text = L("rfi") + ' #' + rfi[args.index].number;
$.Label_subTitle.text = Ti.App.Properties.getString("project");

$.TextField_title.value = global.UTIL.cleanString(rfi[args.index].title);
$.TextArea_question.value = global.UTIL.cleanString(rfi[args.index].question);
$.TextArea_answer.value = global.UTIL.cleanString(rfi[args.index].answer);
$.TextField_sendDate.value = formatDate(rfi[args.index].sent_at);
$.TextField_dueDate.value = formatDate(rfi[args.index].due_at);

getAndListAssignedUserInfo(rfi[args.index].assigned_to);
global.konstruction.getRfiPhotos(rfi[args.index].uid, listPhotos);
global.konstruction.getRfiDocuments(rfi[args.index].uid, listDocuments);
//getAndListSnapshots(rfi[args.index].snapshots);
//getAndListHistory(rfi[args.index].uid);

