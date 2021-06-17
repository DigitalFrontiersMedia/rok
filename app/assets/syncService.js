// for Alloy this file goes in /assets
Ti.API.info('* syncService Run *');

var packetPoll = null;
var requestTime = 0;
var timeoutLimit = 30;

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
		if (global.historyUsers.indexOf(user.uid) == -1) {
			global.konstruction.getUserInfo(user);
			var myPromise = new Promise(function(resolve, reject) { 
				global.konstruction.getUserInfo(user, resolve);
			});
			myPromise.then(function(userInfo) {
				//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				global.historyUsers[user.uid] = userInfo;
				Ti.App.Properties.setList('historyUsers', global.historyUsers);
			});
		}
	});
};

var cacheHistoryEventUsers = function(results) {
	var historyEvents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	historyEvents.forEach(function(historyEvent) {
		if (global.historyUsers.indexOf(historyEvent.updated_by.uid) == -1) {
			var myPromise = new Promise(function(resolve, reject) { 
				global.konstruction.getUserInfo(historyEvent.updated_by, resolve);
			});
			myPromise.then(function(userInfo) {
				userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
				global.historyUsers[historyEvent.updated_by.uid] = userInfo;
				Ti.App.Properties.setList('historyUsers', global.historyUsers);
			});
		}
	});
};

var iterateRfis = function(results) {
	var rfis = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (rfis) {
		global.setRfis(rfis);
		rfis.forEach(function(rfi) {
			//Ti.API.info('*** Caching info associated with RFI titled ' + rfi.title);
			getAndListAssignedUserInfo(rfi.assigned_to);
			global.konstruction.getRfiPhotos(rfi.uid, cacheRefs);
			global.konstruction.getRfiDocuments(rfi.uid, cacheRefs);
			global.konstruction.getRfiSnapshots(rfi.uid, cacheRefs);
			global.konstruction.getRfiHistoryEvents(rfi.uid, cacheHistoryEventUsers);
		});
	}
};

var cacheDocuments = function(results) {
	var documents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (documents) {
		global.setDocuments(documents);
		cacheRefs(results);
	}
};

var processDrawing = function(results, drawingUid) {
	var drawings = Ti.App.Properties.getList("drawings");
	var drawing = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	if (drawingUid) {
		Ti.API.info('drawingUid = ' + drawingUid);
		Ti.API.info('drawings = ' + JSON.stringify(drawings));
		//Ti.API.info('_.findWhere(drawings, {uid: drawingUid}) = ' + JSON.stringify(_.findWhere(drawings, {uid: drawingUid})));
		_.findWhere(drawings, {uid: drawingUid}).drawing = drawing;
		// drawings.forEach(function(drawingRecord) {
			// if (drawingRecord.uid == drawingUid) {
				// drawingRecord.drawing = drawing;
			// }
		// });
		// for(var idx = 0; idx < drawings.length; idx++) {
			// if (drawings[idx].uid == drawingUid) {
				// drawings[idx].drawing = drawing;
			// }
		// }
		//Ti.API.info('_.findWhere(drawings, {uid: drawingUid}).drawing = ' + JSON.stringify(_.findWhere(drawings, {uid: drawingUid}).drawing));
		global.setDrawings(drawings);
		Ti.API.info('drawings AFTER caching = ' + JSON.stringify(drawings));
	}
	if (drawing.file_url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
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
		global.konstruction.getDrawingPacket(packet.uid, preProcessDrawing, null, drawingUid);
	}, 1000);
};

var cacheDrawings = function(results) {
	var drawings = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	//var cachedDrawings = Ti.App.Properties.getList("drawings");
	Ti.API.info('syncService cacheDrawings konstruction.getDrawings results = ' + JSON.stringify(results));
	Ti.API.info('syncService cacheDrawings konstruction drawings = ' + JSON.stringify(drawings));
	if (drawings) {
		global.setDrawings(drawings);
		drawings.forEach(function(drawing) {
			var data = {};
			data.sheet_uids = [drawing.uid];
			// Merge with saved drawings before re-saving.
			//_.findWhere(drawings, {uid: drawing.uid}).drawing = _.findWhere(cachedDrawings, {uid: drawing.uid}).drawing;
			//global.setDrawings(drawings);
			global.konstruction.createDrawingPacket(JSON.stringify(data), preProcessDrawing, drawing.uid);
		});
	}
};

if (Ti.Network.online && Ti.App.Properties.getBool('configured')) {
	// Iterate through all RFIs, Documents, Drawings, Submittals 
	// to load those, if needed, as well as any sub-items like attached Photos, Documents, etc.
	// TODO:  add updated_since to only update those items that have changed
	global.konstruction.getRfis(iterateRfis);
	global.konstruction.getDocuments(cacheDocuments);
	global.konstruction.getDrawings(cacheDrawings);
	global.konstruction.getSubmittals();
}
