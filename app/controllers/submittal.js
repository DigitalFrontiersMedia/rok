// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var submittal = Ti.App.Properties.getList("submittals", []);
var rowIndex = 0;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var listHistoryEvents = function(results) {
	var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	var historyEventLabel;
	var username;
	var dataRow;
	//var tableData = [];
	var historyEvents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('historyEvents = ' + JSON.stringify(historyEvents));
	cachedSubmittals[args.index].subPackage.history =  historyEvents;
	global.setSubmittals(cachedSubmittals);
	historyEvents.forEach(function(historyEvent) {
		if (historyEvent.event_data.uploader_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.uploader_name);
		}
		if (historyEvent.event_data.creator_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.creator_name);
		}
		if (historyEvent.event_type) {
			historyEventLine = historyEvent.event_type.split('_').join(' ');
		}
		historyEventLine = historyEventLine.charAt(0).toUpperCase() + historyEventLine.slice(1);
		historyEventLine += '. | ' + username + ', ' + global.formatDate(historyEvent.created_at) + '.';
		//Ti.API.info('historyEventLine = ' + historyEventLine);
		historyEventLabel = $.UI.create('Label', {text: historyEventLine, classes: ["listLabels"]});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel']});
		dataRow.add(historyEventLabel);
		rowIndex++;
		if (rowIndex % 2) {
			$.addClass(dataRow, 'zebra');
		}
		//tableData.push(dataRow);
		$.ListView_history.appendRow(dataRow);
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
				global.historyUsers[submitter.uid] = userInfo;
				Ti.App.Properties.setObject('historyUsers', global.historyUsers);
				names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
				$.Label_submitterValue.text = names.join(', ');
			});
		} else {
			names.push(global.UTIL.cleanString(global.historyUsers[submitter.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[submitter.uid].last_name));
			$.Label_submitterValue.text = names.join(', ');
		}
	});
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
				global.historyUsers[userInfo.uid] = userInfo;
				Ti.App.Properties.setObject('historyUsers', global.historyUsers);
				names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
				$.Label_managerValue.text = names.join(', ');
			});
		} else {
			names.push(global.UTIL.cleanString(global.historyUsers[manager.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[manager.uid].last_name));
			$.Label_managerValue.text = names.join(', ');
		}
	});
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
				global.historyUsers[userInfo.uid] = userInfo;
				Ti.App.Properties.setObject('historyUsers', global.historyUsers);
				names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
				$.Label_reviewerValue.text = names.join(', ');
			});
		} else {
			names.push(global.UTIL.cleanString(global.historyUsers[reviewer.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[reviewer.uid].last_name));
			$.Label_reviewerValue.text = names.join(', ');
		}
	});
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
				global.historyUsers[userInfo.uid] = userInfo;
				Ti.App.Properties.setObject('historyUsers', global.historyUsers);
				names.push(global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name));
				$.Label_watchingValue.text = names.join(', ');
			});
		} else {
			names.push(global.UTIL.cleanString(global.historyUsers[watcher.uid].first_name) + ' ' + global.UTIL.cleanString(global.historyUsers[watcher.uid].last_name));
			$.Label_watchingValue.text = names.join(', ');
		}
	});
};

$.Label_submittalNumValue.text = submittal[args.index].spec_section;
$.Label_specValue.text = submittal[args.index].spec_section_name;
$.Label_versionValue.text = submittal[args.index].subPackage.version;
$.Label_dueValue.text = submittal[args.index].submittal_due_date;
$.Label_statusValue.text = submittal[args.index].subPackage.transmission_status;

listSubmitters();
listManagers();
listReviewers();
listWatchers();

global.konstruction.getSubmittalPackageHistory(submittal[args.index].subPackage.uid, listHistoryEvents);