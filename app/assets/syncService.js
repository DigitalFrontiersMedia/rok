// for Alloy this file goes in /assets
Ti.API.info('* syncService Run *');

var packetPoll = null;
var requestTime = 0;
var timeoutLimit = 30;

var syncCompleted = function() {
	setTimeout(function() {
		Alloy.Globals.loading.hide();
		global.show429Error = true;
	}, global.syncCompleteDelay * 1000);
};

var cacheRefs = function(results) {
	var refs = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (refs) {
		refs.forEach(function(ref) {
			//if (ref.url.indexOf('response-content-disposition=attachment') > -1) {
				global.xhr.GET({
					extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
				    url: ref.url,
				    onSuccess: function (results) {
				    },
				    onError: global.onXHRError
				});
			//} else {
				//showRef(e.source.text, e.section.rows[e.index].url);
			//}
		});
	}
};

var getAndListAssignedUserInfo = function(users) {
	users.forEach(function(user) {
		if (!global.historyUsers.hasOwnProperty(user.uid)) {
			//global.konstruction.getUserInfo(user);
			var myPromise = new Promise(function(resolve, reject) { 
				var userKon = new(require("konstruction"))();
				userKon.getUserInfo(user, resolve);
			});
			myPromise.then(function(userInfo) {
				//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				global.historyUsers[user.uid] = userInfo;
				Ti.App.Properties.setObject('historyUsers', global.historyUsers);
			});
		}
	});
};

var cacheHistoryEventUsers = function(results) {
	var historyEvents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	historyEvents.forEach(function(historyEvent) {
		if (!global.historyUsers.hasOwnProperty(historyEvent.updated_by.uid)) {
			var myPromise = new Promise(function(resolve, reject) { 
				var userKon = new(require("konstruction"))();
				userKon.getUserInfo(historyEvent.updated_by, resolve);
			});
			myPromise.then(function(userInfo) {
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				global.historyUsers[historyEvent.updated_by.uid] = userInfo;
				Ti.App.Properties.setObject('historyUsers', global.historyUsers);
			});
		}
	});
};

var iterateRfis = function(results) {
	var rfis = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (rfis) {
		global.setRfis(rfis);
		rfis.forEach(function(rfi) {
			Ti.API.info('*** Caching info associated with RFI titled ' + rfi.title);
			getAndListAssignedUserInfo(rfi.assigned_to);
			var rfiPhotoKon = new(require("konstruction"))();
			rfiPhotoKon.getRfiPhotos(rfi.uid, cacheRefs);
			var rfiDocKon = new(require("konstruction"))();
			rfiDocKon.getRfiDocuments(rfi.uid, cacheRefs);
			var rfiSnapKon = new(require("konstruction"))();
			rfiSnapKon.getRfiSnapshots(rfi.uid, cacheRefs);
			var rfiHistKon = new(require("konstruction"))();
			rfiHistKon.getRfiHistoryEvents(rfi.uid, cacheHistoryEventUsers);
		});
	}
	var docKon = new(require("konstruction"))();
	docKon.getDocuments(cacheDocuments);
};

var cacheSubRefs = function(results) {
	var subFileGroups = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	subFileGroups.forEach(function(subFileGroup) {
		subFileGroup.files.forEach(function(subFile) {
			Ti.API.info('subFile.url = ' + subFile.url);
			global.xhr.GET({
				extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
			    url: subFile.url,
			    onSuccess: function (results) {
			    },
			    onError: global.onXHRError
			});
		});
	});
	syncCompleted();
};

var iterateSubmittals = function(results) {
	//var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	var submittals = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (submittals) {
		submittals.forEach(function(submittal) {
			//Ti.API.info('*** Caching info associated with submittal titled ' + rfi.title);
			getAndListAssignedUserInfo(submittal.submitters);
			getAndListAssignedUserInfo(submittal.managers);
			getAndListAssignedUserInfo(submittal.reviewers);
			getAndListAssignedUserInfo(submittal.watchers);
			var subHistKon = new(require("konstruction"))();
			subHistKon.getSubmittalPackageHistory(submittal.uid);
			var subFileKon = new(require("konstruction"))();
			subFileKon.getSubmittalFiles(submittal.uid, cacheSubRefs);
		});
		//global.setSubmittals(cachedSubmittals);
	}
};

var cacheDocuments = function(results) {
	var documents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (documents) {
		global.setDocuments(documents);
		cacheRefs(results);
	}
	var drawKon = new(require("konstruction"))();
	drawKon.getDrawings(cacheDrawings);
};

var processDrawing = function(results, drawingUid) {
	var drawings = Ti.App.Properties.getList("drawings");
	var drawing = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	if (drawingUid) {
		Ti.API.info('drawingUid = ' + drawingUid);
		Ti.API.info('drawings = ' + JSON.stringify(drawings));
		//Ti.API.info('_.findWhere(drawings, {uid: drawingUid}) = ' + JSON.stringify(_.findWhere(drawings, {uid: drawingUid})));
		_.findWhere(drawings, {uid: drawingUid}).drawing = drawing;
		//Ti.API.info('_.findWhere(drawings, {uid: drawingUid}).drawing = ' + JSON.stringify(_.findWhere(drawings, {uid: drawingUid}).drawing));
		global.setDrawings(drawings);
		Ti.API.info('drawings AFTER caching = ' + JSON.stringify(drawings));
	}
	if (drawing.file_url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			drawingUid: drawingUid,
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
		    url: drawing.file_url,
		    onSuccess: function (results) {
		    },
		    onError: global.onXHRError
		});
	} else {
		//showDrawing(drawingName, drawing.file_url);
	}
};

var preProcessDrawing = function(results, drawingUid) {
	var packet = (results.status == 200 || results.status == 201 || results.status == 304) ? JSON.parse(results.data) : JSON.parse(results.data.text);
	if (requestTime > timeoutLimit) {
		clearTimeout(packetPoll);
		packetPoll = null;
		return;
	}
	// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
	var url = packet.file_url;
	if (url.indexOf('.pdf?') > -1) {
		url = url.split('?')[0];
		if (drawingUid) {
			url = url.split(url.substring(url.lastIndexOf('/') + 1)).join(drawingUid);
		}
	}
	var hashedURL = Titanium.Utils.md5HexDigest(url);
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
	if (packet.status == 'complete' || (results.status == 304 && file.exists()) ) {
		clearTimeout(packetPoll);
		packetPoll = null;
		processDrawing(results, drawingUid);
		return;
	}
	packetPoll = setTimeout(function() {
		requestTime ++;
		var getDrawPacKon = new(require("konstruction"))();
		getDrawPacKon.getDrawingPacket(packet.uid, preProcessDrawing, null, drawingUid);
	}, 1000);
};

var cacheDrawings = function(results) {
	var cachedDrawings = Ti.App.Properties.getList("drawings", []);
	var drawings = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	//var cachedDrawings = Ti.App.Properties.getList("drawings");
	Ti.API.info('syncService cacheDrawings konstruction.getDrawings results = ' + JSON.stringify(results));
	Ti.API.info('syncService cacheDrawings konstruction drawings = ' + JSON.stringify(drawings));
	if (drawings) {
		drawings.forEach(function(drawing) {
			// Merge with saved drawings before re-saving.
			_.findWhere(drawings, {uid: drawing.uid}).drawing = _.findWhere(cachedDrawings, {uid: drawing.uid}) ? _.findWhere(cachedDrawings, {uid: drawing.uid}).drawing : null;
			var data = {};
			data.sheet_uids = [drawing.uid];
			// Merge with saved drawings before re-saving.
			//_.findWhere(drawings, {uid: drawing.uid}).drawing = _.findWhere(cachedDrawings, {uid: drawing.uid}).drawing;
			//global.setDrawings(drawings);
			var createDrawPacKon = new(require("konstruction"))();
			createDrawPacKon.createDrawingPacket(JSON.stringify(data), preProcessDrawing, drawing.uid);
			//global.UTIL.sleep(20000);
		});
		global.setDrawings(drawings);
	}
	var getSubKon = new(require("konstruction"))();
	getSubKon.getSubmittalPackages(iterateSubmittals);
};

global.checkSyncStart = function() {
		if (Ti.App.Properties.getBool('autoAssetCacheSync') || global.manualSync) {
			global.manualSync = false;
			var rfiKon = new(require("konstruction"))();
			rfiKon.getRfis(iterateRfis);
			// Below requests moved to end of each preceeding step to see if it reduces fullReturn variable muddling.
			//global.konstruction.getDocuments(cacheDocuments);
			//global.konstruction.getDrawings(cacheDrawings);
			//global.konstruction.getSubmittals();
		}
};

if (Ti.Network.online && Ti.App.Properties.getBool('configured')) {
	Alloy.Globals.loading.show(L('syncing'));
	global.show429Error = false;
	// Iterate through all RFIs, Documents, Drawings, Submittals 
	// to load those, if needed, as well as any sub-items like attached Photos, Documents, etc.
	// TODO:  add updated_after parameter to only update those items that have changed
	setTimeout(function() {
		if (global.userId) {
			global.getDeviceInfo(null, true);
		}
		global.checkRefresh(global.checkSyncStart);
	}, 100);
} else {
	if (Ti.App.Properties.getBool('configured')) {
		alert(L('device_info_not_synced'));
	}
	Ti.API.info('Not online or not configured so skipping syncService run.');
}
