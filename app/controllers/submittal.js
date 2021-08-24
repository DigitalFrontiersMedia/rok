// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var submittal = Ti.App.Properties.getList("submittals", []);
var rowIndex = 0;

$.Label_Title.text = $.Label_Title.text + ' #' + submittal[args.index].custom_id;
$.Label_subTitle.text = Ti.App.Properties.getString("project");

var listHistoryEvents = function(results) {
	var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	var historyEventLineWrapper;
	var historyEventLabel;
	var historyEventLabel2;
	var historyEventLine;
	var notes;
	var username;
	var dataRow;
	//var tableData = [];
	var historyEvents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('historyEvents = ' + JSON.stringify(historyEvents));
	cachedSubmittals[args.index].history =  historyEvents;
	global.setSubmittals(cachedSubmittals);
	historyEvents.forEach(function(historyEvent) {
		if (historyEvent.event_data.uploader_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.uploader_name);
		}
		if (historyEvent.event_data.creator_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.creator_name);
		}
		if (historyEvent.event_data.updated_by) {
			username = global.UTIL.cleanString(historyEvent.event_data.updated_by);
		}
		if (historyEvent.event_data.publisher_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.publisher_name);
		}
		if (historyEvent.event_data.updater_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.updater_name);
		}
		if (historyEvent.event_data.reviewer_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.reviewer_name);
		}
		if (historyEvent.event_type) {
			historyEventLine = historyEvent.event_type.split('_').join(' ');
		}
		historyEventLine = historyEventLine.charAt(0).toUpperCase() + historyEventLine.slice(1);
		if (username.trim()) {
			historyEventLine += '. | ' + username + ', ' + global.formatDate(historyEvent.created_at) + '.';
		} else {
			historyEventLine += '. | ' + global.formatDate(historyEvent.created_at);
		}
		//Ti.API.info('historyEventLine = ' + historyEventLine);
		notes = historyEvent.event_data.notes ? historyEvent.event_data.notes : '';
		historyEventLineWrapper = $.UI.create('View', {classes: ['heightToSize'], layout: "vertical"});
		historyEventLabel = $.UI.create('Label', {text: historyEventLine, top: 10, bottom: 10, classes: ["listLabels", 'heightToSize']});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'heightToSize']});
		historyEventLineWrapper.add(historyEventLabel);
		if (notes) {
			historyEventLabel2 = $.UI.create('Label', {text: notes, left: '10%', bottom: 10, classes: ["listLabels", 'heightToSize', 'widthToSize']});
			historyEventLineWrapper.add(historyEventLabel2);
		}
		dataRow.add(historyEventLineWrapper);
		rowIndex++;
		if (rowIndex % 2) {
			$.addClass(dataRow, 'zebra');
		}
		//tableData.push(dataRow);
		$.ListView_history.appendRow(dataRow);
	});
};

var showRef = function(title, url) {
	Alloy.Globals.loading.hide();
	if (url.indexOf('response-content-disposition=attachment') == -1) {
		// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
		if (url.indexOf('.pdf?') > -1) {
			url = url.split('?')[0];
		}
	    var hashedURL = Titanium.Utils.md5HexDigest(url);
	    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
		var dialog = require('ti.webdialog');
		if (dialog.isSupported()) {
			dialog.open({
				id: 'refDisplay',
		    	title: title,
		    	url: url, //file.nativePath.split('file://').join(''),
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
			title : 'ROK ' + title,
			classes : ["modal"]
		});
		// Ti.API.info('url = ' + url);
		// Ti.API.info('file.nativePath = ' + file.nativePath);
		// Ti.API.info('Ti.Filesystem.applicationDataDirectory = ' + Ti.Filesystem.applicationDataDirectory);
		// Ti.API.info('Ti.Filesystem.resourcesDirectory = ' + Ti.Filesystem.resourcesDirectory);
		// Ti.API.info('Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory).nativePath = ' + Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory).nativePath);
		// Ti.API.info('Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory).nativePath = ' + Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory).nativePath);
		// ResourcesDir = /android_asset/Resources/
		// AppDataDir = /data/user/0/com.digitalfrontiersmedia.rok/app_appdata/
		var webview = Titanium.UI.createWebView({
			backgroundColor: 'transparent',
			url: Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, '/pdfViewer/viewer.html').nativePath + '?file=' + file.nativePath.split('file://').join('')
		});
		modal.add(webview);
		modal.open();
		modal.hideOverlayOption();
	}
};

var chooseRef = function(e) {
	Ti.API.info('e.section.rows[e.index].url = ' + e.section.rows[e.index].url);
	Alloy.Globals.loading.show(L('loading'));
	if (e.section.rows[e.index].url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
		    url: e.section.rows[e.index].url,
		    onSuccess: function (results) {
		    	//Ti.API.info('getDocument = ' + JSON.stringify(results));
	    		//Alloy.Globals.loading.hide();
		    	showRef(e.source.text, e.section.rows[e.index].url);
		    },
		    onError: global.onXHRError
		});
	} else {
		showRef(e.source.text, e.section.rows[e.index].url);
	}
};

var listFiles = function(results) {
	var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	var fileLabel;
	var dataRow;
	//var tableData = [];
	var subFileGroups = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('subFileGroups = ' + JSON.stringify(subFileGroups));
	cachedSubmittals[args.index].files = subFileGroups;
	global.setSubmittals(cachedSubmittals);
	subFileGroups.forEach(function(subFileGroup) {
		subFileGroup.files.forEach(function(subFile) {
			fileLabel = $.UI.create('Label', {text: '• ' + subFile.name, classes: ["listLabels"]});
			dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'indent'], url: subFile.url, name: subFile.name});
			dataRow.add(fileLabel);
			rowIndex++;
			if (rowIndex % 2) {
				$.addClass(dataRow, 'zebra');
			}
			//tableData.push(dataRow);
			$.ListView_files.appendRow(dataRow);
		});
	});
};

var listSubmitters = function() {
	var names = [];
	submittal[args.index].submitters.forEach(function (submitter) {
		if (!global.historyUsers.hasOwnProperty(submitter.uid)) {
			var myPromise = new Promise(function(resolve, reject) { 
				global.konstruction.getUserInfo(submitter, resolve);
			});
			myPromise.then(function(userInfo) {
				//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				if (userinfo) {
					global.historyUsers[submitter.uid] = userInfo;
					Ti.App.Properties.setObject('historyUsers', global.historyUsers);
					if (userInfo.first_name.trim() || userInfo.last_name.trim()) {
						names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
						$.Label_submitterValue.text = names.join(', ');
					}
				}
			});
		} else if (global.historyUsers[submitter.uid].first_name.trim() || global.historyUsers[submitter.uid].last_name.trim()) {
			names.push(global.UTIL.cleanString(global.historyUsers[submitter.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[submitter.uid].last_name));
		}
	});
	if (names.length) {
		$.Label_submitterValue.text = names.join(', ');
	}
};

var listManagers = function() {
	var names = [];
	submittal[args.index].managers.forEach(function (manager) {
		if (!global.historyUsers.hasOwnProperty(manager.uid)) {
			var myPromise = new Promise(function(resolve, reject) { 
				global.konstruction.getUserInfo(manager, resolve);
			});
			myPromise.then(function(userInfo) {
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				if (userinfo) {
					global.historyUsers[submitter.uid] = userInfo;
					Ti.App.Properties.setObject('historyUsers', global.historyUsers);
					if (userInfo.first_name.trim() || userInfo.last_name.trim()) {
						names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
						$.Label_managerValue.text = names.join(', ');
					}
				}
			});
		} else if (global.historyUsers[manager.uid].first_name.trim() || global.historyUsers[manager.uid].last_name.trim()) {
			names.push(global.UTIL.cleanString(global.historyUsers[manager.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[manager.uid].last_name));
		}
	});
	if (names.length) {
		$.Label_managerValue.text = names.join(', ');
	}
};

var listReviewers = function() {
	var names = [];
	submittal[args.index].reviewers.forEach(function (reviewer) {
		if (!global.historyUsers.hasOwnProperty(reviewer.uid)) {
			var myPromise = new Promise(function(resolve, reject) { 
				global.konstruction.getUserInfo(reviewer, resolve);
			});
			myPromise.then(function(userInfo) {
				//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				if (userinfo) {
					global.historyUsers[submitter.uid] = userInfo;
					Ti.App.Properties.setObject('historyUsers', global.historyUsers);
					if (userInfo.first_name.trim() || userInfo.last_name.trim()) {
						names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
						$.Label_reviewerValue.text = names.join(', ');
					}
				}
			});
		} else if (global.historyUsers[reviewer.uid].first_name.trim() || global.historyUsers[reviewer.uid].last_name.trim()) {
			names.push(global.UTIL.cleanString(global.historyUsers[reviewer.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[reviewer.uid].last_name));
		}
	});
	if (names.length) {
		$.Label_reviewerValue.text = names.join(', ');
	}
};

var listWatchers = function() {
	var names = [];
	submittal[args.index].watchers.forEach(function (watcher) {
		if (!global.historyUsers.hasOwnProperty(watcher.uid)) {
			var myPromise = new Promise(function(resolve, reject) { 
				global.konstruction.getUserInfo(watcher, resolve);
			});
			myPromise.then(function(userInfo) {
				//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				if (userinfo) {
					global.historyUsers[submitter.uid] = userInfo;
					Ti.App.Properties.setObject('historyUsers', global.historyUsers);
					if (userInfo.first_name.trim() || userInfo.last_name.trim()) {
						names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
						$.Label_watchingValue.text = names.join(', ');
					}
				}
			});
		} else if (global.historyUsers[watcher.uid].first_name.trim() || global.historyUsers[watcher.uid].last_name.trim()) {
			names.push(global.UTIL.cleanString(global.historyUsers[watcher.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[watcher.uid].last_name));
		}
	});
	if (names.length) {
		$.Label_watchingValue.text = names.join(', ');
	}
};

$.Label_submittalNumValue.text = submittal[args.index].custom_id;
$.Label_specValue.text = submittal[args.index].spec_section;
$.Label_specNameValue.text = submittal[args.index].spec_section_name;
$.Label_versionValue.text = submittal[args.index].version;
$.Label_dueValue.text = submittal[args.index].submittal_due_date;
$.Label_statusValue.text = submittal[args.index].transmission_status;

listSubmitters();
listManagers();
listReviewers();
listWatchers();

global.konstruction.getSubmittalPackageHistory(submittal[args.index].uid, listHistoryEvents);
global.konstruction.getSubmittalFiles(submittal[args.index].uid, listFiles);