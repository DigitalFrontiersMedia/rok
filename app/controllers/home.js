// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var rfiActions = $.UI.create('View');
var nonce;

var goWhiteboard = function() {
	Alloy.createController('whiteboard').getView().open();
	global.isHome = false;
};

var sendSMS = function(e) {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	//var option = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export[e.data[0].key];
	var option = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export[e.index];
	var accountSid = "ACaab834c22e540ff5fc703ad65195b686";
	var authToken = "c7b5409b787dd9336939e446156e23e7";
	var fromNumber = "+18138561613";
	var toNumber = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb;
	var text = global.UTIL.cleanString(option.message);
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onreadystatechange = function (e) {
	    if (xhr.readyState === 4) {
	        if (xhr.status === 201) {
	        	if (!nonce) {
	        		nonce = true;
		           Ti.API.info(xhr.responseText);
		           //alert(L('message_success'));
					// Add options to commonView for display.
					var arg = {
						title : L('page_super'),
						container : $.home
					};
					var commonView = Alloy.createController('commonView', arg).getView();
					commonView.getViewById('contentWrapper').add($.UI.create('Label', {text: L('message_success')}));
					$.home.add(commonView);
				}
	        } else {
	           Ti.API.info("Error", JSON.stringify(xhr));
	        }
	    }
	};
	xhr.open("POST", "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json", true);
	// Add Basic Authentication Header (Android doesn't support user:pass@domain.tld format)
	var h = Titanium.Utils.base64encode(accountSid + ':' + authToken);
	xhr.setRequestHeader('Authorization', 'Basic ' + h);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send("From=" + encodeURIComponent(fromNumber) + "&To=" + encodeURIComponent(toNumber) + "&Body=" + encodeURIComponent(text));
};

var pageSuperMenu = function(e) {
	var x = 0;
	var dataRow = null;
	var tableData = [];
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	
	resetRfiActions();
	// Exit early if N/A.
	if (!Ti.Network.online) {
		alert(L('internet_required'));
		return;
	}
	if ((!deviceInfo && !Ti.App.Properties.getInt("deviceIndex")) || (!deviceInfo && !global.userId)) {
		alert(L('device_info_not_synced'));
		return;
	}
	if (!deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export) {
		alert(L('no_options'));
		return;
	}
	
	// Add commonView.
	var arg = {
		title : L('page_super_prompt'),
		container : $.home,
		cancel: true,
		subtitle: L('super_field_label') + '  ' + deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	
	// Create an options table.
	var optionsTable = $.UI.create('TableView', {id: "ListView_pageSuperOptions"});
	optionsTable.addEventListener('click', function(e) {
		$.home.remove(commonView);
		global.homeUIDirty = false;
		sendSMS(e);
	});
	var optionsSection = $.UI.create('TableViewSection', {id: 'listSection'});
	optionsTable.add(optionsSection);

	// Generate options list and add to table.
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export;
	options.forEach(function(option) {
		dataRow = $.UI.create('TableViewRow');
		dataRow.add($.UI.create('Label', {
			text: global.UTIL.cleanString(option.option_label),
			classes: ["choice"]
		}));
		if (x % 2) {
			$.addClass(dataRow, 'zebra');
		}
		x++;
		tableData.push(dataRow);
	});
	optionsTable.data = tableData;

	// Add options to commonView for display.
	commonView.getViewById('contentWrapper').add(optionsTable);
	$.home.add(commonView);
	global.homeUIDirty = true;
};

var displayUploadedSiteInfo = function(title, url) {
	Alloy.Globals.loading.hide();
	// Standardize pdf file urls to not include cache-busting Amazon timestamps in cache filename
	if (url.toLowerCase().indexOf('.pdf?') > -1) {
		url = url.split('?')[0];
	}
    var hashedURL = Titanium.Utils.md5HexDigest(url);
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
    var modal = Alloy.createWidget("com.caffeinalab.titanium.modalwindow", {
		title : 'ROK • ' + title,//file.name,
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
	modal.hideOverlayOption();
};

var displaySiteInfo = function(e) {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	//var option = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export[e.data[0].key];
	var option = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export[e.index];
	Ti.API.info('option = ' + JSON.stringify(option));
	switch (option.bundle) {
		case 'link_component':
			var dialog = require('ti.webdialog');
			if (dialog.isSupported()) {
				dialog.open({
					id: 'optionDisplay',
			    	title: global.UTIL.cleanString(option.option_label),
			    	url: option.link_url.url,
			        tintColor: '#ffffff',
			        barColor: '#ff9200',
			        showTitle: true,
			        animated: true,
			        fadeTransition: true,
			        enableSharing: false
			   });
		    }
			break;
		case 'text_component':
			var win = Alloy.createController('commonWindow').getView();
			win.add(Ti.UI.createWebView({width: '80%', height: '80%', backgroundColor: 'rgba(0,0,0,0.5)', html: '<html><head><style>body {color: #fff;}</style></head><body><h1>' + option.option_label + '</h1>' + option.text + '</body></html>'}));
			win.open();
			break;
		case 'uploaded_component':
		 	var url = global.jDrupal.sitePath() + option.file.media_document;
			if (option.file.media_document.toLowerCase().indexOf('.pdf') == -1) {
				var dialog = require('ti.webdialog');
				if (dialog.isSupported()) {
					dialog.open({
						id: 'docDisplay',
				    	title: option.option_label,
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
			 	Alloy.Globals.loading.show(L('loading'));
			 	global.xhr.GET({
					extraParams: {shouldAuthenticate: false, contentType: '', ttl: global.ttl, responseType: 'blob'},
				    url: url,
				    onSuccess: function (results) {
				    	//Ti.API.info('getDocument = ' + JSON.stringify(results));
				    	displayUploadedSiteInfo(option.option_label, url);
				    },
				    onError: global.onXHRError
				});
			}
			break;
	}
};

var siteInfoMenu = function() {
	var x = 0;
	var dataRow = null;
	var tableData = [];
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	
	resetRfiActions();
	// Exit early if N/A.
	if ((!deviceInfo && !Ti.App.Properties.getInt("deviceIndex")) || (!deviceInfo && !global.userId)) {
		alert(L('device_info_not_synced'));
		return;
	}
	if (!deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export) {
		alert(L('no_options'));
		return;
	}
	
	// Add commonView.
	var arg = {
		title : L('site_info_prompt'),
		container : $.home,
		cancel: true,
		subtitle: L('select_option')
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	
	// Create an options table.
	var optionsTable = $.UI.create('TableView', {id: "ListView_siteInfoOptions"});
	optionsTable.addEventListener('click', function(e) {
		$.home.remove(commonView);
		global.homeUIDirty = false;
		displaySiteInfo(e);
	});
	var optionsSection = $.UI.create('TableViewSection', {id: 'listSection'});
	optionsTable.add(optionsSection);

	// Generate options list and add to table.
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export;
	options.forEach(function(option) {
		dataRow = $.UI.create('TableViewRow');
		dataRow.add($.UI.create('Label', {
			text: global.UTIL.cleanString(option.option_label),
			classes: ["choice"]
		}));
		if (x % 2) {
			$.addClass(dataRow, 'zebra');
		}
		x++;
		tableData.push(dataRow);
	});
	optionsTable.data = tableData;

	// Add options to commonView for display.
	commonView.getViewById('contentWrapper').add(optionsTable);
	global.homeUIDirty = true;
	$.home.add(commonView);
	
	//global.showOptions(L('site_info_prompt'), deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export, $, displaySiteInfo);
};

var resetRfiActions = function() {
	rfiActions.animate(Titanium.UI.createAnimation({opacity:0, duration:250}));
	//$.View_rfis.opacity = 1;
	$.View_rfis.animate(Titanium.UI.createAnimation({opacity:1, duration:250}));	
	$.home.remove(rfiActions);
	global.homeUIDirty = false;
	rfiActions = $.UI.create('View');
};

var rfiRouter = function(e) {
	resetRfiActions();
	switch (e.source.id) {  //parseInt(e.data[0].key)) {
		case 'createRfi':  //0:
			Alloy.createController('rfi_entry').getView().open();
			global.isHome = false;
			break;
		case  'viewRfi':  //1:
			Alloy.createController('rfis').getView().open();
			global.isHome = false;
			break;
	}
};

var goRfis = function() {
	global.homeUIDirty = true;
	Ti.API.info('*** RFIs ***');
	if (!$.home.getViewById('rfiActions')) {
		//Ti.API.info('creating rfiActions');
		rfiActions = $.UI.create('View', {id: 'rfiActions', classes: ['rfiActions'], opacity: 0});
		var createRfi = $.UI.create('Label', {id: 'createRfi', classes: ['rfiActionChoice'], text: L('create_rfi')});
		createRfi.addEventListener('click', rfiRouter);
		rfiActions.add(createRfi);
		var viewRfi = $.UI.create('Label', {id: 'viewRfi', classes: ['rfiActionChoice'], text: L('view_rfi')});
		viewRfi.addEventListener('click', rfiRouter);
		rfiActions.add(viewRfi);
		$.home.add(rfiActions);
		rfiActions.animate(Titanium.UI.createAnimation({opacity:1, duration:250}));
		//$.View_rfis.opacity = 0.7;
		$.View_rfis.animate(Titanium.UI.createAnimation({opacity:0.7, duration:250}));	
		//global.showOptions(L('rfi'), [{option_label: L('create_rfi')}, {option_label: L('view_rfi')}], $, rfiRouter);
	}
};

var goDrawings = function() {
	Ti.API.info('*** DRAWINGS ***');
	resetRfiActions();
	Alloy.createController('drawings').getView().open();
	global.isHome = false;
};

var goSubmittals = function() {
	Ti.API.info('*** SUBMITTALS ***');
	resetRfiActions();
	Alloy.createController('submittals').getView().open();
	global.isHome = false;
};

var goDocuments = function() {
	Ti.API.info('*** DOCUMENTS ***');
	resetRfiActions();
	Alloy.createController('documents').getView().open();
	global.isHome = false;
};

$.home.addEventListener('androidback', function() {
	return;
});

// Cancel RFI Action selection.
$.home.addEventListener('click', function(e) {
	var cancelableButtons = ['View_rfis', 'createRfi', 'viewRfi'];
	if (!cancelableButtons.includes(e.source.id)) {
		resetRfiActions();
	}
});

global.isHome = true;
global.homeUIDirty = false;
global.home = $.getView();
global.adminMode = false;
